/** Mesin lokal: input pengguna tidak dikirim ke layanan luar. */
export function acakBatas(n: number): number {
  if (!Number.isSafeInteger(n) || n < 1 || n > 0x100000000) throw Error('Batas acak tidak valid.')
  const limit = Math.floor(0x100000000 / n) * n
  const bytes = new Uint32Array(1)
  do {
    crypto.getRandomValues(bytes)
  } while (bytes[0] >= limit)
  return bytes[0] % n
}
export function acak<T>(values: readonly T[], random = acakBatas): T[] {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i--) {
    const j = random(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
export function peserta(teks: string): string[] {
  const names = teks
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (names.length > 1000) throw Error('Maksimal 1.000 peserta.')
  if (names.some((s) => s.length > 120)) throw Error('Nama peserta maksimal 120 karakter.')
  const seen = new Set<string>()
  for (const name of names) {
    const key = name.normalize('NFKC').toLocaleLowerCase('id')
    if (seen.has(key)) throw Error(`Nama “${name}” berulang. Tambahkan pembeda, misalnya kelas atau nomor absen.`)
    seen.add(key)
  }
  return names
}
export function bagiKelompok(names: readonly string[], count: number, random = acakBatas): string[][] {
  if (!Number.isInteger(count) || count < 1 || count > names.length)
    throw Error('Jumlah kelompok harus 1 sampai jumlah peserta.')
  const groups = Array.from({ length: count }, () => [] as string[])
  acak(names, random).forEach((name, i) => groups[i % count].push(name))
  return groups
}
export function csv(rows: (string | number)[][]): string {
  return (
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map((value) => {
            let text = String(value)
            if (/^[\s]*[=+@-]/.test(text)) text = "'" + text
            return '"' + text.replaceAll('"', '""') + '"'
          })
          .join(','),
      )
      .join('\r\n')
  )
}
export function unduh(name: string, text: string, mime = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const HURUF = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const SEMAPHORE: Record<string, readonly [number, number]> = Object.fromEntries(
  [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '12',
    '13',
    '46',
    '14',
    '15',
    '16',
    '17',
    '23',
    '24',
    '25',
    '26',
    '27',
    '34',
    '35',
    '47',
    '56',
    '57',
    '36',
    '67',
  ].map((s, i) => [HURUF[i], [Number(s[0]), Number(s[1])] as const]),
)
export const ARAH = ['bawah', 'kiri bawah', 'kiri', 'kiri atas', 'atas', 'kanan atas', 'kanan', 'kanan bawah']
export const MORSE = [
  '.-',
  '-...',
  '-.-.',
  '-..',
  '.',
  '..-.',
  '--.',
  '....',
  '..',
  '.---',
  '-.-',
  '.-..',
  '--',
  '-.',
  '---',
  '.--.',
  '--.-',
  '.-.',
  '...',
  '-',
  '..-',
  '...-',
  '.--',
  '-..-',
  '-.--',
  '--..',
]
export const RADIO = [
  'Alfa',
  'Bravo',
  'Charlie',
  'Delta',
  'Echo',
  'Foxtrot',
  'Golf',
  'Hotel',
  'India',
  'Juliett',
  'Kilo',
  'Lima',
  'Mike',
  'November',
  'Oscar',
  'Papa',
  'Quebec',
  'Romeo',
  'Sierra',
  'Tango',
  'Uniform',
  'Victor',
  'Whiskey',
  'X-ray',
  'Yankee',
  'Zulu',
]
const BRAILLE_BITS = [1, 3, 9, 25, 17, 11, 27, 19, 10, 26, 5, 7, 13, 29, 21, 15, 31, 23, 14, 30, 37, 39, 58, 45, 61, 53]
export const BRAILLE = Object.fromEntries([...HURUF].map((c, i) => [c, String.fromCodePoint(0x2800 + BRAILLE_BITS[i])]))
export const KODE = ['angka', 'koordinat', 'rumput', 'kotak'] as const
export type Kode = (typeof KODE)[number]
export function kodeHuruf(c: string, kind: Kode): string {
  const i = HURUF.indexOf(c.toUpperCase())
  if (i < 0) return c
  if (kind === 'angka') return String(i + 1)
  // POLYBIUS 5×5, I/J digabung. Varian kunci selalu ditampilkan.
  if (kind === 'koordinat') {
    const j = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'.indexOf(c.toUpperCase().replace('J', 'I'))
    return `${Math.floor(j / 5) + 1}${(j % 5) + 1}`
  }
  if (kind === 'rumput') return MORSE[i].replaceAll('.', '▁').replaceAll('-', '▇')
  // Varian kotak 1: pasangan AB..QR di kisi 3×3, ST..YZ di kisi silang.
  return `${i < 18 ? 'K' : 'X'}${Math.floor((i < 18 ? i : i - 18) / 2) + 1}${i % 2 ? '•' : ''}`
}
export function encode(teks: string, kind: Kode): string {
  if (!/^[a-z\s]*$/i.test(teks)) throw Error('Gunakan huruf A–Z dan spasi. Angka/tanda baca belum didukung sandi ini.')
  return teks
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => [...word].map((c) => kodeHuruf(c, kind)).join(' '))
    .join(' / ')
}
export function decode(teks: string, kind: Kode): string {
  const reverse = new Map(
    [...HURUF].filter((c) => kind !== 'koordinat' || c !== 'J').map((c) => [kodeHuruf(c, kind), c]),
  )
  return teks
    .trim()
    .split(/\s*\/\s*/)
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((token) => {
          const letter = reverse.get(token.toUpperCase())
          if (!letter) throw Error(`Kode “${token}” tidak dikenali. Pisahkan huruf dengan spasi dan kata dengan /.`)
          return letter
        })
        .join(''),
    )
    .join(' ')
}
/** Lab pengenalan huruf dasar, bukan penerjemah Braille bahasa lengkap. */
export function braille(teks: string, balik = false): string {
  const map = balik ? Object.fromEntries(Object.entries(BRAILLE).map(([c, b]) => [b, c.toLowerCase()])) : BRAILLE
  return [...teks]
    .map((c) => {
      if (/\s/.test(c)) return c
      const value = map[balik ? c : c.toUpperCase()]
      if (!value)
        throw Error(
          balik
            ? 'Gunakan pola Braille huruf dasar A–Z.'
            : 'Lab dasar mendukung huruf A–Z dan spasi; kapitalisasi tidak dibedakan.',
        )
      return value
    })
    .join('')
}
