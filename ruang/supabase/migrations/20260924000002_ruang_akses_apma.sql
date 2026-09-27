-- =====================================================================
-- Ruang — Modul Ajar (APMA) menjadi fitur privat.
--
-- Hanya admin irsyads (tabel public.admins) dan pengguna yang disetujui
-- admin yang boleh membuat/menyunting modul dan memakai AI APMA.
-- Penguncian ada di RLS studio_items dan di Edge Function ruang-ai,
-- bukan sekadar di tampilan.
-- =====================================================================

create table if not exists public.studio_izin_fitur (
  user_id uuid not null references auth.users(id) on delete cascade,
  fitur text not null check (fitur in ('apma')),
  status text not null default 'menunggu' check (status in ('menunggu', 'disetujui', 'ditolak', 'dicabut')),
  alasan text check (char_length(alasan) <= 500),
  email text,
  nama text,
  diminta_at timestamptz not null default now(),
  diputuskan_at timestamptz,
  diputuskan_oleh uuid references auth.users(id) on delete set null,
  primary key (user_id, fitur)
);

alter table public.studio_izin_fitur enable row level security;

create or replace function public.studio_is_admin()
returns boolean language sql stable security definer set search_path = public, pg_catalog as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

create or replace function public.studio_boleh_fitur(p_fitur text)
returns boolean language sql stable security definer set search_path = public, pg_catalog as $$
  select public.studio_is_admin()
      or exists (select 1 from public.studio_izin_fitur
                 where user_id = auth.uid() and fitur = p_fitur and status = 'disetujui')
$$;

drop policy if exists studio_izin_baca on public.studio_izin_fitur;
create policy studio_izin_baca on public.studio_izin_fitur for select to authenticated
  using (user_id = (select auth.uid()) or (select public.studio_is_admin()));

-- Modul ajar hanya boleh ditulis oleh yang berizin.
drop policy if exists studio_items_insert on public.studio_items;
create policy studio_items_insert on public.studio_items for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and (family_id is null or family_id = (select public.studio_my_family()))
    and (kind <> 'apma' or public.studio_boleh_fitur('apma'))
  );

drop policy if exists studio_items_update on public.studio_items;
create policy studio_items_update on public.studio_items for update to authenticated
  using (
    (owner_id = (select auth.uid())
     or (family_id is not null and family_id = (select public.studio_my_family())
         and public.studio_family_role(family_id) in ('owner','admin','anggota')))
    and (kind <> 'apma' or public.studio_boleh_fitur('apma'))
  )
  with check (family_id is null or family_id = (select public.studio_my_family()));

-- Status akses untuk tampilan.
create or replace function public.studio_status_akses(p_fitur text)
returns jsonb language plpgsql stable security definer set search_path = public, pg_catalog as $$
declare
  r public.studio_izin_fitur;
begin
  if auth.uid() is null then return jsonb_build_object('boleh', false, 'admin', false, 'status', null); end if;
  select * into r from public.studio_izin_fitur where user_id = auth.uid() and fitur = p_fitur;
  return jsonb_build_object(
    'admin', public.studio_is_admin(),
    'boleh', public.studio_boleh_fitur(p_fitur),
    'status', r.status,
    'diminta_at', r.diminta_at,
    'alasan', r.alasan
  );
end $$;

create or replace function public.studio_ajukan_akses(p_fitur text, p_alasan text)
returns void language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  u auth.users;
begin
  if auth.uid() is null then raise exception 'Belum masuk.'; end if;
  if p_fitur <> 'apma' then raise exception 'Fitur tidak dikenal.'; end if;
  if public.studio_boleh_fitur(p_fitur) then return; end if;
  select * into u from auth.users where id = auth.uid();
  insert into public.studio_izin_fitur (user_id, fitur, status, alasan, email, nama, diminta_at)
  values (auth.uid(), p_fitur, 'menunggu', left(trim(p_alasan), 500), lower(u.email),
          coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)), now())
  on conflict (user_id, fitur) do update
    set status = 'menunggu', alasan = excluded.alasan, diminta_at = now(),
        diputuskan_at = null, diputuskan_oleh = null
    where public.studio_izin_fitur.status in ('ditolak', 'dicabut', 'menunggu');
end $$;

create or replace function public.studio_putuskan_akses(p_user uuid, p_fitur text, p_status text)
returns void language plpgsql security definer set search_path = public, pg_catalog as $$
begin
  if not public.studio_is_admin() then raise exception 'Hanya admin yang dapat memutuskan akses.'; end if;
  if p_status not in ('disetujui', 'ditolak', 'dicabut') then raise exception 'Status tidak dikenal.'; end if;
  update public.studio_izin_fitur
     set status = p_status, diputuskan_at = now(), diputuskan_oleh = auth.uid()
   where user_id = p_user and fitur = p_fitur;
  if not found then raise exception 'Permintaan tidak ditemukan.'; end if;
end $$;

-- Admin memberi akses langsung lewat email (tanpa menunggu permintaan).
create or replace function public.studio_beri_akses_email(p_email text, p_fitur text)
returns void language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  u auth.users;
begin
  if not public.studio_is_admin() then raise exception 'Hanya admin yang dapat memberi akses.'; end if;
  if p_fitur <> 'apma' then raise exception 'Fitur tidak dikenal.'; end if;
  select * into u from auth.users where lower(email) = lower(trim(p_email));
  if u.id is null then raise exception 'Belum ada akun dengan email itu. Minta orangnya mendaftar dulu.'; end if;
  insert into public.studio_izin_fitur (user_id, fitur, status, email, nama, diminta_at, diputuskan_at, diputuskan_oleh)
  values (u.id, p_fitur, 'disetujui', lower(u.email),
          coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)), now(), now(), auth.uid())
  on conflict (user_id, fitur) do update
    set status = 'disetujui', diputuskan_at = now(), diputuskan_oleh = auth.uid();
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'studio_is_admin()', 'studio_boleh_fitur(text)', 'studio_status_akses(text)',
    'studio_ajukan_akses(text, text)', 'studio_putuskan_akses(uuid, text, text)',
    'studio_beri_akses_email(text, text)'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

grant select on public.studio_izin_fitur to authenticated;
