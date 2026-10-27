-- Riwayat tujuan Klik ke Chat bersifat pribadi, tidak ikut koleksi keluarga.
begin;
create table public.studio_chat_contacts (
  user_id uuid not null references auth.users(id) on delete cascade,
  target text not null,
  label text not null default '' check (char_length(label) <= 120),
  platform text not null check (platform in ('whatsapp', 'telegram')),
  updated_at timestamptz not null default now(),
  primary key (user_id, target),
  constraint chat_target_valid check (
    target ~ '^\+[1-9][0-9]{6,14}$' or
    (platform = 'telegram' and target ~ '^@[a-z][a-z0-9_]{4,31}$')
  )
);
alter table public.studio_chat_contacts enable row level security;
revoke all on public.studio_chat_contacts from public, anon, authenticated;
grant select, insert, update, delete on public.studio_chat_contacts to authenticated;
create policy chat_owner_select on public.studio_chat_contacts for select to authenticated
  using ((select auth.uid()) = user_id);
create policy chat_owner_insert on public.studio_chat_contacts for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy chat_owner_update on public.studio_chat_contacts for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy chat_owner_delete on public.studio_chat_contacts for delete to authenticated
  using ((select auth.uid()) = user_id);
create index studio_chat_contacts_recent_idx on public.studio_chat_contacts (user_id, updated_at desc);
comment on table public.studio_chat_contacts is 'Tujuan chat pribadi; tanpa pesan, isi percakapan, atau akses keluarga.';
commit;
