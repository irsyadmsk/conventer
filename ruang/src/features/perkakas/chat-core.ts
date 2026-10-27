export type Platform = 'whatsapp' | 'telegram'
export type Kontak = {
  target: string
  label: string
  platform: Platform
  updated_at: string
}
export const BATAS_RIWAYAT = 100
export function targetChat(raw: string, platform: Platform, country = '62'): string {
  let input = raw.trim()
  if (platform === 'telegram' && (input.startsWith('@') || /^https:\/\/t\.me\//i.test(input))) {
    input = input
      .replace(/^https:\/\/t\.me\//i, '')
      .replace(/^@/, '')
      .replace(/\/$/, '')
    if (!/^[a-z][a-z0-9_]{4,31}$/i.test(input))
      throw Error('Username Telegram harus 5–32 karakter: huruf, angka, atau garis bawah.')
    return '@' + input.toLowerCase()
  }
  if (!/^\+?[1-9]\d{0,2}$/.test(country)) throw Error('Kode negara harus 1–3 digit, misalnya 62.')
  if (!/^\+?[\d\s().-]+$/.test(input)) throw Error('Masukkan nomor telepon, bukan tautan atau huruf.')
  let number = input.replace(/[\s().-]/g, '')
  const prefix = country.replace('+', '')
  if (number.startsWith('+')) number = number.slice(1)
  else if (number.startsWith('00')) number = number.slice(2)
  else if (number.startsWith('0')) number = prefix + number.slice(1)
  else if (!number.startsWith(prefix)) number = prefix + number
  if (!/^[1-9]\d{6,14}$/.test(number))
    throw Error('Nomor internasional harus 7–15 digit. Periksa kode negara dan nomor tujuan.')
  return '+' + number
}
export function tautanChat(target: string, platform: Platform, pesan = ''): string {
  if (pesan.length > 2000) throw Error('Pesan awal maksimal 2.000 karakter.')
  if (!/^\+[1-9]\d{6,14}$/.test(target) && !(platform === 'telegram' && /^@[a-z][a-z0-9_]{4,31}$/i.test(target)))
    throw Error('Tujuan tidak valid.')
  const base =
    platform === 'whatsapp'
      ? `https://wa.me/${target.slice(1)}`
      : `https://t.me/${target.startsWith('@') ? target.slice(1) : target}`
  return base + (pesan ? `?text=${encodeURIComponent(pesan)}` : '')
}
export function validKontak(value: unknown): value is Kontak {
  if (!value || typeof value !== 'object') return false
  const v = value as Kontak
  return (
    typeof v.label === 'string' &&
    v.label.length <= 120 &&
    ['whatsapp', 'telegram'].includes(v.platform) &&
    typeof v.updated_at === 'string' &&
    Number.isFinite(Date.parse(v.updated_at)) &&
    typeof v.target === 'string' &&
    (/^\+[1-9]\d{6,14}$/.test(v.target) || (v.platform === 'telegram' && /^@[a-z][a-z0-9_]{4,31}$/.test(v.target)))
  )
}
export function kontakBersih(v: Kontak): Kontak {
  return {
    target: v.target,
    label: v.label.trim(),
    platform: v.platform,
    updated_at: v.updated_at,
  }
}
