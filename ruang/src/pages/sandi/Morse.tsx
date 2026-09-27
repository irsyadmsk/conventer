import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Flashlight, Maximize2, Pause, Play, Radio, Square, X, Zap } from 'lucide-react'
import { MORSE_MAP, MorseStudioEngine, type MorseEngine } from '@/legacy'
import { catat } from '@/lib/activity'
import { cn } from '@/lib/utils'
import { PageHeader, Panel } from '@/components/ui/Layout'
import { Button } from '@/components/ui/Button'
import { CopyButton, Slider, Switch } from '@/components/ui/Controls'
import { useToast } from '@/components/ui/Toast'
import { Chip, TombolSimpan } from '@/components/ToolKit'

const SINYAL = [
  { label: 'SOS', teks: 'SOS' },
  { label: 'Tolong', teks: 'TOLONG' },
  { label: 'OK', teks: 'OK' },
  { label: 'CQ', teks: 'CQ CQ' },
  { label: 'Salam', teks: 'SAMPURASUN' },
]

function kodekan(t: string) {
  return t
    .toUpperCase()
    .trim()
    .split('')
    .map((c) => (c === ' ' || c === '\n' ? '/' : MORSE_MAP[c]))
    .filter(Boolean)
    .join(' ')
}

export default function Morse() {
  const eng = useRef<MorseEngine | null>(null)
  const kanvas = useRef<HTMLCanvasElement>(null)
  const [teks, setTeks] = useState('SOS')
  const [status, setStatus] = useState<'playing' | 'paused' | 'stopped'>('stopped')
  const [nyala, setNyala] = useState(false)
  const [token, setToken] = useState(-1)
  const [wpm, setWpm] = useState(18)
  const [frek, setFrek] = useState(700)
  const [vol, setVol] = useState(80)
  const [kedip, setKedip] = useState(true)
  const [senter, setSenter] = useState(false)
  const [strobo, setStrobo] = useState(false)
  const [ketukan, setKetukan] = useState('')
  const [tekan, setTekan] = useState(false)
  const toast = useToast()

  useEffect(() => {
    const e = new MorseStudioEngine()
    eng.current = e
    e.onSignalChange = (on) => setNyala(on)
    e.onStatusChange = (s) => {
      setStatus(s)
      if (s === 'stopped') setToken(-1)
    }
    e.onProgress = (idx) => setToken(idx)
    if (kanvas.current) e.attachOscilloscope(kanvas.current)
    return () => {
      e.stop()
      e.disableTorch()
      cancelAnimationFrame((e as unknown as { scopeAnimId: number }).scopeAnimId)
    }
  }, [])

  useEffect(() => {
    const e = eng.current
    if (!e) return
    e.wpm = wpm
    e.frequency = frek
    e.volume = vol / 100
    e.flashScreenEnabled = kedip
  }, [wpm, frek, vol, kedip])

  const morse = useMemo(() => kodekan(teks), [teks])
  const tel = useMemo(() => {
    const dots = (morse.match(/\./g) || []).length
    const dashes = (morse.match(/-/g) || []).length
    const unitMs = Math.round(1200 / wpm)
    return { dots, dashes, unitMs, durationSec: (((dots + dashes * 3 + dots + dashes) * unitMs) / 1000).toFixed(1) }
  }, [morse, wpm])
  const tokens = morse.split(' ')

  function putar() {
    const e = eng.current!
    if (status === 'paused') return e.resume()
    if (!morse) return toast('Ketik pesan dulu', { nada: 'info' })
    e.play(morse)
    catat('morse', 'putar', teks.length)
  }

  // Kunci telegraf: tahan Spasi (di luar kolom teks) atau tombol.
  useEffect(() => {
    const turun = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space' || ev.repeat) return
      const tag = (ev.target as HTMLElement).tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'BUTTON') return
      ev.preventDefault()
      setTekan(true)
      eng.current?.manualKeyDown()
    }
    const naik = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space') return
      const tag = (ev.target as HTMLElement).tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'BUTTON') return
      setTekan(false)
      eng.current?.manualKeyUp((h) => setKetukan((k) => (k + h).slice(-60)))
    }
    addEventListener('keydown', turun)
    addEventListener('keyup', naik)
    return () => {
      removeEventListener('keydown', turun)
      removeEventListener('keyup', naik)
    }
  }, [])

  async function aturSenter(v: boolean) {
    const e = eng.current!
    if (v) {
      try {
        await e.enableTorch()
        setSenter(true)
        toast('Senter kamera aktif', { isi: 'Lampu akan berkedip mengikuti sinyal.' })
      } catch (err) {
        setSenter(false)
        toast('Senter tidak tersedia', { nada: 'galat', isi: err instanceof Error ? err.message : undefined })
      }
    } else {
      await e.disableTorch()
      setSenter(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Kode & Sandi"
        judul="Morse Studio"
        deskripsi="Terjemahkan pesan ke sandi Morse, dengarkan nadanya, kedipkan layar atau senter kamera, dan latih kunci telegraf manual."
        ikon={<Radio />}
      />

      {/* Osiloskop */}
      <div className="relative mb-4 overflow-hidden rounded-3xl border border-[#2a2d45] bg-[#0c0e18] shadow-[var(--shadow-lift)]">
        <canvas ref={kanvas} width={1200} height={200} className="block h-36 w-full sm:h-44" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_2px,rgb(0_0_0/0.18)_3px)]" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 font-mono text-[11px] tracking-widest text-[#ffb703]/80">
          <span>OSILOSKOP · CW</span>
          <span className="flex items-center gap-2">
            <span className={cn('size-2 rounded-full transition-[background-color,box-shadow]', nyala ? 'bg-[#ffb703] shadow-[0_0_12px_#ffb703]' : 'bg-[#ffb703]/25')} />
            {status === 'playing' ? 'MENGIRIM' : status === 'paused' ? 'JEDA' : 'SIAGA'}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-2 px-4 py-3 font-mono text-[11px] text-[#f5e6c4]/80">
          <span>DIT/DAH {tel?.dots ?? 0}/{tel?.dashes ?? 0}</span>
          <span className="text-center">{tel?.unitMs ?? 0} ms/unit</span>
          <span className="text-right">≈ {tel?.durationSec ?? '0.0'} dtk</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Panel judul="Pemancar" titik="aksen" aksi={<CopyButton teks={morse} tool="morse" label="Salin Morse" />}>
          <label htmlFor="morse-in" className="sr-only">
            Pesan
          </label>
          <textarea id="morse-in" value={teks} onChange={(e) => setTeks(e.target.value)} placeholder="Ketik pesan (huruf, angka, tanda baca)…" className="field min-h-20 text-lg uppercase" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SINYAL.map((s) => (
              <Chip key={s.label} onClick={() => setTeks(s.teks)} aktif={teks === s.teks}>
                {s.label}
              </Chip>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-surface-2 p-4" aria-live="off">
            <p className="eyebrow mb-2">Sandi Morse</p>
            <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xl leading-relaxed tracking-[0.2em]">
              {tokens.map((t, i) => (
                <motion.span
                  key={i}
                  animate={{ scale: token === i ? 1.12 : 1 }}
                  className={cn('rounded px-0.5 transition-colors', token === i ? 'bg-accent text-accent-ink' : token > i ? 'text-ink-3' : 'text-ink')}
                >
                  {t || '·'}
                </motion.span>
              ))}
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Slider label="Kecepatan" nilai={wpm} min={5} max={40} onChange={setWpm} satuan=" WPM" />
            <Slider label="Nada" nilai={frek} min={400} max={1000} step={25} onChange={setFrek} satuan=" Hz" />
            <Slider label="Volume" nilai={vol} min={0} max={100} step={5} onChange={setVol} satuan="%" />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button varian="primary" ikon={status === 'playing' ? <Pause /> : <Play />} onClick={() => (status === 'playing' ? eng.current?.pause() : putar())}>
                {status === 'playing' ? 'Jeda' : status === 'paused' ? 'Lanjut' : 'Putar'}
              </Button>
              <Button varian="outline" ikon={<Square />} onClick={() => eng.current?.stop()} disabled={status === 'stopped'}>
                Stop
              </Button>
            </div>
            <div className="flex gap-2">
              <Button varian="ghost" ukuran="sm" ikon={<Maximize2 />} onClick={() => setStrobo(true)}>
                Strobo layar penuh
              </Button>
              <TombolSimpan tool="morse" judulAwal={`Morse: ${teks}`} konten={{ masukan: teks, hasil: morse }} nonaktif={!morse} />
            </div>
          </div>
          <div className="mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
            <Switch checked={kedip} onChange={setKedip} label="Kedip layar" keterangan="Lampu suar ikut berkedip." />
            <Switch checked={senter} onChange={aturSenter} label="Senter kamera" keterangan="Ponsel dengan lampu kilat." />
          </div>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel judul="Lampu suar">
            <div className="flex items-center justify-center py-4">
              <motion.div
                animate={{
                  scale: nyala && kedip ? 1.06 : 1,
                  boxShadow: nyala && kedip ? '0 0 60px 12px rgb(255 183 3 / 0.55)' : '0 0 0 0 rgb(255 183 3 / 0)',
                }}
                transition={{ duration: 0.05 }}
                className={cn('grid size-28 place-items-center rounded-full border-4 transition-colors duration-75', nyala && kedip ? 'border-[#ffd166] bg-[#ffb703]' : 'border-line-2 bg-surface-2')}
                aria-hidden
              >
                <Zap className={cn('size-10', nyala && kedip ? 'text-[#5a3b00]' : 'text-ink-3')} />
              </motion.div>
            </div>
          </Panel>

          <Panel judul="Kunci telegraf manual" aksi={<span className="text-xs text-ink-3">Tahan Spasi</span>}>
            <motion.button
              onPointerDown={() => {
                setTekan(true)
                eng.current?.manualKeyDown()
              }}
              onPointerUp={() => {
                setTekan(false)
                eng.current?.manualKeyUp((h) => setKetukan((k) => (k + h).slice(-60)))
              }}
              onPointerLeave={() => {
                if (tekan) {
                  setTekan(false)
                  eng.current?.manualKeyUp((h) => setKetukan((k) => (k + h).slice(-60)))
                }
              }}
              animate={{ y: tekan ? 6 : 0, rotateX: tekan ? 12 : 0 }}
              transition={{ type: 'spring', stiffness: 700, damping: 20 }}
              className="relative mx-auto flex h-24 w-full max-w-xs touch-none items-center justify-center rounded-2xl bg-gradient-to-b from-[#c9a35b] to-[#8a6a2c] font-mono text-sm font-bold tracking-widest text-[#2b1d05] shadow-[0_8px_0_#5c4516,0_14px_24px_-8px_rgb(0_0_0/0.5)] select-none"
              style={{ transformPerspective: 600 }}
              aria-label="Kunci telegraf: tekan singkat untuk titik, tahan untuk garis"
            >
              KETUK
            </motion.button>
            <div className="mt-6 flex items-center justify-between gap-2 rounded-xl bg-surface-2 px-4 py-3">
              <span className="min-h-7 font-mono text-xl font-bold tracking-widest break-all">{ketukan || <span className="text-sm font-normal tracking-normal text-ink-3">Hasil ketukan…</span>}</span>
              {ketukan && (
                <Button ukuran="sm" varian="ghost" onClick={() => setKetukan('')}>
                  Hapus
                </Button>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <Panel judul="Tabel sandi Morse internasional" className="mt-4" aksi={<span className="text-xs text-ink-3">Ketuk untuk mendengar</span>}>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-9">
          {Object.entries(MORSE_MAP)
            .filter(([k]) => k !== ' ')
            .map(([k, v]) => (
              <motion.button
                key={k}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => eng.current?.playSingleChar(k)}
                className="flex flex-col items-center rounded-xl border border-line bg-surface px-2 py-2.5 transition-colors hover:border-accent hover:bg-accent-soft"
              >
                <span className="text-lg font-bold">{k}</span>
                <span className="font-mono text-sm tracking-widest text-accent-text">{v}</span>
              </motion.button>
            ))}
        </div>
      </Panel>

      {createPortal(
        <AnimatePresence>
          {strobo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn('fixed inset-0 z-[90] flex flex-col items-center justify-center transition-colors duration-75', nyala ? 'bg-white' : 'bg-black')}
              role="dialog"
              aria-label="Strobo layar penuh"
            >
              <p className={cn('font-mono text-sm tracking-widest', nyala ? 'text-black' : 'text-white/60')}>{teks.toUpperCase()}</p>
              <div className="mt-6 flex gap-3">
                <Button varian="secondary" ikon={<Play />} onClick={putar}>
                  Putar
                </Button>
                <Button
                  varian="outline"
                  ikon={<X />}
                  onClick={() => {
                    eng.current?.stop()
                    setStrobo(false)
                  }}
                >
                  Tutup
                </Button>
              </div>
              <p className="absolute bottom-6 flex items-center gap-2 text-xs text-white/40">
                <Flashlight className="size-4" /> Arahkan layar ke penerima. Peringatan: cahaya berkedip.
              </p>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
