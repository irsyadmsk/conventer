import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Delete, History, Trash2 } from 'lucide-react'
import { catat } from '@/lib/activity'
import { bunyi } from '@/lib/sound'
import { cn, waktuRelatif } from '@/lib/utils'
import { Button, IconButton } from '@/components/ui/Button'
import { CopyButton, Segmented } from '@/components/ui/Controls'
import { TombolSimpan } from '@/components/ToolKit'
import { formatHasil, hitung, GalatHitung, type ModeSudut } from './parser'

type Riwayat = { ekspr: string; hasil: string; nilai: number; waktu: string }
const KUNCI = 'ruang:kalk:riwayat'

type Tombol = { l: string; sisip?: string; aksi?: 'hapus' | 'mundur' | 'sama' | 'ans' | 'mc' | 'mr' | 'm+' | 'm-' | 'tanda'; jenis?: 'angka' | 'op' | 'fn' | 'sama' | 'bahaya'; aria?: string }

const DASAR: Tombol[] = [
  { l: 'AC', aksi: 'hapus', jenis: 'bahaya', aria: 'Hapus semua' },
  { l: '( )', sisip: '()', jenis: 'fn', aria: 'Kurung' },
  { l: '%', sisip: '%', jenis: 'fn', aria: 'Persen' },
  { l: '÷', sisip: '÷', jenis: 'op', aria: 'Bagi' },
  { l: '7', sisip: '7', jenis: 'angka' },
  { l: '8', sisip: '8', jenis: 'angka' },
  { l: '9', sisip: '9', jenis: 'angka' },
  { l: '×', sisip: '×', jenis: 'op', aria: 'Kali' },
  { l: '4', sisip: '4', jenis: 'angka' },
  { l: '5', sisip: '5', jenis: 'angka' },
  { l: '6', sisip: '6', jenis: 'angka' },
  { l: '−', sisip: '-', jenis: 'op', aria: 'Kurang' },
  { l: '1', sisip: '1', jenis: 'angka' },
  { l: '2', sisip: '2', jenis: 'angka' },
  { l: '3', sisip: '3', jenis: 'angka' },
  { l: '+', sisip: '+', jenis: 'op', aria: 'Tambah' },
  { l: '±', aksi: 'tanda', jenis: 'angka', aria: 'Ganti tanda' },
  { l: '0', sisip: '0', jenis: 'angka' },
  { l: ',', sisip: ',', jenis: 'angka', aria: 'Koma desimal' },
  { l: '=', aksi: 'sama', jenis: 'sama', aria: 'Sama dengan' },
]

const ILMIAH: Tombol[] = [
  { l: 'sin', sisip: 'sin(' },
  { l: 'cos', sisip: 'cos(' },
  { l: 'tan', sisip: 'tan(' },
  { l: 'π', sisip: 'π' },
  { l: 'e', sisip: 'e' },
  { l: 'sin⁻¹', sisip: 'asin(' },
  { l: 'cos⁻¹', sisip: 'acos(' },
  { l: 'tan⁻¹', sisip: 'atan(' },
  { l: 'xʸ', sisip: '^', aria: 'Pangkat' },
  { l: 'x²', sisip: '^2', aria: 'Kuadrat' },
  { l: 'ln', sisip: 'ln(' },
  { l: 'log', sisip: 'log(' },
  { l: '√', sisip: '√(', aria: 'Akar' },
  { l: '∛', sisip: 'cbrt(', aria: 'Akar pangkat tiga' },
  { l: 'x!', sisip: '!', aria: 'Faktorial' },
  { l: '1/x', sisip: '^-1', aria: 'Kebalikan' },
  { l: '|x|', sisip: 'abs(', aria: 'Nilai mutlak' },
  { l: 'mod', sisip: ' mod ', aria: 'Modulo' },
  { l: 'EXP', sisip: 'E', aria: 'Kali sepuluh pangkat' },
  { l: 'Ans', aksi: 'ans', aria: 'Jawaban terakhir' },
]

function bacaRiwayat(): Riwayat[] {
  try {
    return JSON.parse(localStorage.getItem(KUNCI) || '[]')
  } catch {
    return []
  }
}

export default function Umum() {
  const [ekspr, setEkspr] = useState('')
  const [ilmiah, setIlmiah] = useState(() => matchMedia('(min-width: 768px)').matches)
  const [sudut, setSudut] = useState<ModeSudut>('deg')
  const [ans, setAns] = useState(0)
  const [memori, setMemori] = useState<number | null>(null)
  const [riwayat, setRiwayat] = useState<Riwayat[]>(bacaRiwayat)
  const [galat, setGalat] = useState<string | null>(null)
  const [baruSelesai, setBaruSelesai] = useState(false)
  const [goyang, setGoyang] = useState(0)
  const layar = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem(KUNCI, JSON.stringify(riwayat.slice(0, 50)))
    } catch {
      /* abaikan */
    }
  }, [riwayat])

  // Pratinjau langsung saat mengetik.
  const pratinjau = useMemo(() => {
    if (!ekspr.trim()) return ''
    try {
      const v = hitung(ekspr, { sudut, ans })
      return formatHasil(v)
    } catch {
      return ''
    }
  }, [ekspr, sudut, ans])

  const sisip = useCallback(
    (s: string) => {
      setGalat(null)
      setEkspr((e) => {
        const operatorLanjut = /^[+\-×÷^%!]/.test(s) || s.startsWith(' mod')
        if (baruSelesai && !operatorLanjut) return s === '()' ? '(' : s
        if (s === '()') {
          const buka = (e.match(/\(/g) ?? []).length
          const tutup = (e.match(/\)/g) ?? []).length
          return e + (buka > tutup && /[\d)πe!%]$/.test(e) ? ')' : '(')
        }
        return e + s
      })
      setBaruSelesai(false)
    },
    [baruSelesai],
  )

  const samaDengan = useCallback(() => {
    if (!ekspr.trim()) return
    try {
      const v = hitung(ekspr, { sudut, ans })
      const h = formatHasil(v)
      setRiwayat((r) => [{ ekspr, hasil: h, nilai: v, waktu: new Date().toISOString() }, ...r].slice(0, 50))
      setAns(v)
      setEkspr(Number.isFinite(v) ? String(Number(v.toPrecision(14))).replace('.', ',') : '')
      setBaruSelesai(true)
      setGalat(null)
      bunyi('sukses')
      catat('kalkulator', 'hitung', ekspr.length, { mode: 'umum' })
    } catch (e) {
      setGalat(e instanceof GalatHitung ? e.message : 'Ekspresi tidak valid')
      setGoyang((g) => g + 1)
      bunyi('galat')
    }
  }, [ekspr, sudut, ans])

  const tekan = useCallback(
    (t: Tombol) => {
      bunyi('tap')
      if (t.sisip) return sisip(t.sisip)
      switch (t.aksi) {
        case 'hapus':
          setEkspr('')
          setGalat(null)
          return
        case 'mundur':
          setEkspr((e) => e.slice(0, -1))
          return
        case 'sama':
          return samaDengan()
        case 'ans':
          return sisip('Ans')
        case 'tanda':
          setEkspr((e) => (e.startsWith('-(') && e.endsWith(')') ? e.slice(2, -1) : e ? `-(${e})` : '-'))
          setBaruSelesai(false)
          return
      }
    },
    [sisip, samaDengan],
  )

  const nilaiSekarang = () => {
    try {
      return hitung(ekspr || '0', { sudut, ans })
    } catch {
      return null
    }
  }

  // Papan ketik fisik.
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if ((tag === 'INPUT' && e.target !== layar.current) || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.target === layar.current) {
        if (e.key === 'Enter' || e.key === '=') {
          e.preventDefault()
          samaDengan()
        }
        if (e.key === 'Escape') setEkspr('')
        return
      }
      const k = e.key
      if (/^[0-9]$/.test(k)) sisip(k)
      else if (k === '.' || k === ',') sisip(',')
      else if (k === '+' || k === '-') sisip(k)
      else if (k === '*' || k === 'x') sisip('×')
      else if (k === '/') {
        e.preventDefault()
        sisip('÷')
      } else if (k === '^' || k === '%' || k === '!' || k === '(' || k === ')') sisip(k)
      else if (k === 'Enter' || k === '=') {
        e.preventDefault()
        samaDengan()
      } else if (k === 'Backspace') setEkspr((x) => x.slice(0, -1))
      else if (k === 'Escape' || k === 'Delete') setEkspr('')
      else return
    }
    addEventListener('keydown', f)
    return () => removeEventListener('keydown', f)
  }, [sisip, samaDengan])

  const hasilTampil = galat ?? pratinjau

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <div className="card overflow-hidden">
        {/* Layar */}
        <div className="relative border-b border-line bg-surface-2/60 px-5 pt-4 pb-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Segmented ukuran="sm" label="Satuan sudut" nilai={sudut} onChange={setSudut} pilihan={[{ id: 'deg', label: 'DEG' }, { id: 'rad', label: 'RAD' }]} />
              {memori !== null && <span className="rounded-md bg-accent-soft px-1.5 py-0.5 font-mono text-[11px] font-bold text-accent-text">M</span>}
            </div>
            <Segmented ukuran="sm" label="Jenis kalkulator" nilai={ilmiah ? 'i' : 's'} onChange={(v) => setIlmiah(v === 'i')} pilihan={[{ id: 's', label: 'Standar' }, { id: 'i', label: 'Ilmiah' }]} />
          </div>
          <label htmlFor="kalk-layar" className="sr-only">
            Ekspresi
          </label>
          <input
            id="kalk-layar"
            ref={layar}
            value={ekspr}
            onChange={(e) => {
              setEkspr(e.target.value)
              setGalat(null)
              setBaruSelesai(false)
            }}
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            placeholder="0"
            className="w-full bg-transparent text-right font-mono text-[26px] text-ink-2 outline-none placeholder:text-ink-3 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40 sm:text-[30px]"
          />
          <motion.output
            key={goyang}
            animate={galat ? { x: [0, -10, 10, -6, 6, 0] } : {}}
            transition={{ duration: 0.35 }}
            aria-live="polite"
            className={cn('mt-1 block min-h-[52px] truncate text-right font-display text-[40px] leading-tight font-semibold tabular sm:text-[46px]', galat ? 'text-[20px] text-danger' : baruSelesai ? 'text-ink' : 'text-ink-3')}
          >
            {hasilTampil ? (galat ? hasilTampil : `= ${hasilTampil}`) : ' '}
          </motion.output>
          <div className="mt-2 flex flex-wrap items-center justify-end gap-1.5">
            {(['mc', 'mr', 'm+', 'm-'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  bunyi('tap')
                  const v = nilaiSekarang()
                  if (m === 'mc') setMemori(null)
                  if (m === 'mr' && memori !== null) sisip(String(memori).replace('.', ','))
                  if (m === 'm+' && v !== null) setMemori((x) => (x ?? 0) + v)
                  if (m === 'm-' && v !== null) setMemori((x) => (x ?? 0) - v)
                }}
                className="h-8 rounded-lg px-2.5 font-mono text-xs font-bold text-ink-3 uppercase transition-colors hover:bg-surface hover:text-ink"
                aria-label={{ mc: 'Hapus memori', mr: 'Panggil memori', 'm+': 'Tambah ke memori', 'm-': 'Kurangi dari memori' }[m]}
              >
                {m}
              </button>
            ))}
            <CopyButton teks={pratinjau.replace(/\./g, '')} tool="kalkulator" varian="ghost" label="Salin" />
            <IconButton label="Hapus satu" ukuran="sm" onClick={() => tekan({ l: '⌫', aksi: 'mundur' })}>
              <Delete />
            </IconButton>
          </div>
        </div>

        {/* Tombol */}
        <div className={cn('grid gap-2 p-3 sm:gap-2.5 sm:p-4', ilmiah ? 'md:grid-cols-[1.25fr_1fr]' : '')}>
          <AnimatePresence initial={false}>
            {ilmiah && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-5 gap-2 sm:gap-2.5"
              >
                {ILMIAH.map((t) => (
                  <TombolKalk key={t.l} t={{ ...t, jenis: 'fn' }} onTekan={tekan} kecil />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
            {DASAR.map((t) => (
              <TombolKalk key={t.l} t={t} onTekan={tekan} />
            ))}
          </div>
        </div>
      </div>

      {/* Riwayat */}
      <section className="card flex max-h-[640px] flex-col" aria-label="Riwayat perhitungan">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="flex items-center gap-2 text-[13.5px] font-bold text-ink-2">
            <History className="size-4" aria-hidden /> Riwayat
          </h2>
          <div className="flex gap-1">
            <TombolSimpan
              tool="kalkulator"
              kind="calc"
              label="Simpan"
              judulAwal={riwayat[0] ? `${riwayat[0].ekspr} = ${riwayat[0].hasil}` : 'Perhitungan'}
              konten={{ riwayat: riwayat.slice(0, 20) }}
              nonaktif={!riwayat.length}
            />
            <IconButton label="Hapus riwayat" ukuran="sm" onClick={() => setRiwayat([])} disabled={!riwayat.length}>
              <Trash2 />
            </IconButton>
          </div>
        </div>
        <ul className="min-h-40 flex-1 overflow-y-auto p-2">
          {riwayat.length === 0 && <li className="px-3 py-10 text-center text-sm text-ink-3">Belum ada perhitungan. Hasil tersimpan di perangkat ini.</li>}
          <AnimatePresence initial={false}>
            {riwayat.map((r) => (
              <motion.li key={r.waktu} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <button
                  onClick={() => {
                    setEkspr(r.ekspr)
                    setBaruSelesai(false)
                  }}
                  className="w-full rounded-xl px-3 py-2.5 text-right transition-colors hover:bg-surface-2"
                  title="Pakai lagi ekspresi ini"
                >
                  <span className="block truncate font-mono text-[13px] text-ink-3">{r.ekspr}</span>
                  <span className="block truncate font-display text-lg font-semibold tabular">= {r.hasil}</span>
                  <span className="block text-[11px] text-ink-3">{waktuRelatif(r.waktu)}</span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <div className="border-t border-line p-3 text-center text-xs text-ink-3">Papan ketik: angka, + − * / ^ ( ) %, Enter, Esc</div>
        <div className="px-3 pb-3">
          <Button ukuran="sm" varian="ghost" penuh onClick={() => sisip('Ans')}>
            Pakai Ans = {formatHasil(ans)}
          </Button>
        </div>
      </section>
    </div>
  )
}

function TombolKalk({ t, onTekan, kecil }: { t: Tombol; onTekan: (t: Tombol) => void; kecil?: boolean }) {
  return (
    <motion.button
      whileHover={{ y: -1.5 }}
      whileTap={{ scale: 0.9, y: 1 }}
      transition={{ type: 'spring', stiffness: 600, damping: 24 }}
      onClick={() => onTekan(t)}
      aria-label={t.aria ?? t.l}
      className={cn(
        'relative flex items-center justify-center rounded-2xl font-semibold transition-colors select-none',
        kecil ? 'h-11 text-[14px] sm:h-12' : 'h-14 text-[21px] sm:h-16',
        t.jenis === 'angka' && 'bg-surface-2 text-ink hover:bg-surface-3',
        t.jenis === 'op' && 'bg-accent-soft text-accent-text hover:brightness-95 dark:hover:brightness-110',
        t.jenis === 'fn' && 'bg-surface text-ink-2 ring-1 ring-line hover:bg-surface-2 hover:text-ink',
        t.jenis === 'sama' && 'bg-accent text-accent-ink shadow-[0_8px_20px_-10px_var(--accent)] hover:bg-accent-hover',
        t.jenis === 'bahaya' && 'bg-danger-soft text-danger hover:brightness-95',
      )}
    >
      {t.l}
    </motion.button>
  )
}
