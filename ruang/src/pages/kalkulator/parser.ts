/**
 * Pengurai ekspresi matematika yang aman (tanpa eval).
 *
 * Tata bahasa (presedensi naik):
 *   ekspr   := suku (('+'|'-') suku)*
 *   suku    := faktor (('×'|'*'|'÷'|'/'|'mod') faktor | faktor-implisit)*
 *   faktor  := unari ('^' faktor)?            // pangkat asosiatif kanan
 *   unari   := ('-'|'+') unari | postfiks
 *   postfiks:= primer ('!' | '%')*
 *   primer  := angka | konstanta | fungsi '(' ekspr ')' | '(' ekspr ')' | '√' unari
 *
 * Koma dan titik sama-sama dibaca sebagai pemisah desimal.
 */
export type ModeSudut = 'deg' | 'rad'

type Token = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string }

const FUNGSI = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'log', 'ln', 'sqrt', 'cbrt', 'abs', 'exp', 'round', 'floor', 'ceil'] as const

export class GalatHitung extends Error {}

function tokenisasi(s: string): Token[] {
  const out: Token[] = []
  let i = 0
  const src = s.replace(/\s+/g, '').replace(/−/g, '-').replace(/\*\*/g, '^')
  while (i < src.length) {
    const c = src[i]
    if (/[0-9.,]/.test(c)) {
      let j = i
      while (j < src.length && /[0-9.,]/.test(src[j])) j++
      let angka = src.slice(i, j).replace(/,/g, '.')
      // e-notasi: 1.2e-3
      if (src[j] === 'E' && /[-+0-9]/.test(src[j + 1] ?? '')) {
        let k = j + 1
        if (src[k] === '-' || src[k] === '+') k++
        while (k < src.length && /[0-9]/.test(src[k])) k++
        angka += src.slice(j, k).replace('E', 'e')
        j = k
      }
      if ((angka.match(/\./g) ?? []).length > 1) throw new GalatHitung('Angka tidak valid')
      out.push({ t: 'num', v: Number(angka) })
      i = j
      continue
    }
    if (/[a-zA-Zπ]/.test(c)) {
      let j = i
      while (j < src.length && /[a-zA-Zπ]/.test(src[j])) j++
      out.push({ t: 'id', v: src.slice(i, j).toLowerCase() })
      i = j
      continue
    }
    if ('+-*/×÷^()!%√'.includes(c)) {
      out.push({ t: 'op', v: c === '*' ? '×' : c === '/' ? '÷' : c })
      i++
      continue
    }
    throw new GalatHitung(`Karakter tidak dikenal: ${c}`)
  }
  return out
}

function faktorial(n: number): number {
  if (n < 0) throw new GalatHitung('Faktorial bilangan negatif')
  if (!Number.isInteger(n)) {
    // Pendekatan gamma (Lanczos) untuk pecahan.
    return gamma(n + 1)
  }
  if (n > 170) return Infinity
  let r = 1
  for (let k = 2; k <= n; k++) r *= k
  return r
}

function gamma(z: number): number {
  const g = 7
  const p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z))
  z -= 1
  let x = p[0]
  for (let i = 1; i < g + 2; i++) x += p[i] / (z + i)
  const t = z + g + 0.5
  return Math.sqrt(2 * Math.PI) * t ** (z + 0.5) * Math.exp(-t) * x
}

export function hitung(ekspr: string, opsi: { sudut: ModeSudut; ans?: number }): number {
  const tk = tokenisasi(ekspr)
  let p = 0
  const lihat = () => tk[p]
  const ambil = () => tk[p++]
  const isOp = (v: string) => lihat()?.t === 'op' && lihat()!.v === v
  const keRad = (x: number) => (opsi.sudut === 'deg' ? (x * Math.PI) / 180 : x)
  const dariRad = (x: number) => (opsi.sudut === 'deg' ? (x * 180) / Math.PI : x)

  function primer(): number {
    const t = ambil()
    if (!t) throw new GalatHitung('Ekspresi belum lengkap')
    if (t.t === 'num') return t.v
    if (t.t === 'op' && t.v === '(') {
      const v = ekspr_()
      if (isOp(')')) ambil() // kurung tutup opsional di akhir
      return v
    }
    if (t.t === 'op' && t.v === '√') return Math.sqrt(unari())
    if (t.t === 'id') {
      if (t.v === 'pi' || t.v === 'π') return Math.PI
      if (t.v === 'e') return Math.E
      if (t.v === 'ans') return opsi.ans ?? 0
      if ((FUNGSI as readonly string[]).includes(t.v)) {
        const arg = isOp('(') ? primer() : unari()
        switch (t.v) {
          case 'sin': return bulat(Math.sin(keRad(arg)))
          case 'cos': return bulat(Math.cos(keRad(arg)))
          case 'tan': {
            const r = keRad(arg)
            if (Math.abs(Math.cos(r)) < 1e-12) throw new GalatHitung('tan tidak terdefinisi')
            return bulat(Math.tan(r))
          }
          case 'asin': return dariRad(Math.asin(arg))
          case 'acos': return dariRad(Math.acos(arg))
          case 'atan': return dariRad(Math.atan(arg))
          case 'sinh': return Math.sinh(arg)
          case 'cosh': return Math.cosh(arg)
          case 'tanh': return Math.tanh(arg)
          case 'log': return Math.log10(arg)
          case 'ln': return Math.log(arg)
          case 'sqrt': return Math.sqrt(arg)
          case 'cbrt': return Math.cbrt(arg)
          case 'abs': return Math.abs(arg)
          case 'exp': return Math.exp(arg)
          case 'round': return Math.round(arg)
          case 'floor': return Math.floor(arg)
          case 'ceil': return Math.ceil(arg)
        }
      }
      if (t.v === 'mod') throw new GalatHitung('mod butuh dua bilangan')
      throw new GalatHitung(`Tidak dikenal: ${t.v}`)
    }
    throw new GalatHitung('Ekspresi tidak valid')
  }

  function postfiks(): number {
    let v = primer()
    while (isOp('!') || isOp('%')) {
      const o = ambil()!.v
      v = o === '!' ? faktorial(v) : v / 100
    }
    return v
  }

  function unari(): number {
    if (isOp('-')) {
      ambil()
      return -unari()
    }
    if (isOp('+')) {
      ambil()
      return unari()
    }
    return pangkat()
  }

  function pangkat(): number {
    const basis = postfiks()
    if (isOp('^')) {
      ambil()
      return basis ** unari()
    }
    return basis
  }

  function mulaiFaktor() {
    const t = lihat()
    if (!t) return false
    return t.t === 'num' || (t.t === 'id' && t.v !== 'mod') || (t.t === 'op' && (t.v === '(' || t.v === '√'))
  }

  function suku(): number {
    let v = unari()
    for (;;) {
      if (isOp('×')) {
        ambil()
        v *= unari()
      } else if (isOp('÷')) {
        ambil()
        const b = unari()
        if (b === 0) throw new GalatHitung('Tidak bisa dibagi nol')
        v /= b
      } else if (lihat()?.t === 'id' && lihat()!.v === 'mod') {
        ambil()
        const b = unari()
        v = ((v % b) + b) % b
      } else if (mulaiFaktor()) {
        v *= unari() // perkalian implisit: 2π, 3(4), 2sin30
      } else break
    }
    return v
  }

  function ekspr_(): number {
    let v = suku()
    for (;;) {
      if (isOp('+')) {
        ambil()
        // "50 + 10%" → 50 + 10% dari 50 (perilaku kalkulator saku)
        const b = sukuPersen(v)
        v += b
      } else if (isOp('-')) {
        ambil()
        const b = sukuPersen(v)
        v -= b
      } else break
    }
    return v
  }

  /** Bila suku berikut berbentuk "x%" tunggal, artikan sebagai persen dari basis. */
  function sukuPersen(basis: number): number {
    const awal = p
    const t = lihat()
    if (t?.t === 'num' && tk[p + 1]?.t === 'op' && tk[p + 1].v === '%') {
      const setelah = tk[p + 2]
      if (!setelah || (setelah.t === 'op' && (setelah.v === '+' || setelah.v === '-' || setelah.v === ')'))) {
        p += 2
        return (basis * t.v) / 100
      }
    }
    p = awal
    return suku()
  }

  const hasil = ekspr_()
  if (p < tk.length) {
    if (isOp(')')) throw new GalatHitung('Kurung tutup berlebih')
    throw new GalatHitung('Ekspresi tidak valid')
  }
  if (Number.isNaN(hasil)) throw new GalatHitung('Hasil tidak terdefinisi')
  return hasil
}

/** Buang galat pembulatan kecil (sin 180° = 1e-16 → 0). */
function bulat(x: number) {
  return Math.abs(x) < 1e-12 ? 0 : Number(x.toPrecision(15))
}

export function formatHasil(x: number): string {
  if (!Number.isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : 'Galat'
  const abs = Math.abs(x)
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-9)) return x.toExponential(8).replace(/\.?0+e/, 'e').replace('e+', ' × 10^').replace('e-', ' × 10^-')
  const r = Number(x.toPrecision(14))
  return r.toLocaleString('id-ID', { maximumFractionDigits: 10 })
}
