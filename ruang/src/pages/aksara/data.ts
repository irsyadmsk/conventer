export type Kunci = { ch: string; latin: string; ket?: string }

export const SWARA: Kunci[] = [
  { ch: 'ᮃ', latin: 'a' },
  { ch: 'ᮄ', latin: 'i' },
  { ch: 'ᮅ', latin: 'u' },
  { ch: 'ᮆ', latin: 'é' },
  { ch: 'ᮇ', latin: 'o' },
  { ch: 'ᮈ', latin: 'e', ket: 'pepet' },
  { ch: 'ᮉ', latin: 'eu' },
]

export const NGALAGENA: Kunci[] = ['ka', 'ga', 'nga', 'ca', 'ja', 'nya', 'ta', 'da', 'na', 'pa', 'ba', 'ma', 'ya', 'ra', 'la', 'wa', 'sa', 'ha'].map((latin, i) => ({
  ch: ['ᮊ', 'ᮌ', 'ᮍ', 'ᮎ', 'ᮏ', 'ᮑ', 'ᮒ', 'ᮓ', 'ᮔ', 'ᮕ', 'ᮘ', 'ᮙ', 'ᮚ', 'ᮛ', 'ᮜ', 'ᮝ', 'ᮞ', 'ᮠ'][i],
  latin,
}))

export const SERAPAN: Kunci[] = [
  { ch: 'ᮖ', latin: 'fa' },
  { ch: 'ᮗ', latin: 'va' },
  { ch: 'ᮐ', latin: 'za' },
  { ch: 'ᮟ', latin: 'xa' },
  { ch: 'ᮋ', latin: 'qa' },
  { ch: 'ᮮ', latin: 'kha' },
  { ch: 'ᮯ', latin: 'sya' },
]

export const RARANGKEN: Kunci[] = [
  { ch: 'ᮤ', latin: 'i', ket: 'Panghulu' },
  { ch: 'ᮥ', latin: 'u', ket: 'Panyuku' },
  { ch: 'ᮦ', latin: 'é', ket: 'Panéléng' },
  { ch: 'ᮧ', latin: 'o', ket: 'Panolong' },
  { ch: 'ᮨ', latin: 'e', ket: 'Pamepet' },
  { ch: 'ᮩ', latin: 'eu', ket: 'Paneuleung' },
  { ch: 'ᮡ', latin: '-ya-', ket: 'Pamingkal' },
  { ch: 'ᮢ', latin: '-ra-', ket: 'Panyakra' },
  { ch: 'ᮣ', latin: '-la-', ket: 'Panyiku' },
  { ch: 'ᮀ', latin: '+ng', ket: 'Panyecek' },
  { ch: 'ᮁ', latin: '+r', ket: 'Panglayar' },
  { ch: 'ᮂ', latin: '+h', ket: 'Pangwisad' },
  { ch: '᮪', latin: '∅', ket: 'Pamaéh' },
]

export const ANGKA: Kunci[] = ['᮰', '᮱', '᮲', '᮳', '᮴', '᮵', '᮶', '᮷', '᮸', '᮹'].map((ch, i) => ({ ch, latin: String(i) }))

export const FRASA = [
  { label: 'Sampurasun', latin: 'Sampurasun! Rampés.' },
  { label: 'Wilujeng Sumping', latin: 'Wilujeng sumping di Jawa Barat.' },
  { label: 'Gemah Ripah', latin: 'Gemah ripah repeh rapih.' },
  { label: 'Hadé Tata', latin: 'Hadé tata, hadé basa.' },
  { label: 'Silih Asih', latin: 'Silih asih, silih asah, silih asuh.' },
]

/** Pemenggalan suku kata Latin Sunda sederhana (ng, ny, eu dianggap satu bunyi). */
export function sukuKata(kata: string): string[] {
  const w = kata.toLowerCase().replace(/[^a-zéèêöü]/g, '')
  if (!w) return []
  const unit: string[] = []
  for (let i = 0; i < w.length; ) {
    const dua = w.slice(i, i + 2)
    if (dua === 'ng' || dua === 'ny' || dua === 'eu') {
      unit.push(dua)
      i += 2
    } else {
      unit.push(w[i])
      i++
    }
  }
  const vokal = (u: string) => /^(a|i|u|e|é|è|o|eu)$/.test(u)
  const hasil: string[] = []
  let cur = ''
  for (let i = 0; i < unit.length; i++) {
    const u = unit[i]
    cur += u
    if (vokal(u)) {
      // Lihat ke depan: konsonan tunggal sebelum vokal ikut suku berikutnya.
      let j = i + 1
      let kons = 0
      while (j < unit.length && !vokal(unit[j])) {
        kons++
        j++
      }
      if (j >= unit.length) {
        cur += unit.slice(i + 1).join('')
        hasil.push(cur)
        return hasil
      }
      if (kons === 0) {
        hasil.push(cur)
        cur = ''
      } else if (kons === 1) {
        hasil.push(cur)
        cur = ''
      } else {
        // Konsonan pertama menutup suku ini (kecuali gugus -r-/-l-/-y-).
        const kedua = unit[i + 2]
        if (kons === 2 && ['r', 'l', 'y'].includes(kedua)) {
          hasil.push(cur)
          cur = ''
        } else {
          cur += unit[i + 1]
          hasil.push(cur)
          cur = ''
          i++
        }
      }
    }
  }
  if (cur) hasil.push(cur)
  return hasil
}
