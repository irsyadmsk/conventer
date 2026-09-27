import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { catat } from '@/lib/activity'
import { cn } from '@/lib/utils'
import { bunyi } from '@/lib/sound'
import { Panel } from '@/components/ui/Layout'
import { CopyButton, Segmented } from '@/components/ui/Controls'
import { Select } from '@/components/ui/Field'

type Basis = 2 | 8 | 10 | 16
const BASIS: { id: Basis; nama: string; pola: RegExp }[] = [
  { id: 16, nama: 'HEX', pola: /^-?[0-9a-f]*$/i },
  { id: 10, nama: 'DEC', pola: /^-?[0-9]*$/ },
  { id: 8, nama: 'OCT', pola: /^-?[0-7]*$/ },
  { id: 2, nama: 'BIN', pola: /^-?[01]*$/ },
]
const LEBAR = [8, 16, 32, 64] as const
type Lebar = (typeof LEBAR)[number]

function parse(s: string, b: Basis): bigint | null {
  const t = s.trim().replace(/[\s_]/g, '')
  if (!t || t === '-') return null
  const neg = t.startsWith('-')
  const inti = neg ? t.slice(1) : t
  try {
    const pref = b === 16 ? '0x' : b === 8 ? '0o' : b === 2 ? '0b' : ''
    const v = BigInt(pref + inti)
    return neg ? -v : v
  } catch {
    return null
  }
}

/** Potong ke lebar bit (komplemen dua). */
function potong(v: bigint, w: Lebar) {
  return BigInt.asIntN(w, v)
}
function tanpaTanda(v: bigint, w: Lebar) {
  return BigInt.asUintN(w, v)
}

function kelompok(s: string, n: number) {
  const r: string[] = []
  for (let i = s.length; i > 0; i -= n) r.unshift(s.slice(Math.max(0, i - n), i))
  return r.join(' ')
}

export default function Programmer() {
  const [basis, setBasis] = useState<Basis>(10)
  const [masukan, setMasukan] = useState('255')
  const [lebar, setLebar] = useState<Lebar>(32)
  const [op, setOp] = useState<'AND' | 'OR' | 'XOR' | 'SHL' | 'SHR' | 'ADD' | 'SUB' | 'MUL'>('AND')
  const [kedua, setKedua] = useState('0F')
  const [basisKedua, setBasisKedua] = useState<Basis>(16)

  const nilai = useMemo(() => {
    const v = parse(masukan, basis)
    return v === null ? null : potong(v, lebar)
  }, [masukan, basis, lebar])

  const u = nilai !== null ? tanpaTanda(nilai, lebar) : 0n
  const bit = u.toString(2).padStart(lebar, '0')

  function setNilai(v: bigint) {
    const p = potong(v, lebar)
    setMasukan(basis === 10 ? p.toString(10) : tanpaTanda(p, lebar).toString(basis).toUpperCase())
    catat('kalkulator', 'hitung', 1, { mode: 'programmer' })
  }

  function balikBit(i: number) {
    bunyi('toggle')
    setNilai(potong(u ^ (1n << BigInt(i)), lebar))
  }

  const b2 = parse(kedua, basisKedua) ?? 0n
  const hasilOp = useMemo(() => {
    if (nilai === null) return null
    switch (op) {
      case 'AND': return potong(nilai & b2, lebar)
      case 'OR': return potong(nilai | b2, lebar)
      case 'XOR': return potong(nilai ^ b2, lebar)
      case 'SHL': return potong(nilai << (b2 & 63n), lebar)
      case 'SHR': return potong(nilai >> (b2 & 63n), lebar)
      case 'ADD': return potong(nilai + b2, lebar)
      case 'SUB': return potong(nilai - b2, lebar)
      case 'MUL': return potong(nilai * b2, lebar)
    }
  }, [nilai, b2, op, lebar])

  const tampil = (v: bigint, b: Basis) => (b === 10 ? v.toString(10) : kelompok(tanpaTanda(v, lebar).toString(b).toUpperCase(), b === 2 ? 4 : b === 16 ? 4 : 3))

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <Panel
        judul="Bilangan"
        titik="aksen"
        aksi={
          <Segmented ukuran="sm" label="Lebar bit" nilai={String(lebar)} onChange={(v) => setLebar(Number(v) as Lebar)} pilihan={LEBAR.map((w) => ({ id: String(w), label: `${w}` }))} />
        }
      >
        <div className="flex flex-col gap-2">
          {BASIS.map((b) => {
            const aktif = b.id === basis
            return (
              <div
                key={b.id}
                className={cn('flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors', aktif ? 'border-accent bg-accent-soft/50' : 'border-line hover:border-line-2')}
              >
                <button
                  onClick={() => {
                    if (nilai !== null) setMasukan(b.id === 10 ? nilai.toString(10) : tanpaTanda(nilai, lebar).toString(b.id).toUpperCase())
                    setBasis(b.id)
                  }}
                  className={cn('w-12 shrink-0 rounded-lg py-1 font-mono text-xs font-bold', aktif ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-2')}
                  aria-pressed={aktif}
                >
                  {b.nama}
                </button>
                {aktif ? (
                  <input
                    value={masukan}
                    onChange={(e) => {
                      if (b.pola.test(e.target.value.replace(/[\s_]/g, ''))) setMasukan(e.target.value.toUpperCase())
                    }}
                    aria-label={`Masukan ${b.nama}`}
                    className="min-w-0 flex-1 bg-transparent font-mono text-lg outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40"
                    inputMode={b.id === 16 ? 'text' : 'numeric'}
                    autoFocus
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate font-mono text-[15px] text-ink-2">{nilai !== null ? tampil(nilai, b.id) : '—'}</span>
                )}
                <CopyButton teks={nilai !== null ? (b.id === 10 ? nilai.toString() : tanpaTanda(nilai, lebar).toString(b.id).toUpperCase()) : ''} tool="kalkulator" varian="ghost" label="" />
              </div>
            )
          })}
        </div>

        <div className="mt-5">
          <p className="eyebrow mb-2">Bit (ketuk untuk membalik)</p>
          <div className="grid grid-cols-8 gap-1 sm:grid-cols-16" style={{ gridTemplateColumns: undefined }}>
            {bit.split('').map((c, idx) => {
              const i = lebar - 1 - idx
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => balikBit(i)}
                  className={cn('flex h-10 flex-col items-center justify-center rounded-md font-mono text-sm font-bold transition-colors', c === '1' ? 'bg-ink text-bg' : 'bg-surface-2 text-ink-3 hover:bg-surface-3', i % 4 === 3 && idx !== 0 && 'ml-0')}
                  aria-label={`Bit ${i}: ${c}`}
                >
                  {c}
                  <span className="text-[8px] font-medium opacity-60">{i}</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </Panel>

      <Panel judul="Operasi bit & aritmetika">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Operasi" value={op} onChange={(e) => setOp(e.target.value as typeof op)}>
            {['AND', 'OR', 'XOR', 'SHL', 'SHR', 'ADD', 'SUB', 'MUL'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
          <Select label="Basis operand" value={basisKedua} onChange={(e) => setBasisKedua(Number(e.target.value) as Basis)}>
            {BASIS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nama}
              </option>
            ))}
          </Select>
        </div>
        <label className="mt-3 flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-ink-2">Operand kedua</span>
          <input className="field h-11 font-mono" value={kedua} onChange={(e) => setKedua(e.target.value.toUpperCase())} />
        </label>
        <div className="mt-4 rounded-2xl bg-surface-2 p-4">
          <p className="eyebrow mb-2">Hasil</p>
          {hasilOp === null || hasilOp === undefined ? (
            <p className="text-sm text-ink-3">Masukkan bilangan yang valid.</p>
          ) : (
            <dl className="grid grid-cols-[3rem_1fr] gap-x-3 gap-y-1 font-mono text-sm">
              {BASIS.map((b) => (
                <div key={b.id} className="contents">
                  <dt className="font-bold text-ink-3">{b.nama}</dt>
                  <dd className="truncate">{tampil(hasilOp, b.id)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button onClick={() => hasilOp != null && setNilai(hasilOp)} className="h-10 rounded-xl bg-accent text-sm font-bold text-accent-ink transition-colors hover:bg-accent-hover">
            Pakai hasil
          </button>
          <button onClick={() => nilai !== null && setNilai(~nilai)} className="h-10 rounded-xl bg-surface-2 font-mono text-sm font-bold hover:bg-surface-3">
            NOT
          </button>
          <button onClick={() => nilai !== null && setNilai(-nilai)} className="h-10 rounded-xl bg-surface-2 font-mono text-sm font-bold hover:bg-surface-3">
            ±
          </button>
        </div>
        {nilai !== null && lebar <= 32 && nilai >= 32n && nilai < 127n && (
          <p className="mt-4 text-sm text-ink-2">
            Karakter ASCII: <span className="rounded bg-surface-2 px-1.5 font-mono font-bold">{String.fromCharCode(Number(nilai))}</span>
          </p>
        )}
      </Panel>
    </div>
  )
}
