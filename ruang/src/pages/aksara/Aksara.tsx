import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeftRight, Keyboard, Languages, ScanText, Volume2 } from 'lucide-react'
import { Sunda } from '@/legacy'
import { catat } from '@/lib/activity'
import { cn } from '@/lib/utils'
import { bunyi } from '@/lib/sound'
import { PageHeader } from '@/components/ui/Layout'
import { Button, IconButton } from '@/components/ui/Button'
import { CopyButton, Segmented } from '@/components/ui/Controls'
import { useToast } from '@/components/ui/Toast'
import { Chip, Statistik, TombolBersih, TombolSimpan, TombolTempel, TombolUnduh, useSimpanOtomatis } from '@/components/ToolKit'
import { ANGKA, FRASA, NGALAGENA, RARANGKEN, SERAPAN, SWARA, sukuKata, type Kunci } from './data'

type Arah = 'l2s' | 's2l'
const KUNCI_SIMPAN = 'ruang:aksara:draf'

export default function Aksara() {
  const [arah, setArah] = useState<Arah>('l2s')
  const [teks, setTeks] = useState(() => {
    try {
      return localStorage.getItem(KUNCI_SIMPAN) ?? ''
    } catch {
      return ''
    }
  })
  const [papan, setPapan] = useState(false)
  const [silaba, setSilaba] = useState(false)
  const [angkaBatas, setAngkaBatas] = useState(true)
  const input = useRef<HTMLTextAreaElement>(null)
  const toast = useToast()
  const simpanOto = useSimpanOtomatis()

  const hasil = useMemo(() => {
    if (!teks) return ''
    return arah === 'l2s' ? Sunda.latinToSunda(teks, { wrapNumbers: angkaBatas }) : Sunda.sundaToLatin(teks)
  }, [teks, arah, angkaBatas])

  useEffect(() => {
    try {
      localStorage.setItem(KUNCI_SIMPAN, teks)
    } catch {
      /* abaikan */
    }
    if (teks) catat('aksara', 'ubah', teks.length, { arah })
  }, [teks, arah])

  const latin = arah === 'l2s' ? teks : hasil

  function sisip(s: string) {
    const el = input.current
    if (!el) return setTeks((t) => t + s)
    const a = el.selectionStart ?? teks.length
    const b = el.selectionEnd ?? teks.length
    const baru = teks.slice(0, a) + s + teks.slice(b)
    setTeks(baru)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(a + s.length, a + s.length)
    })
  }

  function tukar() {
    setArah((a) => (a === 'l2s' ? 's2l' : 'l2s'))
    setTeks(hasil)
    bunyi('toggle')
  }

  function lafal() {
    if (!latin.trim()) return toast('Belum ada teks untuk dilafalkan', { nada: 'info' })
    if (!('speechSynthesis' in window)) return toast('Peramban belum mendukung suara', { nada: 'galat' })
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(latin)
    const suara = speechSynthesis.getVoices()
    u.voice = suara.find((v) => v.lang.startsWith('su')) ?? suara.find((v) => v.lang.startsWith('id')) ?? null
    u.lang = u.voice?.lang ?? 'id-ID'
    u.rate = 0.88
    speechSynthesis.speak(u)
    catat('aksara', 'lafal', latin.length)
  }

  const kata = latin.split(/\s+/).filter((w) => /[a-zA-Zé]/.test(w)).slice(0, 40)

  return (
    <div>
      <PageHeader
        eyebrow="Aksara Sunda"
        judul="Pangalihtulis"
        deskripsi="Alih aksara Latin ⇄ Aksara Sunda baku sesuai kaidah rarangkén, lengkap dengan papan ketik virtual dan pemenggalan suku kata."
        ikon={<Languages />}
        aksi={
          <Segmented
            label="Arah konversi"
            nilai={arah}
            onChange={(v) => {
              if (v !== arah) tukar()
            }}
            pilihan={[
              { id: 'l2s', label: 'Latin → Aksara' },
              { id: 's2l', label: 'Aksara → Latin' },
            ]}
          />
        }
      />

      <div className="card overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_auto_1fr]">
          {/* Masukan */}
          <div className="flex min-w-0 flex-col">
            <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2 sm:px-5">
              <span className="flex items-center gap-2 text-[13.5px] font-bold text-ink-2">
                <span className="size-2 rounded-full bg-accent" aria-hidden />
                {arah === 'l2s' ? 'Teks Latin' : 'Aksara Sunda'}
              </span>
              <div className="flex items-center gap-1">
                <TombolTempel onTempel={setTeks} />
                <TombolBersih onBersih={() => setTeks('')} nonaktif={!teks} />
              </div>
            </div>
            <label htmlFor="aksara-input" className="sr-only">
              Teks masukan
            </label>
            <textarea
              id="aksara-input"
              ref={input}
              value={teks}
              onChange={(e) => setTeks(e.target.value)}
              placeholder={arah === 'l2s' ? 'Ketik di sini, mis. Sampurasun, kumaha damang?' : 'Tempel aksara Sunda di sini…'}
              className={cn('min-h-56 flex-1 resize-none bg-transparent px-4 py-4 text-[17px] leading-relaxed outline-none placeholder:text-ink-3 sm:px-5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40', arah === 's2l' && 'sunda text-[24px]')}
              spellCheck={false}
            />
            <div className="flex flex-col gap-2.5 border-t border-line px-4 py-3 sm:px-5">
              {arah === 'l2s' && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs font-semibold text-ink-3">Sisip:</span>
                  {['é', 'eu', 'è', '|'].map((s) => (
                    <button
                      key={s}
                      onClick={() => sisip(s)}
                      className="h-8 min-w-9 rounded-lg border border-line bg-surface px-2 font-mono text-sm font-semibold transition-colors hover:border-accent hover:text-accent-text"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs font-semibold text-ink-3">Contoh:</span>
                {FRASA.map((f) => (
                  <Chip
                    key={f.label}
                    onClick={() => {
                      if (arah !== 'l2s') setArah('l2s')
                      setTeks(f.latin)
                    }}
                  >
                    {f.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          {/* Poros tukar */}
          <div className="relative flex items-center justify-center border-y border-line py-2 lg:border-x lg:border-y-0 lg:px-2 lg:py-0">
            <motion.button
              onClick={tukar}
              whileHover={{ rotate: 180, scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
              className="grid size-12 place-items-center rounded-full bg-ink text-bg shadow-[var(--shadow-lift)]"
              aria-label="Tukar arah konversi"
              title="Tukar arah"
            >
              <ArrowLeftRight className="size-5" />
            </motion.button>
          </div>

          {/* Hasil */}
          <div className="flex min-w-0 flex-col bg-surface-2/40">
            <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2 sm:px-5">
              <span className="flex items-center gap-2 text-[13.5px] font-bold text-ink-2">
                <span className="size-2 rounded-full bg-success" aria-hidden />
                {arah === 'l2s' ? 'Aksara Sunda' : 'Teks Latin'}
              </span>
              <div className="flex flex-wrap items-center gap-1">
                <IconButton label="Lafalkan" ukuran="sm" onClick={lafal}>
                  <Volume2 />
                </IconButton>
                <IconButton label="Suku kata" ukuran="sm" varian={silaba ? 'soft' : 'ghost'} onClick={() => setSilaba((s) => !s)} aria-pressed={silaba}>
                  <ScanText />
                </IconButton>
                <IconButton label="Papan ketik aksara" ukuran="sm" varian={papan ? 'soft' : 'ghost'} onClick={() => setPapan((p) => !p)} aria-pressed={papan}>
                  <Keyboard />
                </IconButton>
                <TombolUnduh teks={hasil} nama="aksara-sunda.txt" tool="aksara" />
                <CopyButton teks={hasil} tool="aksara" onSalin={() => simpanOto('aksara', teks, { masukan: teks, hasil, arah })} />
              </div>
            </div>
            <output
              aria-live="polite"
              className={cn('min-h-56 flex-1 px-4 py-4 break-words whitespace-pre-wrap sm:px-5', arah === 'l2s' ? 'sunda text-[30px] leading-[1.7] text-ink' : 'text-[17px] leading-relaxed')}
            >
              {hasil || <span className="text-[15px] font-normal text-ink-3 [font-family:var(--font-sans)]">Hasil alih aksara akan muncul di sini.</span>}
            </output>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 sm:px-5">
              <Statistik teks={hasil} />
              <div className="flex items-center gap-2">
                {arah === 'l2s' && (
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-3">
                    <input type="checkbox" checked={angkaBatas} onChange={(e) => setAngkaBatas(e.target.checked)} className="size-4" />
                    Apit angka dengan |
                  </label>
                )}
                <TombolSimpan tool="aksara" judulAwal={teks || 'Aksara Sunda'} konten={{ masukan: teks, hasil, arah }} nonaktif={!hasil} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {silaba && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
            aria-label="Pemenggalan suku kata"
          >
            <div className="card mt-4 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">Pemenggalan suku kata</h2>
                <span className="text-xs text-ink-3">{kata.length} kata</span>
              </div>
              {kata.length === 0 ? (
                <p className="text-sm text-ink-3">Ketik kata Sunda untuk melihat pemenggalannya.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {kata.map((w, i) => (
                    <motion.div
                      key={w + i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="rounded-xl border border-line bg-surface p-2.5"
                    >
                      <div className="flex gap-1">
                        {sukuKata(w).map((s, j) => (
                          <span key={j} className="flex flex-col items-center rounded-lg bg-surface-2 px-2 py-1">
                            <span className="sunda text-xl leading-tight">{Sunda.latinToSunda(s)}</span>
                            <span className="font-mono text-[11px] text-ink-3">{s}</span>
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {papan && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="card mt-4 p-4 sm:p-5"
            aria-label="Papan ketik aksara Sunda"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-bold">Papan ketik aksara</h2>
              <Button
                ukuran="sm"
                varian="ghost"
                onClick={() => {
                  if (arah !== 's2l') {
                    setArah('s2l')
                    setTeks('')
                  }
                }}
              >
                {arah === 's2l' ? 'Mengetik aksara' : 'Pindah ke mode Aksara → Latin'}
              </Button>
            </div>
            {(
              [
                ['Swara (vokal mandiri)', SWARA],
                ['Ngalagena (konsonan)', NGALAGENA],
                ['Serapan', SERAPAN],
                ['Rarangkén', RARANGKEN],
                ['Angka', [...ANGKA, { ch: '|', latin: 'batas' }]],
              ] as [string, Kunci[]][]
            ).map(([judul, daftar]) => (
              <div key={judul} className="mb-3 last:mb-0">
                <p className="eyebrow mb-1.5">{judul}</p>
                <div className="flex flex-wrap gap-1.5">
                  {daftar.map((k) => (
                    <motion.button
                      key={k.ch + k.latin}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.9, y: 1 }}
                      onClick={() => {
                        if (arah !== 's2l') {
                          setArah('s2l')
                          setTeks(k.ch)
                        } else sisip(k.ch)
                        bunyi('tap')
                      }}
                      title={k.ket ?? k.latin}
                      className="flex h-14 w-12 flex-col items-center justify-center rounded-xl border border-line bg-surface shadow-[0_2px_0_var(--line)] transition-colors hover:border-accent hover:bg-accent-soft"
                    >
                      <span className="sunda text-xl leading-none">{RARANGKEN.includes(k) ? `◌${k.ch}` : k.ch}</span>
                      <span className="mt-1 font-mono text-[10px] text-ink-3">{k.latin}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
