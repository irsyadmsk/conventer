export function cn(...xs: unknown[]) {
  return xs.filter((x) => typeof x === 'string' && x).join(' ')
}

export async function salinTeks(teks: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(teks)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = teks
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

export async function tempelTeks(): Promise<string | null> {
  try {
    return await navigator.clipboard.readText()
  } catch {
    return null
  }
}

export function unduh(nama: string, isi: BlobPart, tipe = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([isi], { type: tipe }))
  const a = document.createElement('a')
  a.href = url
  a.download = nama
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function unduhDataUrl(nama: string, dataUrl: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = nama
  a.click()
}

const fmtAngka = new Intl.NumberFormat('id-ID')
export const angka = (n: number) => fmtAngka.format(Math.round(n))
export const angkaDesimal = (n: number, maks = 2) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: maks }).format(n)
export const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export function waktuRelatif(iso: string | Date) {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  const detik = Math.round((Date.now() - d.getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' })
  if (Math.abs(detik) < 60) return 'baru saja'
  const menit = Math.round(detik / 60)
  if (Math.abs(menit) < 60) return rtf.format(-menit, 'minute')
  const jam = Math.round(menit / 60)
  if (Math.abs(jam) < 24) return rtf.format(-jam, 'hour')
  const hari = Math.round(jam / 24)
  if (Math.abs(hari) < 7) return rtf.format(-hari, 'day')
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const tanggalPanjang = (d: Date | string) =>
  new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
export const tanggalPendek = (d: Date | string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

export function sapaan(d = new Date()) {
  const h = d.getHours()
  if (h < 4) return 'Selamat malam'
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export function inisial(nama: string) {
  return (
    nama
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') || '?'
  )
}

export function debounce<A extends unknown[]>(fn: (...a: A) => void, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined
  return (...a: A) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...a), ms)
  }
}
