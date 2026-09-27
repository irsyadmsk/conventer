/**
 * Penyimpanan sesi Supabase — cookie berdomain induk .irsyads.com, bukan localStorage.
 *
 * Mengaktifkan Single Sign-On (SSO) instan antar irsyads.com, academy.irsyads.com,
 * dan app.irsyads.com (Ruang).
 */

const POTONG = 3000 // sisakan ruang untuk nama cookie + atribut

type Wadah = { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }

const adaPeramban = () => typeof document !== 'undefined'

/** Domain induk dipakai HANYA di `*.irsyads.com`; selain itu jatuh ke localStorage (misal localhost). */
function domainInduk(): string | null {
  if (!adaPeramban()) return null
  const host = location.hostname
  if (host === 'irsyads.com' || host.endsWith('.irsyads.com')) return '.irsyads.com'
  return null
}

function bacaSemuaCookie(): Map<string, string> {
  const peta = new Map<string, string>()
  if (!adaPeramban() || !document.cookie) return peta
  for (const bagian of document.cookie.split('; ')) {
    const pisah = bagian.indexOf('=')
    if (pisah < 0) continue
    peta.set(bagian.slice(0, pisah), decodeURIComponent(bagian.slice(pisah + 1)))
  }
  return peta
}

function tulisCookie(nama: string, nilai: string, domain: string) {
  const aman = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie =
    `${nama}=${encodeURIComponent(nilai)}; Domain=${domain}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax` + aman
}

function hapusCookie(nama: string, domain: string) {
  document.cookie = `${nama}=; Domain=${domain}; Path=/; Max-Age=0; SameSite=Lax`
}

/** Nomor potongan milik satu kunci, urut. */
function potonganMilik(kunci: string, semua: Map<string, string>): number[] {
  const awalan = `${kunci}.`
  return [...semua.keys()]
    .filter((n) => n.startsWith(awalan))
    .map((n) => Number(n.slice(awalan.length)))
    .filter((n) => Number.isInteger(n) && n >= 0)
    .sort((a, b) => a - b)
}

const wadahLokal: Wadah = {
  getItem: (k) => {
    try {
      return adaPeramban() ? localStorage.getItem(k) : null
    } catch {
      return null
    }
  },
  setItem: (k, v) => {
    try {
      if (adaPeramban()) localStorage.setItem(k, v)
    } catch {
      /* mode penyamaran / penyimpanan diblokir */
    }
  },
  removeItem: (k) => {
    try {
      if (adaPeramban()) localStorage.removeItem(k)
    } catch {
      /* diabaikan */
    }
  },
}

export const penyimpananSesi: Wadah = {
  getItem(kunci) {
    const domain = domainInduk()
    if (!domain) return wadahLokal.getItem(kunci)

    const semua = bacaSemuaCookie()
    const utuh = semua.get(kunci)
    if (utuh !== undefined) return utuh

    const nomor = potonganMilik(kunci, semua)
    if (nomor.length === 0) return null
    if (nomor.some((n, i) => n !== i)) return null
    return nomor.map((n) => semua.get(`${kunci}.${n}`) ?? '').join('')
  },

  setItem(kunci, nilai) {
    const domain = domainInduk()
    if (!domain) return wadahLokal.setItem(kunci, nilai)

    const lama = potonganMilik(kunci, bacaSemuaCookie())

    if (nilai.length <= POTONG) {
      tulisCookie(kunci, nilai, domain)
      for (const n of lama) hapusCookie(`${kunci}.${n}`, domain)
      return
    }

    const potongan: string[] = []
    for (let i = 0; i < nilai.length; i += POTONG) potongan.push(nilai.slice(i, i + POTONG))
    potongan.forEach((isi, i) => tulisCookie(`${kunci}.${i}`, isi, domain))
    for (const n of lama) if (n >= potongan.length) hapusCookie(`${kunci}.${n}`, domain)
    hapusCookie(kunci, domain)
  },

  removeItem(kunci) {
    const domain = domainInduk()
    if (!domain) return wadahLokal.removeItem(kunci)
    hapusCookie(kunci, domain)
    for (const n of potonganMilik(kunci, bacaSemuaCookie())) hapusCookie(`${kunci}.${n}`, domain)
    wadahLokal.removeItem(kunci)
  },
}
