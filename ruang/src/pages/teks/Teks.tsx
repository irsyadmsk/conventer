import { useAuth } from '@/lib/auth'
import { kunciDrafAkun } from '@/lib/account-scope'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FlipHorizontal, MonitorPlay, Pause, Play, RotateCcw, Type, X } from 'lucide-react'
import { DevCase } from '@/legacy'
import { catat } from '@/lib/activity'
import { angka, cn } from '@/lib/utils'
import { AngkaHidup, PageHeader, Panel } from '@/components/ui/Layout'
import { Button } from '@/components/ui/Button'
import { CopyButton, Slider } from '@/components/ui/Controls'
import { TombolBersih, TombolSimpan, TombolTempel } from '@/components/ToolKit'

const KASUS: { k: string; nama: string }[] = [
  { k: 'camelCase', nama: 'camelCase' },
  { k: 'pascalCase', nama: 'PascalCase' },
  { k: 'snakeCase', nama: 'snake_case' },
  { k: 'kebabCase', nama: 'kebab-case' },
  { k: 'constantCase', nama: 'CONSTANT_CASE' },
  { k: 'titleCase', nama: 'Title Case' },
  { k: 'sentenceCase', nama: 'Sentence case' },
  { k: 'dotCase', nama: 'dot.case' },
  { k: 'pathCase', nama: 'path/case' },
  { k: 'headerCase', nama: 'Header-Case' },
]

const KUNCI = 'ruang:teks:draf'

function Teleprompter({ teks, tutup }: { teks: string; tutup: () => void }) {
  const [jalan, setJalan] = useState(false)
  const [cepat, setCepat] = useState(40)
  const [ukuran, setUkuran] = useState(44)
  const [cermin, setCermin] = useState(false)
  const wadah = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!jalan) return
    let raf = 0
    let akhir = performance.now()
    const f = (t: number) => {
      const dt = (t - akhir) / 1000
      akhir = t
      const el = wadah.current
      if (el) {
        el.scrollTop += cepat * dt
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) setJalan(false)
      }
      raf = requestAnimationFrame(f)
    }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
  }, [jalan, cepat])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setJalan((j) => !j)
      }
      if (e.key === 'Escape') tutup()
      if (e.key === 'ArrowUp') setCepat((c) => Math.min(200, c + 10))
      if (e.key === 'ArrowDown') setCepat((c) => Math.max(10, c - 10))
    }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [tutup])

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex flex-col bg-black text-white" role="dialog" aria-label="Teleprompter">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 z-10 h-[3px] bg-[#f07e66]/60" aria-hidden />
      <div ref={wadah} className="flex-1 overflow-y-auto px-[8vw] py-[40vh]" style={{ transform: cermin ? 'scaleX(-1)' : undefined }}>
        <p className="mx-auto max-w-4xl leading-[1.45] font-semibold whitespace-pre-wrap" style={{ fontSize: ukuran }}>
          {teks || 'Tulis naskah Anda terlebih dahulu.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 border-t border-white/10 bg-black/90 px-4 py-3">
        <button onClick={() => setJalan((j) => !j)} className="flex h-11 items-center gap-2 rounded-xl bg-[#f07e66] px-4 font-semibold text-black">
          {jalan ? <Pause className="size-4" /> : <Play className="size-4" />}
          {jalan ? 'Jeda' : 'Mulai'}
        </button>
        <button onClick={() => wadah.current?.scrollTo({ top: 0 })} className="grid size-11 place-items-center rounded-xl bg-white/10" aria-label="Kembali ke awal">
          <RotateCcw className="size-4" />
        </button>
        <button onClick={() => setCermin((c) => !c)} aria-pressed={cermin} className={cn('grid size-11 place-items-center rounded-xl', cermin ? 'bg-white text-black' : 'bg-white/10')} aria-label="Cermin">
          <FlipHorizontal className="size-4" />
        </button>
        <label className="flex items-center gap-2 text-sm">
          Kecepatan
          <input type="range" min={10} max={200} value={cepat} onChange={(e) => setCepat(Number(e.target.value))} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          Ukuran
          <input type="range" min={24} max={96} value={ukuran} onChange={(e) => setUkuran(Number(e.target.value))} />
        </label>
        <button onClick={tutup} className="grid size-11 place-items-center rounded-xl bg-white/10" aria-label="Tutup teleprompter">
          <X className="size-4" />
        </button>
      </div>
    </motion.div>,
    document.body,
  )
}

export default function Teks() {
  const { user } = useAuth()
  const draftKey = kunciDrafAkun(KUNCI, user?.id)
  const [teks, setTeks] = useState(() => {
    try {
      return localStorage.getItem(draftKey) ?? ''
    } catch {
      return ''
    }
  })
  const [prompter, setPrompter] = useState(false)
  const [wpm, setWpm] = useState(130)

  useEffect(() => {
    try {
      localStorage.setItem(draftKey, teks)
    } catch {
      /* abaikan */
    }
    if (teks) catat('teks', 'ubah', teks.length)
  }, [teks, draftKey])

  const st = useMemo(() => DevCase.TextStats.analyze(teks), [teks])
  const kasus = useMemo(() => (teks.trim() ? DevCase.CaseConverter.getAllCases(teks.slice(0, 500)) : {}), [teks])
  const detikBicara = Math.ceil((st.words / wpm) * 60)
  const fmt = (s: number) => (s < 60 ? `${s} dtk` : `${Math.floor(s / 60)} mnt ${s % 60 ? `${s % 60} dtk` : ''}`)

  const kataTeratas = useMemo(() => {
    const henti = new Set('yang dan di ke dari untuk dengan ini itu dalam pada adalah akan atau juga tidak ada the a of to and in is'.split(' '))
    const m = new Map<string, number>()
    teks
      .toLowerCase()
      .match(/[a-zà-ÿ]{3,}/g)
      ?.forEach((w) => !henti.has(w) && m.set(w, (m.get(w) ?? 0) + 1))
    return [...m].sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [teks])

  const stat = [
    { l: 'Kata', v: st.words },
    { l: 'Karakter', v: st.characters },
    { l: 'Tanpa spasi', v: st.charactersNoSpaces },
    { l: 'Kalimat', v: st.sentences },
    { l: 'Paragraf', v: st.paragraphs },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Teks & Visual"
        judul="Analisis & Prompter"
        deskripsi="Hitung kata dan durasi bicara untuk pidato atau presentasi, ubah format penamaan, lalu latih naskah dengan teleprompter layar penuh."
        ikon={<Type />}
        aksi={
          <Button varian="primary" ikon={<MonitorPlay />} onClick={() => setPrompter(true)} disabled={!teks.trim()}>
            Buka teleprompter
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          judul="Naskah"
          titik="aksen"
          isiClassName="p-0 sm:p-0"
          aksi={
            <>
              <TombolTempel onTempel={setTeks} />
              <TombolBersih onBersih={() => setTeks('')} nonaktif={!teks} />
              <TombolSimpan tool="teks" judulAwal={teks.split('\n')[0] || 'Naskah'} konten={{ teks }} nonaktif={!teks.trim()} />
            </>
          }
        >
          <label htmlFor="naskah" className="sr-only">
            Naskah
          </label>
          <textarea
            id="naskah"
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            placeholder="Tempel naskah pidato, materi presentasi, atau teks apa pun…"
            className="min-h-[420px] w-full resize-y bg-transparent p-5 text-[16px] leading-relaxed outline-none placeholder:text-ink-3 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40"
          />
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel judul="Statistik">
            <div className="grid grid-cols-3 gap-2">
              {stat.map((s) => (
                <div key={s.l} className="rounded-xl bg-surface-2 p-3">
                  <p className="text-[11.5px] font-semibold text-ink-3">{s.l}</p>
                  <p className="font-display text-xl font-semibold">
                    <AngkaHidup nilai={s.v} />
                  </p>
                </div>
              ))}
              <div className="rounded-xl bg-accent p-3 text-accent-ink">
                <p className="text-[11.5px] font-semibold opacity-85">Durasi bicara</p>
                <p className="font-display text-xl font-semibold">{fmt(detikBicara)}</p>
              </div>
            </div>
            <div className="mt-4">
              <Slider label="Tempo bicara" nilai={wpm} min={90} max={180} step={5} onChange={setWpm} satuan=" kata/mnt" />
              <p className="mt-2 text-xs text-ink-3">
                Membaca senyap ± {st.readingTimeFormatted}. Rata-rata kalimat {st.avgWordsPerSentence} kata {Number(st.avgWordsPerSentence) > 25 && '— pertimbangkan memecah kalimat panjang.'}
              </p>
            </div>
          </Panel>

          {kataTeratas.length > 0 && (
            <Panel judul="Kata paling sering">
              <ul className="flex flex-wrap gap-1.5">
                {kataTeratas.map(([w, n]) => (
                  <li key={w} className="rounded-full bg-surface-2 px-3 py-1 text-sm">
                    {w} <span className="font-bold text-accent-text">{angka(n)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel judul="Format penamaan">
            <ul className="flex flex-col gap-1.5">
              {KASUS.map((k) => {
                const v = (kasus as Record<string, string>)[k.k] ?? ''
                return (
                  <li key={k.k} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-surface-2">
                    <span className="w-28 shrink-0 text-xs font-semibold text-ink-3">{k.nama}</span>
                    <code className="min-w-0 flex-1 truncate font-mono text-[13px]">{v || '—'}</code>
                    <CopyButton teks={v} tool="teks" varian="ghost" label="" />
                  </li>
                )
              })}
            </ul>
          </Panel>
        </div>
      </div>

      <AnimatePresence>{prompter && <Teleprompter teks={teks} tutup={() => setPrompter(false)} />}</AnimatePresence>
    </div>
  )
}
