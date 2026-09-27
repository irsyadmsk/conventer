-- =====================================================================
-- Ruang (app.irsyads.com) — skema inti.
--
-- Semua tabel berawalan studio_ agar terpisah dari tabel situs & LMS
-- irsyads. Akun memakai auth.users yang sama (SSO dengan irsyads.com).
--
--   studio_families         satu keluarga, punya kode undangan
--   studio_family_members   anggota + peran (owner | admin | anggota | anak)
--   studio_items            koleksi tersinkron: cuplikan, modul ajar APMA,
--                           resep otomatisasi, riwayat kalkulator
--   studio_activity         jejak pemakaian alat (tanpa isi teks) untuk laporan
--   studio_reports          laporan mingguan otomatis (pribadi & keluarga)
--   studio_preferences      tema, palet, suara — ikut pindah perangkat
--
-- Satu akun hanya boleh berada di satu keluarga.
-- =====================================================================

create table if not exists public.studio_families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  owner_id uuid not null references auth.users(id) on delete cascade,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.studio_family_members (
  family_id uuid not null references public.studio_families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'anggota' check (role in ('owner','admin','anggota','anak')),
  display_name text not null default 'Anggota',
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id),
  unique (user_id)
);

create table if not exists public.studio_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  family_id uuid references public.studio_families(id) on delete set null,
  kind text not null check (kind in ('snippet','apma','pipeline','calc')),
  tool text not null default 'umum',
  title text not null default 'Tanpa judul' check (char_length(title) <= 200),
  content jsonb not null default '{}'::jsonb,
  pinned boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists studio_items_owner_idx on public.studio_items (owner_id, updated_at desc);
create index if not exists studio_items_family_idx on public.studio_items (family_id, updated_at desc) where family_id is not null;

create table if not exists public.studio_activity (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  family_id uuid references public.studio_families(id) on delete set null,
  tool text not null check (char_length(tool) <= 40),
  action text not null check (char_length(action) <= 40),
  chars integer not null default 0 check (chars >= 0),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists studio_activity_user_idx on public.studio_activity (user_id, created_at desc);
create index if not exists studio_activity_family_idx on public.studio_activity (family_id, created_at desc) where family_id is not null;

create table if not exists public.studio_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  family_id uuid references public.studio_families(id) on delete cascade,
  scope text not null check (scope in ('pribadi','keluarga')),
  period_start date not null,
  period_end date not null,
  data jsonb not null default '{}'::jsonb,
  summary text,
  created_at timestamptz not null default now(),
  check ((scope = 'pribadi' and user_id is not null) or (scope = 'keluarga' and family_id is not null))
);
create unique index if not exists studio_reports_pribadi_uniq on public.studio_reports (user_id, period_start) where scope = 'pribadi';
create unique index if not exists studio_reports_keluarga_uniq on public.studio_reports (family_id, period_start) where scope = 'keluarga';

create table if not exists public.studio_preferences (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Pembantu (security definer: dipakai kebijakan RLS tanpa rekursi)
-- ---------------------------------------------------------------------
create or replace function public.studio_my_family()
returns uuid language sql stable security definer set search_path = public, pg_catalog as $$
  select family_id from public.studio_family_members where user_id = auth.uid()
$$;

create or replace function public.studio_family_role(fid uuid)
returns text language sql stable security definer set search_path = public, pg_catalog as $$
  select role from public.studio_family_members where family_id = fid and user_id = auth.uid()
$$;

create or replace function public.studio_touch_updated_at()
returns trigger language plpgsql set search_path = public, pg_catalog as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists studio_items_touch on public.studio_items;
create trigger studio_items_touch before update on public.studio_items
  for each row execute function public.studio_touch_updated_at();
drop trigger if exists studio_prefs_touch on public.studio_preferences;
create trigger studio_prefs_touch before update on public.studio_preferences
  for each row execute function public.studio_touch_updated_at();

-- Aktivitas otomatis diberi family_id pemiliknya supaya laporan keluarga
-- tidak bergantung pada klien.
create or replace function public.studio_activity_stamp()
returns trigger language plpgsql security definer set search_path = public, pg_catalog as $$
begin
  new.user_id := auth.uid();
  new.family_id := (select family_id from public.studio_family_members where user_id = new.user_id);
  return new;
end $$;
drop trigger if exists studio_activity_stamp on public.studio_activity;
create trigger studio_activity_stamp before insert on public.studio_activity
  for each row execute function public.studio_activity_stamp();

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.studio_families enable row level security;
alter table public.studio_family_members enable row level security;
alter table public.studio_items enable row level security;
alter table public.studio_activity enable row level security;
alter table public.studio_reports enable row level security;
alter table public.studio_preferences enable row level security;

-- Keluarga & anggota: hanya dibaca sesama anggota. Perubahan lewat RPC.
drop policy if exists studio_families_read on public.studio_families;
create policy studio_families_read on public.studio_families for select to authenticated
  using (id = (select public.studio_my_family()));

drop policy if exists studio_members_read on public.studio_family_members;
create policy studio_members_read on public.studio_family_members for select to authenticated
  using (family_id = (select public.studio_my_family()));

-- Koleksi: milik sendiri, atau dibagikan ke keluarga sendiri.
drop policy if exists studio_items_read on public.studio_items;
create policy studio_items_read on public.studio_items for select to authenticated
  using (owner_id = (select auth.uid()) or (family_id is not null and family_id = (select public.studio_my_family())));

drop policy if exists studio_items_insert on public.studio_items;
create policy studio_items_insert on public.studio_items for insert to authenticated
  with check (owner_id = (select auth.uid()) and (family_id is null or family_id = (select public.studio_my_family())));

-- Item bersama boleh disunting anggota dewasa; "anak" hanya menyunting miliknya.
drop policy if exists studio_items_update on public.studio_items;
create policy studio_items_update on public.studio_items for update to authenticated
  using (
    owner_id = (select auth.uid())
    or (family_id is not null and family_id = (select public.studio_my_family())
        and public.studio_family_role(family_id) in ('owner','admin','anggota'))
  )
  with check (family_id is null or family_id = (select public.studio_my_family()));

drop policy if exists studio_items_delete on public.studio_items;
create policy studio_items_delete on public.studio_items for delete to authenticated
  using (
    owner_id = (select auth.uid())
    or (family_id is not null and family_id = (select public.studio_my_family())
        and public.studio_family_role(family_id) in ('owner','admin'))
  );

-- Aktivitas: tulis milik sendiri; baca milik sendiri atau sekeluarga.
drop policy if exists studio_activity_insert on public.studio_activity;
create policy studio_activity_insert on public.studio_activity for insert to authenticated
  with check (true);
drop policy if exists studio_activity_read on public.studio_activity;
create policy studio_activity_read on public.studio_activity for select to authenticated
  using (user_id = (select auth.uid()) or (family_id is not null and family_id = (select public.studio_my_family())));

-- Laporan: pribadi milik sendiri; laporan keluarga dibaca sesama anggota.
drop policy if exists studio_reports_read on public.studio_reports;
create policy studio_reports_read on public.studio_reports for select to authenticated
  using (user_id = (select auth.uid()) or (scope = 'keluarga' and family_id = (select public.studio_my_family())));
drop policy if exists studio_reports_update on public.studio_reports;
create policy studio_reports_update on public.studio_reports for update to authenticated
  using (user_id = (select auth.uid()) or (scope = 'keluarga' and family_id = (select public.studio_my_family())));

drop policy if exists studio_prefs_all on public.studio_preferences;
create policy studio_prefs_all on public.studio_preferences for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- RPC keluarga
-- ---------------------------------------------------------------------
create or replace function public.studio_new_invite_code()
returns text language plpgsql volatile set search_path = public, extensions, pg_catalog as $$
declare
  abjad constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  kode text;
begin
  loop
    kode := '';
    for i in 1..6 loop
      kode := kode || substr(abjad, 1 + (get_byte(gen_random_bytes(1), 0) % length(abjad)), 1);
    end loop;
    exit when not exists (select 1 from public.studio_families where invite_code = kode);
  end loop;
  return kode;
end $$;

create or replace function public.studio_create_family(p_name text, p_display text)
returns public.studio_families language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  fam public.studio_families;
begin
  if auth.uid() is null then raise exception 'Belum masuk.'; end if;
  if exists (select 1 from public.studio_family_members where user_id = auth.uid()) then
    raise exception 'Akun ini sudah tergabung dalam keluarga. Keluar dulu untuk membuat yang baru.';
  end if;
  insert into public.studio_families (name, owner_id, invite_code)
  values (trim(p_name), auth.uid(), public.studio_new_invite_code())
  returning * into fam;
  insert into public.studio_family_members (family_id, user_id, role, display_name)
  values (fam.id, auth.uid(), 'owner', coalesce(nullif(trim(p_display), ''), 'Pemilik'));
  update public.studio_activity set family_id = fam.id where user_id = auth.uid() and family_id is null;
  return fam;
end $$;

create or replace function public.studio_join_family(p_code text, p_display text)
returns public.studio_families language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  fam public.studio_families;
begin
  if auth.uid() is null then raise exception 'Belum masuk.'; end if;
  if exists (select 1 from public.studio_family_members where user_id = auth.uid()) then
    raise exception 'Akun ini sudah tergabung dalam keluarga.';
  end if;
  select * into fam from public.studio_families where invite_code = upper(trim(p_code));
  if fam.id is null then raise exception 'Kode undangan tidak ditemukan.'; end if;
  if (select count(*) from public.studio_family_members where family_id = fam.id) >= 12 then
    raise exception 'Keluarga ini sudah penuh (maksimal 12 anggota).';
  end if;
  insert into public.studio_family_members (family_id, user_id, role, display_name)
  values (fam.id, auth.uid(), 'anggota', coalesce(nullif(trim(p_display), ''), 'Anggota'));
  update public.studio_activity set family_id = fam.id where user_id = auth.uid() and family_id is null;
  return fam;
end $$;

create or replace function public.studio_leave_family()
returns void language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  fid uuid := public.studio_my_family();
  pewaris uuid;
begin
  if fid is null then return; end if;
  -- Item bersama milik yang keluar kembali menjadi pribadi.
  update public.studio_items set family_id = null where owner_id = auth.uid() and family_id = fid;
  delete from public.studio_family_members where family_id = fid and user_id = auth.uid();
  if (select owner_id from public.studio_families where id = fid) = auth.uid() then
    select user_id into pewaris from public.studio_family_members
      where family_id = fid order by (role = 'admin') desc, (role = 'anak') asc, joined_at asc limit 1;
    if pewaris is null then
      delete from public.studio_families where id = fid;
    else
      update public.studio_families set owner_id = pewaris where id = fid;
      update public.studio_family_members set role = 'owner' where family_id = fid and user_id = pewaris;
    end if;
  end if;
end $$;

create or replace function public.studio_set_member_role(p_user uuid, p_role text)
returns void language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  fid uuid := public.studio_my_family();
  saya text := public.studio_family_role(fid);
begin
  if saya not in ('owner','admin') then raise exception 'Hanya pemilik atau admin yang dapat mengubah peran.'; end if;
  if p_role not in ('admin','anggota','anak') then raise exception 'Peran tidak dikenal.'; end if;
  if p_user = (select owner_id from public.studio_families where id = fid) then
    raise exception 'Peran pemilik tidak dapat diubah.';
  end if;
  if saya = 'admin' and p_role = 'admin' then raise exception 'Hanya pemilik yang dapat mengangkat admin.'; end if;
  update public.studio_family_members set role = p_role where family_id = fid and user_id = p_user;
end $$;

create or replace function public.studio_remove_member(p_user uuid)
returns void language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  fid uuid := public.studio_my_family();
  saya text := public.studio_family_role(fid);
  dia text;
begin
  if saya not in ('owner','admin') then raise exception 'Hanya pemilik atau admin yang dapat mengeluarkan anggota.'; end if;
  select role into dia from public.studio_family_members where family_id = fid and user_id = p_user;
  if dia is null then raise exception 'Anggota tidak ditemukan.'; end if;
  if dia = 'owner' or (dia = 'admin' and saya <> 'owner') then raise exception 'Anda tidak dapat mengeluarkan anggota ini.'; end if;
  update public.studio_items set family_id = null where owner_id = p_user and family_id = fid;
  delete from public.studio_family_members where family_id = fid and user_id = p_user;
end $$;

create or replace function public.studio_update_family(p_name text)
returns void language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  fid uuid := public.studio_my_family();
begin
  if public.studio_family_role(fid) not in ('owner','admin') then raise exception 'Tidak diizinkan.'; end if;
  update public.studio_families set name = trim(p_name) where id = fid;
end $$;

create or replace function public.studio_update_display_name(p_display text)
returns void language plpgsql security definer set search_path = public, pg_catalog as $$
begin
  update public.studio_family_members set display_name = coalesce(nullif(trim(p_display), ''), display_name)
  where user_id = auth.uid();
end $$;

create or replace function public.studio_rotate_invite()
returns text language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  fid uuid := public.studio_my_family();
  kode text;
begin
  if public.studio_family_role(fid) not in ('owner','admin') then raise exception 'Tidak diizinkan.'; end if;
  kode := public.studio_new_invite_code();
  update public.studio_families set invite_code = kode where id = fid;
  return kode;
end $$;

-- ---------------------------------------------------------------------
-- Ringkasan laporan (dipakai halaman Laporan & pembuat laporan mingguan)
-- ---------------------------------------------------------------------
create or replace function public.studio_summary_for(p_user uuid, p_family uuid, p_from timestamptz, p_to timestamptz)
returns jsonb language sql stable security definer set search_path = public, pg_catalog as $$
  with a as (
    select * from public.studio_activity
    where created_at >= p_from and created_at < p_to
      and (case when p_family is not null then family_id = p_family else user_id = p_user end)
  )
  select jsonb_build_object(
    'total', (select count(*) from a),
    'chars', (select coalesce(sum(chars), 0) from a),
    'active_days', (select count(distinct (created_at at time zone 'Asia/Jakarta')::date) from a),
    'by_tool', coalesce((select jsonb_agg(t order by t.n desc) from (select tool, count(*) n, sum(chars) chars from a group by tool) t), '[]'::jsonb),
    'by_action', coalesce((select jsonb_agg(t order by t.n desc) from (select tool, action, count(*) n from a group by tool, action order by n desc limit 12) t), '[]'::jsonb),
    'by_day', coalesce((select jsonb_agg(t order by t.day) from (select (created_at at time zone 'Asia/Jakarta')::date as day, count(*) n from a group by 1) t), '[]'::jsonb),
    'by_hour', coalesce((select jsonb_agg(t order by t.hour) from (select extract(hour from created_at at time zone 'Asia/Jakarta')::int as hour, count(*) n from a group by 1) t), '[]'::jsonb),
    'by_member', coalesce((select jsonb_agg(t order by t.n desc) from (
        select a.user_id, coalesce(m.display_name, 'Saya') as name, count(*) n
        from a left join public.studio_family_members m on m.user_id = a.user_id
        group by a.user_id, m.display_name) t), '[]'::jsonb),
    'items_created', (select count(*) from public.studio_items i
        where i.created_at >= p_from and i.created_at < p_to
          and (case when p_family is not null then i.family_id = p_family else i.owner_id = p_user end))
  )
$$;
revoke all on function public.studio_summary_for(uuid, uuid, timestamptz, timestamptz) from public, anon, authenticated;

create or replace function public.studio_report_summary(p_from timestamptz, p_to timestamptz, p_scope text default 'pribadi')
returns jsonb language plpgsql stable security definer set search_path = public, pg_catalog as $$
declare
  fid uuid := public.studio_my_family();
begin
  if auth.uid() is null then raise exception 'Belum masuk.'; end if;
  if p_scope = 'keluarga' then
    if fid is null then raise exception 'Anda belum tergabung dalam keluarga.'; end if;
    return public.studio_summary_for(null, fid, p_from, p_to);
  end if;
  return public.studio_summary_for(auth.uid(), null, p_from, p_to);
end $$;

-- Laporan mingguan otomatis (Senin 00:10 WIB) untuk minggu yang baru lewat.
create or replace function public.studio_generate_weekly_reports(p_week_start date default null)
returns integer language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  mulai date := coalesce(p_week_start, (date_trunc('week', (now() at time zone 'Asia/Jakarta')) - interval '7 days')::date);
  akhir date := mulai + 7;
  dari timestamptz := (mulai::timestamp at time zone 'Asia/Jakarta');
  sampai timestamptz := (akhir::timestamp at time zone 'Asia/Jakarta');
  r record;
  n integer := 0;
begin
  for r in select distinct user_id from public.studio_activity where created_at >= dari and created_at < sampai loop
    insert into public.studio_reports (user_id, scope, period_start, period_end, data)
    values (r.user_id, 'pribadi', mulai, akhir - 1, public.studio_summary_for(r.user_id, null, dari, sampai))
    on conflict do nothing;
    n := n + 1;
  end loop;
  for r in select distinct family_id from public.studio_activity where family_id is not null and created_at >= dari and created_at < sampai loop
    insert into public.studio_reports (family_id, scope, period_start, period_end, data)
    values (r.family_id, 'keluarga', mulai, akhir - 1, public.studio_summary_for(null, r.family_id, dari, sampai))
    on conflict do nothing;
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function public.studio_generate_weekly_reports(date) from public, anon, authenticated;

-- Klien boleh meminta laporan minggu lalu dibuat sekarang (mis. sebelum cron jalan).
create or replace function public.studio_ensure_last_week_report()
returns void language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  mulai date := (date_trunc('week', (now() at time zone 'Asia/Jakarta')) - interval '7 days')::date;
  dari timestamptz := (mulai::timestamp at time zone 'Asia/Jakarta');
  sampai timestamptz := ((mulai + 7)::timestamp at time zone 'Asia/Jakarta');
  fid uuid := public.studio_my_family();
begin
  if auth.uid() is null then return; end if;
  insert into public.studio_reports (user_id, scope, period_start, period_end, data)
  values (auth.uid(), 'pribadi', mulai, mulai + 6, public.studio_summary_for(auth.uid(), null, dari, sampai))
  on conflict do nothing;
  if fid is not null then
    insert into public.studio_reports (family_id, scope, period_start, period_end, data)
    values (fid, 'keluarga', mulai, mulai + 6, public.studio_summary_for(null, fid, dari, sampai))
    on conflict do nothing;
  end if;
end $$;

-- Hak eksekusi: hanya pengguna yang masuk.
do $$
declare f text;
begin
  foreach f in array array[
    'studio_my_family()', 'studio_family_role(uuid)', 'studio_create_family(text, text)',
    'studio_join_family(text, text)', 'studio_leave_family()', 'studio_set_member_role(uuid, text)',
    'studio_remove_member(uuid)', 'studio_update_family(text)', 'studio_update_display_name(text)',
    'studio_rotate_invite()', 'studio_report_summary(timestamptz, timestamptz, text)',
    'studio_ensure_last_week_report()'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
revoke all on function public.studio_new_invite_code() from public, anon, authenticated;
revoke all on function public.studio_activity_stamp() from public, anon, authenticated;

grant select, insert, update, delete on public.studio_items to authenticated;
grant select, insert on public.studio_activity to authenticated;
grant select, update on public.studio_reports to authenticated;
grant select on public.studio_families, public.studio_family_members to authenticated;
grant select, insert, update on public.studio_preferences to authenticated;

-- Realtime untuk sinkron antar perangkat & antar anggota.
do $$
begin
  begin alter publication supabase_realtime add table public.studio_items; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.studio_family_members; exception when duplicate_object then null; end;
end $$;

-- Jadwal laporan mingguan.
select cron.unschedule(jobid) from cron.job where jobname = 'ruang-laporan-mingguan';
select cron.schedule('ruang-laporan-mingguan', '10 17 * * 0', $$select public.studio_generate_weekly_reports()$$);
