import { Ciphers, Codecs, DevCase, Hashes, Sunda } from '@/legacy'

/**
 * Daftar transformasi teks yang dipakai bersama oleh Codec dan Otomatisasi.
 * Setiap langkah murni (teks → teks), kecuali hash yang asinkron.
 */
export type Param = { kunci: string; label: string; jenis: 'angka' | 'teks' | 'pilihan'; bawaan: string | number; pilihan?: { id: string; label: string }[] }

export type Transformasi = {
  id: string
  label: string
  grup: 'Pengodean' | 'Aksara' | 'Sandi' | 'Huruf' | 'Rapikan' | 'Hash'
  jalankan: (t: string, p: Record<string, string | number>) => string | Promise<string>
  param?: Param[]
  /** id kebalikan (untuk tombol tukar). */
  balik?: string
}

const codec = (id: string, label: string, grup: Transformasi['grup'] = 'Pengodean'): Transformasi[] => [
  { id: `${id}:enc`, label: `${label} · encode`, grup, jalankan: (t) => Codecs[id].encode(t), balik: `${id}:dec` },
  { id: `${id}:dec`, label: `${label} · decode`, grup, jalankan: (t) => Codecs[id].decode(t), balik: `${id}:enc` },
]

export const TRANSFORMASI: Transformasi[] = [
  ...codec('base64', 'Base64'),
  ...codec('base32', 'Base32'),
  ...codec('url', 'URL'),
  ...codec('binary', 'Biner'),
  ...codec('hex', 'Heksadesimal'),
  ...codec('octal', 'Oktal'),
  ...codec('ascii', 'Desimal ASCII'),
  ...codec('unicode', 'Unicode escape'),
  ...codec('morse', 'Morse'),
  ...codec('nato', 'NATO fonetik'),
  { id: 'l2s', label: 'Latin → Aksara Sunda', grup: 'Aksara', jalankan: (t) => Sunda.latinToSunda(t), balik: 's2l' },
  { id: 's2l', label: 'Aksara Sunda → Latin', grup: 'Aksara', jalankan: (t) => Sunda.sundaToLatin(t), balik: 'l2s' },
  {
    id: 'caesar:enc',
    label: 'Caesar · enkripsi',
    grup: 'Sandi',
    jalankan: (t, p) => Ciphers.caesar.encode(t, Number(p.geser ?? 3)),
    param: [{ kunci: 'geser', label: 'Geser', jenis: 'angka', bawaan: 3 }],
    balik: 'caesar:dec',
  },
  {
    id: 'caesar:dec',
    label: 'Caesar · dekripsi',
    grup: 'Sandi',
    jalankan: (t, p) => Ciphers.caesar.decode(t, Number(p.geser ?? 3)),
    param: [{ kunci: 'geser', label: 'Geser', jenis: 'angka', bawaan: 3 }],
    balik: 'caesar:enc',
  },
  {
    id: 'vigenere:enc',
    label: 'Vigenère · enkripsi',
    grup: 'Sandi',
    jalankan: (t, p) => Ciphers.vigenere.encode(t, String(p.kunci ?? 'RUANG')),
    param: [{ kunci: 'kunci', label: 'Kata kunci', jenis: 'teks', bawaan: 'RUANG' }],
    balik: 'vigenere:dec',
  },
  {
    id: 'vigenere:dec',
    label: 'Vigenère · dekripsi',
    grup: 'Sandi',
    jalankan: (t, p) => Ciphers.vigenere.decode(t, String(p.kunci ?? 'RUANG')),
    param: [{ kunci: 'kunci', label: 'Kata kunci', jenis: 'teks', bawaan: 'RUANG' }],
    balik: 'vigenere:enc',
  },
  { id: 'rot13', label: 'ROT-13', grup: 'Sandi', jalankan: (t) => Codecs.rot13.encode(t), balik: 'rot13' },
  { id: 'atbash', label: 'Atbash', grup: 'Sandi', jalankan: (t) => Codecs.atbash.encode(t), balik: 'atbash' },
  { id: 'upper', label: 'HURUF BESAR', grup: 'Huruf', jalankan: (t) => t.toLocaleUpperCase('id') },
  { id: 'lower', label: 'huruf kecil', grup: 'Huruf', jalankan: (t) => t.toLocaleLowerCase('id') },
  { id: 'title', label: 'Judul Kalimat', grup: 'Huruf', jalankan: (t) => DevCase.CaseConverter.titleCase(t) },
  { id: 'sentence', label: 'Kalimat biasa', grup: 'Huruf', jalankan: (t) => DevCase.CaseConverter.sentenceCase(t) },
  { id: 'camel', label: 'camelCase', grup: 'Huruf', jalankan: (t) => DevCase.CaseConverter.camelCase(t) },
  { id: 'snake', label: 'snake_case', grup: 'Huruf', jalankan: (t) => DevCase.CaseConverter.snakeCase(t) },
  { id: 'kebab', label: 'kebab-case', grup: 'Huruf', jalankan: (t) => DevCase.CaseConverter.kebabCase(t) },
  { id: 'random', label: 'hUrUf AcAk', grup: 'Huruf', jalankan: (t) => Codecs.randomcase.encode(t) },
  { id: 'reverse', label: 'Balik teks', grup: 'Huruf', jalankan: (t) => Codecs.reverser.encode(t), balik: 'reverse' },
  { id: 'upside', label: 'Terbalik ʇɐʞ', grup: 'Huruf', jalankan: (t) => Codecs.upsidedown.encode(t) },
  { id: 'super', label: 'Superskrip', grup: 'Huruf', jalankan: (t) => Codecs.superscript.encode(t) },
  { id: 'sub', label: 'Subskrip', grup: 'Huruf', jalankan: (t) => Codecs.subscript.encode(t) },
  { id: 'wingdings', label: 'Wingdings', grup: 'Huruf', jalankan: (t) => Codecs.wingdings.encode(t) },
  {
    id: 'zalgo',
    label: 'Zalgo glitch',
    grup: 'Huruf',
    jalankan: (t, p) => Codecs.zalgo.encode(t, String(p.tingkat ?? 'normal')),
    param: [
      {
        kunci: 'tingkat',
        label: 'Intensitas',
        jenis: 'pilihan',
        bawaan: 'normal',
        pilihan: [
          { id: 'mini', label: 'Mini' },
          { id: 'normal', label: 'Normal' },
          { id: 'big', label: 'Ekstrem' },
        ],
      },
    ],
  },
  { id: 'trim', label: 'Rapikan spasi', grup: 'Rapikan', jalankan: (t) => t.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim() },
  { id: 'oneline', label: 'Gabung jadi satu baris', grup: 'Rapikan', jalankan: (t) => t.replace(/\s*\n\s*/g, ' ').trim() },
  { id: 'dedupe', label: 'Hapus baris ganda', grup: 'Rapikan', jalankan: (t) => [...new Set(t.split('\n'))].join('\n') },
  { id: 'sortlines', label: 'Urutkan baris A–Z', grup: 'Rapikan', jalankan: (t) => t.split('\n').sort((a, b) => a.localeCompare(b, 'id')).join('\n') },
  { id: 'nodiacritic', label: 'Hapus diakritik (é → e)', grup: 'Rapikan', jalankan: (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '') },
  {
    id: 'replace',
    label: 'Cari & ganti',
    grup: 'Rapikan',
    jalankan: (t, p) => (p.cari ? t.split(String(p.cari)).join(String(p.ganti ?? '')) : t),
    param: [
      { kunci: 'cari', label: 'Cari', jenis: 'teks', bawaan: '' },
      { kunci: 'ganti', label: 'Ganti dengan', jenis: 'teks', bawaan: '' },
    ],
  },
  {
    id: 'wrap',
    label: 'Tambah awalan/akhiran',
    grup: 'Rapikan',
    jalankan: (t, p) => `${p.awal ?? ''}${t}${p.akhir ?? ''}`,
    param: [
      { kunci: 'awal', label: 'Awalan', jenis: 'teks', bawaan: '' },
      { kunci: 'akhir', label: 'Akhiran', jenis: 'teks', bawaan: '' },
    ],
  },
  { id: 'md5', label: 'MD5', grup: 'Hash', jalankan: (t) => Hashes.md5(t) },
  { id: 'sha1', label: 'SHA-1', grup: 'Hash', jalankan: (t) => Hashes.sha1(t) },
  { id: 'sha256', label: 'SHA-256', grup: 'Hash', jalankan: (t) => Hashes.sha256(t) },
  { id: 'sha512', label: 'SHA-512', grup: 'Hash', jalankan: (t) => Hashes.sha512(t) },
]

export const transformasiById = (id: string) => TRANSFORMASI.find((t) => t.id === id)

export type Langkah = { id: string; param?: Record<string, string | number> }

export function paramBawaan(t: Transformasi) {
  return Object.fromEntries((t.param ?? []).map((p) => [p.kunci, p.bawaan]))
}

/** Jalankan resep langkah demi langkah; kembalikan hasil antara untuk pratinjau. */
export async function jalankanResep(teks: string, langkah: Langkah[]) {
  const jejak: { id: string; hasil: string; galat?: string }[] = []
  let cur = teks
  for (const l of langkah) {
    const t = transformasiById(l.id)
    if (!t) continue
    try {
      cur = await t.jalankan(cur, { ...paramBawaan(t), ...(l.param ?? {}) })
      jejak.push({ id: l.id, hasil: cur })
    } catch (e) {
      jejak.push({ id: l.id, hasil: cur, galat: e instanceof Error ? e.message : 'Gagal' })
      break
    }
  }
  return { hasil: cur, jejak }
}

/** Tebak format masukan untuk saran decode. */
export function tebakFormat(t: string): string | null {
  const s = t.trim()
  if (s.length < 4) return null
  if (/^[01]{8}( [01]{8})*$/.test(s)) return 'binary:dec'
  if (/^[.\-/ ]+$/.test(s) && /[.-]/.test(s)) return 'morse:dec'
  if (/^([0-9a-f]{2} ?)+$/i.test(s) && s.replace(/ /g, '').length % 2 === 0 && /[a-f]/i.test(s)) return 'hex:dec'
  if (/%[0-9A-F]{2}/i.test(s)) return 'url:dec'
  if (/\\u[0-9a-f]{4}/i.test(s)) return 'unicode:dec'
  if (/^[ᮀ-ᮿ\s.,|᮰-᮹]+$/.test(s)) return 's2l'
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(s) && s.length % 4 === 0 && /[A-Z]/.test(s) && /[a-z0-9]/.test(s)) return 'base64:dec'
  return null
}
