// PostgreSQL tertanam untuk pengujian SQL lokal; bukan bukti Supabase produksi.
// Pasang @electric-sql/pglite@0.5.12 di folder uji, lalu set PGLITE_MODULE
// ke file URL dist/index.js apabila paket berada di luar node_modules proyek.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite')
const db = new PGlite()
try {
  await db.exec(`create role anon; create role authenticated;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth to anon,authenticated;
    insert into auth.users values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');`)
  await db.exec(
    await readFile(new URL('../supabase/migrations/20261027111232_toolkit_chat_history.sql', import.meta.url), 'utf8'),
  )
  const a = '11111111-1111-4111-8111-111111111111',
    b = '22222222-2222-4222-8222-222222222222'
  await db.exec(`set role authenticated; set request.jwt.claim.sub='${a}';`)
  await db.query(
    `insert into public.studio_chat_contacts(user_id,target,label,platform) values($1,'+6281234567890','Toko A','whatsapp')`,
    [a],
  )
  await assert.rejects(
    db.query(
      `insert into public.studio_chat_contacts(user_id,target,platform) values($1,'+6281234567891','whatsapp')`,
      [b],
    ),
    /row-level security/,
  )
  await assert.rejects(db.query(`update public.studio_chat_contacts set user_id=$1`, [b]), /row-level security/)
  await assert.rejects(
    db.query(
      `insert into public.studio_chat_contacts(user_id,target,platform) values($1,'javascript:alert(1)','telegram')`,
      [a],
    ),
    /chat_target_valid/,
  )
  await db.exec(`set request.jwt.claim.sub='${b}';`)
  assert.equal((await db.query('select * from public.studio_chat_contacts')).rows.length, 0)
  await db.query(`delete from public.studio_chat_contacts where user_id=$1`, [a])
  await db.exec(`set request.jwt.claim.sub='${a}';`)
  assert.equal((await db.query('select * from public.studio_chat_contacts')).rows.length, 1)
  await db.exec('reset role; set role anon;')
  await assert.rejects(db.query('select * from public.studio_chat_contacts'), /permission denied/)
  await assert.rejects(db.query('truncate public.studio_chat_contacts'), /permission denied/)
  await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub='${a}';`)
  await db.query(`delete from public.studio_chat_contacts where user_id=$1`, [a])
  assert.equal((await db.query('select * from public.studio_chat_contacts')).rows.length, 0)
  console.log(
    'PASS: owner CRUD, cross-account isolation, owner transfer rejection, target validation, anon denial, truncate denial',
  )
} finally {
  await db.close()
}
