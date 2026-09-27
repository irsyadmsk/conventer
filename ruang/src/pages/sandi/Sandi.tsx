import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, Lock, Unlock, Wand2 } from 'lucide-react'
import { Ciphers } from '@/legacy'
import { catat } from '@/lib/activity'
import { cn } from '@/lib/utils'
import { PageHeader, Panel } from '@/components/ui/Layout'
import { Button } from '@/components/ui/Button'
import { CopyButton, Segmented, Slider } from '@/components/ui/Controls'
import { Input } from '@/components/ui/Field'
import { TombolBersih, TombolSimpan, TombolTempel } from '@/components/ToolKit'

const ABJAD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
// Frekuensi huruf bahasa Indonesia (perkiraan, %) untuk pembanding.
const FREK_ID: Record<string, number> = {
  A: 19.0, N: 9.0, I: 8.0, E: 7.8, K: 5.3, U: 5.1, T: 5.0, R: 4.7, S: 4.6, M: 4.2, D: 4.1, G: 3.7, L: 3.6, P: 2.9, B: 2.8, H: 2.4, O: 2.2, Y: 1.9, J: 0.9, C: 0.7, W: 0.5, F: 0.2, V: 0.1, Z: 0.05, X: 0.02, Q: 0.01,
}

function RodaCaesar({ geser }: { geser: number }) {
  const r1 = 120
  const r2 = 88
  return (
    <svg viewBox="-150 -150 300 300" className="mx-auto w-full max-w-[280px]" role="img" aria-label={`Roda Caesar, geser ${geser}: A menjadi ${ABJAD[geser % 26]}`}>
      <circle r="146" fill="var(--surface-2)" stroke="var(--line)" />
      <circle r="104" fill="var(--surface)" stroke="var(--line)" />
      {ABJAD.split('').map((c, i) => {
        const a = (i / 26) * Math.PI * 2 - Math.PI / 2
        return (
          <text key={c} x={Math.cos(a) * r1} y={Math.sin(a) * r1} textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="700" fill={i === 0 ? 'var(--accent-text)' : 'var(--ink)'} fontFamily="var(--font-mono)">
            {c}
          </text>
        )
      })}
      <motion.g animate={{ rotate: (-geser * 360) / 26 }} transition={{ type: 'spring', stiffness: 90, damping: 14 }}>
        {ABJAD.split('').map((c, i) => {
          const a = (i / 26) * Math.PI * 2 - Math.PI / 2
          return (
            <text key={c} x={Math.cos(a) * r2} y={Math.sin(a) * r2} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill={i === geser % 26 ? 'var(--accent-text)' : 'var(--ink-3)'} fontFamily="var(--font-mono)">
              {c}
            </text>
          )
        })}
      </motion.g>
      <path d="M0 -140 L-7 -128 L7 -128 Z" fill="var(--accent)" />
      <circle r="40" fill="var(--ink)" />
      <text textAnchor="middle" dominantBaseline="central" fill="var(--bg)" fontSize="26" fontWeight="700" fontFamily="var(--font-display)">
        +{geser}
      </text>
    </svg>
  )
}

export default function Sandi() {
  const [algo, setAlgo] = useState<'caesar' | 'vigenere'>('caesar')
  const [mode, setMode] = useState<'enc' | 'dec'>('enc')
  const [geser, setGeser] = useState(3)
  const [kunci, setKunci] = useState('RUANG')
  const [teks, setTeks] = useState('')

  const hasil = useMemo(() => {
    if (!teks) return ''
    if (algo === 'caesar') return mode === 'enc' ? Ciphers.caesar.encode(teks, geser) : Ciphers.caesar.decode(teks, geser)
    return mode === 'enc' ? Ciphers.vigenere.encode(teks, kunci) : Ciphers.vigenere.decode(teks, kunci)
  }, [teks, algo, mode, geser, kunci])

  useEffect(() => {
    if (teks) catat('sandi', 'ubah', teks.length, { algo, mode })
  }, [teks, algo, mode])

  const frek = useMemo(() => Ciphers.frequency.analyze(mode === 'enc' ? hasil : teks), [hasil, teks, mode])
  const maks = Math.max(1, ...Object.values(frek.counts))

  /** Pecahkan Caesar otomatis: pilih geser dengan chi-kuadrat terendah terhadap frekuensi bahasa Indonesia. */
  function pecahkan() {
    const sumber = mode === 'dec' ? teks : hasil
    let terbaik = 0
    let skor = Infinity
    for (let g = 0; g < 26; g++) {
      const coba = Ciphers.caesar.decode(sumber, g)
      const f = Ciphers.frequency.analyze(coba)
      if (!f.totalLetters) return
      let chi = 0
      for (const c of ABJAD) {
        const harap = (FREK_ID[c] / 100) * f.totalLetters
        chi += (f.counts[c] - harap) ** 2 / Math.max(harap, 0.01)
      }
      if (chi < skor) {
        skor = chi
        terbaik = g
      }
    }
    setAlgo('caesar')
    setMode('dec')
    if (mode !== 'dec') setTeks(sumber)
    setGeser(terbaik || 26)
    catat('sandi', 'pecahkan')
  }

  return (
    <div>
      <PageHeader
        eyebrow="Kode & Sandi"
        judul="Sandi Klasik"
        deskripsi="Enkripsi dan dekripsi Caesar & Vigenère, lengkap dengan roda sandi interaktif dan analisis frekuensi huruf untuk memecahkan sandi."
        ikon={<KeyRound />}
        aksi={
          <Segmented
            label="Algoritma"
            nilai={algo}
            onChange={setAlgo}
            pilihan={[
              { id: 'caesar', label: 'Caesar' },
              { id: 'vigenere', label: 'Vigenère' },
            ]}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Panel judul={algo === 'caesar' ? 'Roda sandi' : 'Kata kunci'} titik="aksen">
          {algo === 'caesar' ? (
            <div className="flex flex-col gap-4">
              <RodaCaesar geser={geser % 26} />
              <Slider label="Geser" nilai={geser} min={1} max={25} onChange={setGeser} />
              <p className="text-center font-mono text-sm text-ink-2">
                A → {ABJAD[geser % 26]} · B → {ABJAD[(geser + 1) % 26]} · Z → {ABJAD[(geser + 25) % 26]}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Input label="Kata kunci" value={kunci} onChange={(e) => setKunci(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))} bantuan="Hanya huruf A–Z. Semakin panjang semakin kuat." />
              <div className="flex flex-wrap gap-1">
                {kunci.split('').map((c, i) => (
                  <span key={i} className="grid size-9 place-items-center rounded-lg bg-accent-soft font-mono text-sm font-bold text-accent-text">
                    {c}
                    <span className="sr-only">geser {ABJAD.indexOf(c)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <Panel
          judul="Teks"
          aksi={
            <>
              <Segmented
                ukuran="sm"
                label="Mode"
                nilai={mode}
                onChange={setMode}
                pilihan={[
                  { id: 'enc', label: 'Enkripsi', ikon: <Lock /> },
                  { id: 'dec', label: 'Dekripsi', ikon: <Unlock /> },
                ]}
              />
              <TombolTempel onTempel={setTeks} />
              <TombolBersih onBersih={() => setTeks('')} nonaktif={!teks} />
            </>
          }
        >
          <label htmlFor="sandi-in" className="sr-only">
            Teks
          </label>
          <textarea
            id="sandi-in"
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            placeholder={mode === 'enc' ? 'Ketik pesan rahasia…' : 'Tempel teks bersandi…'}
            className="field min-h-32 font-mono"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="eyebrow">Hasil {mode === 'enc' ? 'enkripsi' : 'dekripsi'}</p>
            <div className="flex flex-wrap gap-1.5">
              {algo === 'caesar' && (
                <Button ukuran="sm" varian="ghost" ikon={<Wand2 />} onClick={pecahkan} disabled={!teks}>
                  Pecahkan otomatis
                </Button>
              )}
              <CopyButton teks={hasil} tool="sandi" />
              <TombolSimpan tool="sandi" judulAwal={`${algo === 'caesar' ? 'Caesar' : 'Vigenère'}: ${teks.slice(0, 40)}`} konten={{ masukan: teks, hasil, algo, mode, geser, kunci }} nonaktif={!hasil} />
            </div>
          </div>
          <output aria-live="polite" className="mt-2 block min-h-24 rounded-xl bg-surface-2 p-4 font-mono text-[15px] break-words whitespace-pre-wrap">
            {hasil || <span className="text-ink-3">—</span>}
          </output>
        </Panel>
      </div>

      <Panel judul="Analisis frekuensi huruf" className="mt-4" aksi={<span className="text-xs font-semibold text-ink-3 tabular">{frek.totalLetters} huruf dianalisis</span>}>
        <div className="flex h-44 items-end gap-[3px] sm:gap-1.5" role="img" aria-label="Diagram batang frekuensi huruf A sampai Z">
          {ABJAD.split('').map((c, i) => {
            const n = frek.counts[c] ?? 0
            return (
              <div key={c} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] font-semibold text-ink-3 tabular">{n || ''}</span>
                <div className="relative w-full flex-1">
                  <motion.div
                    className={cn('absolute inset-0 origin-bottom rounded-t-md', n === maks && n > 0 ? 'bg-accent' : 'bg-line-2')}
                    initial={false}
                    animate={{ scaleY: Math.max(0.015, n / maks) }}
                    transition={{ type: 'spring', stiffness: 180, damping: 22, delay: i * 0.008 }}
                  />
                </div>
                <span className="font-mono text-[10px] font-bold text-ink-2 sm:text-xs">{c}</span>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-[13px] text-ink-3">Dalam bahasa Indonesia, huruf paling sering adalah A, N, I, E. Huruf tertinggi di teks bersandi biasanya mewakili A.</p>
      </Panel>
    </div>
  )
}
