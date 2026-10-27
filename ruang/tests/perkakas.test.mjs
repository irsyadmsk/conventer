import test from 'node:test'
import assert from 'node:assert/strict'
import {
  acak,
  acakBatas,
  bagiKelompok,
  peserta,
  csv,
  HURUF,
  SEMAPHORE,
  BRAILLE,
  RADIO,
  braille,
  encode,
  decode,
} from '../src/features/perkakas/core.ts'
import { targetChat, tautanChat } from '../src/features/perkakas/chat-core.ts'
import { createChatStore } from '../src/features/perkakas/chat-store.ts'

test('pengacakan tidak mengubah masukan, setiap nama muncul sekali, kelompok seimbang', () => {
  const names = Array.from({ length: 31 }, (_, i) => `Peserta ${i + 1}`),
    original = [...names]
  assert.deepEqual(
    acak(names, (n) => n - 1),
    original,
  )
  for (let count = 1; count <= 31; count++) {
    const groups = bagiKelompok(names, count),
      sizes = groups.map((g) => g.length)
    assert.equal(groups.length, count)
    assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1)
    assert.deepEqual(groups.flat().sort(), [...names].sort())
  }
  assert.deepEqual(names, original)
  assert.throws(() => bagiKelompok(names, 32))
  assert.throws(() => bagiKelompok(names, 0))
  assert.throws(() => acakBatas(0))
})
test('daftar peserta menolak duplikasi tersamar dan batas berlebihan', () => {
  assert.deepEqual(peserta(' Alya\r\n\nBima '), ['Alya', 'Bima'])
  assert.throws(() => peserta('Alya\nalya'))
  assert.throws(() => peserta(Array(1001).fill('A').join('\n')))
  assert.match(csv([['=1+1', ' @SUM(1)', 'A"B']]), /"'=1\+1"/)
})
test('26 isyarat unik, pola Braille alfabet dasar dan ejaan acuan tersedia', () => {
  assert.equal(new Set(Object.values(SEMAPHORE).map((v) => [...v].sort().join(','))).size, 26)
  assert.deepEqual(SEMAPHORE.A, [0, 1])
  assert.deepEqual(SEMAPHORE.J, [4, 6])
  assert.deepEqual(SEMAPHORE.Y, [3, 6])
  assert.equal(BRAILLE.A, '⠁')
  assert.equal(BRAILLE.Z, '⠵')
  assert.equal(RADIO[0], 'Alfa')
  assert.equal(RADIO[9], 'Juliett')
  assert.equal(braille(braille('Salam dunia'), true), 'salam dunia')
  assert.throws(() => braille('123'))
})
test('empat sandi pulang-pergi; koordinat secara eksplisit menggabungkan I/J', () => {
  for (const kind of ['angka', 'kotak', 'rumput'])
    assert.equal(decode(encode(HURUF + ' SALAM', kind), kind), HURUF + ' SALAM')
  assert.equal(decode(encode('JALAN', 'koordinat'), 'koordinat'), 'IALAN')
  assert.throws(() => encode('HALO!', 'angka'))
  assert.throws(() => decode('99', 'angka'))
})
test('nomor lokal, internasional, Telegram dan isi pesan dibentuk tanpa injeksi URL', () => {
  for (const number of ['0812 3456 7890', '6281234567890', '+62 (812) 3456-7890', '006281234567890'])
    assert.equal(targetChat(number, 'whatsapp'), '+6281234567890')
  assert.equal(targetChat('+1 202 555 0100', 'whatsapp'), '+12025550100')
  assert.equal(targetChat('@Contoh_123', 'telegram'), '@contoh_123')
  assert.equal(targetChat('https://t.me/Contoh_123', 'telegram'), '@contoh_123')
  for (const v of ['javascript:alert(1)', '081234&text=oops', '+01234567', '12345678901234567890', '+'])
    assert.throws(() => targetChat(v, 'whatsapp'))
  assert.equal(
    tautanChat('+6281234567890', 'whatsapp', 'Halo & salam?'),
    'https://wa.me/6281234567890?text=Halo%20%26%20salam%3F',
  )
  assert.equal(tautanChat('+6281234567890', 'telegram'), 'https://t.me/+6281234567890')
  assert.equal(tautanChat('@contoh_123', 'telegram'), 'https://t.me/contoh_123')
  assert.throws(() => tautanChat('@contoh_123', 'whatsapp'))
  assert.throws(() => tautanChat('+6281234567890', 'whatsapp', 'a'.repeat(2001)))
})
const row = (label = 'Toko') => ({
  target: '+6281234567890',
  label,
  platform: 'whatsapp',
  updated_at: '2026-10-27T11:00:00.000Z',
})
test('tab lama menolak menimpa riwayat yang sudah diperbarui tab lain', async () => {
  const local = storage(),
    first = createChatStore(null, local),
    stale = createChatStore(null, local)
  await first.save(row('Tab pertama'))
  await assert.rejects(() => stale.save(row('Tab lama')), /tab lain/)
  assert.equal(createChatStore(null, local).snapshot().rows[0].label, 'Tab pertama')
})
function storage() {
  const map = new Map()
  return {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, v) => map.set(key, v),
  }
}
test('riwayat tamu dan dua akun terpisah, pesan tidak pernah masuk cache', async () => {
  const local = storage(),
    guest = createChatStore(null, local),
    a = createChatStore('A', local),
    b = createChatStore('B', local)
  await guest.save({ ...row(), pesan: 'RAHASIA' })
  await a.save(row('Akun A'))
  assert.equal(b.snapshot().rows.length, 0)
  assert.equal(guest.snapshot().rows[0].label, 'Toko')
  assert.equal(a.snapshot().rows[0].label, 'Akun A')
  assert.ok(![...local.map.values()].join().includes('RAHASIA'))
  await guest.remove(row().target)
  assert.equal(a.snapshot().rows.length, 1)
})
test('luring menyimpan antrean dan penghapusan tidak bangkit kembali setelah sinkron', async () => {
  const local = storage(),
    remote = new Map(),
    backend = {
      async list() {
        return [...remote.values()]
      },
      async save(r) {
        remote.set(r.target, r)
      },
      async remove(k) {
        remote.delete(k)
      },
    }
  const fail = {
    ...backend,
    async save() {
      throw Error('offline')
    },
    async remove() {
      throw Error('offline')
    },
  }
  let store = createChatStore('A', local, fail)
  await store.save(row())
  assert.equal(store.snapshot().status, 'tertunda')
  store.dispose()
  store = createChatStore('A', local, backend)
  await store.sync()
  assert.equal(remote.size, 1)
  assert.equal(store.snapshot().status, 'tersinkron')
  store.dispose()
  store = createChatStore('A', local, fail)
  await store.remove(row().target)
  assert.equal(store.snapshot().rows.length, 0)
  store.dispose()
  store = createChatStore('A', local, backend)
  await store.sync()
  assert.equal(remote.size, 0)
  assert.equal(store.snapshot().rows.length, 0)
})
test('respons akun lama setelah dispose tidak menimpa akun baru atau cache', async () => {
  const local = storage()
  let release
  const backend = {
    list: () =>
      new Promise((resolve) => {
        release = resolve
      }),
    async save() {},
    async remove() {},
  }
  const a = createChatStore('A', local, backend),
    pending = a.sync()
  a.dispose()
  const b = createChatStore('B', local)
  await b.save(row('B'))
  release([row('A')])
  await pending
  assert.equal(b.snapshot().rows[0].label, 'B')
  assert.ok(!local.map.has('ruang:chat:v1:akun:A'))
})
test('cache rusak dipertahankan; kapasitas dan kegagalan penyimpanan terlihat', async () => {
  const local = storage()
  local.map.set('ruang:chat:v1:tamu', 'BROKEN')
  const broken = createChatStore(null, local)
  await assert.rejects(() => broken.save(row()))
  assert.equal(local.map.get('ruang:chat:v1:tamu'), 'BROKEN')
  const denied = createChatStore(null, {
    getItem: () => null,
    setItem: () => {
      throw Error('quota')
    },
  })
  await denied.save(row())
  assert.match(denied.snapshot().warning, /penuh/)
  const full = createChatStore(null, storage())
  for (let i = 0; i < 100; i++)
    await full.save({
      ...row(),
      target: '+62812345' + String(i).padStart(4, '0'),
    })
  await assert.rejects(() => full.save(row()), /100/)
})
