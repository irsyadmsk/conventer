import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpenText, Brain, Check, RotateCcw, Search, Shuffle, Volume2, X } from 'lucide-react'
import { Kamus as KamusData, type EntriKamus } from '@/legacy'
import { catat } from '@/lib/activity'
import { cn } from '@/lib/utils'
import { bunyi } from '@/lib/sound'
import { PageHeader, stagger } from '@/components/ui/Layout'
import { Button, IconButton } from '@/components/ui/Button'
import { Badge, CopyButton, EmptyState, Segmented } from '@/components/ui/Controls'
import { Input } from '@/components/ui/Field'
import { Chip } from '@/components/ToolKit'

const KATEGORI: Record<string, string> = {
  all: 'Semua',
  salam: 'Salam',
  sifat: 'Sifat',
  kegiatan: 'Kegiatan',
  benda: 'Benda',
  angka: 'Angka',
  warna: 'Warna',
  ganti: 'Kata ganti',
  falsafah: 'Falsafah',
}

function ucap(t: string) {
  if (!('speechSynthesis' in window)) return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(t)
  u.lang = 'id-ID'
  u.rate = 0.85
  speechSynthesis.speak(u)
}

function acak<T>(xs: T[]) {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function Kuis({ data }: { data: EntriKamus[] }) {
  const [urut, setUrut] = useState(() => acak(data))
  const [i, setI] = useState(0)
  const [pilih, setPilih] = useState<string | null>(null)
  const [skor, setSkor] = useState(0)
  const soal = urut[i]
  const opsi = useMemo(() => (soal ? acak([soal.arti, ...acak(data.filter((d) => d.arti !== soal.arti)).slice(0, 3).map((d) => d.arti)]) : []), [soal, data])

  if (!soal)
    return (
      <div className="card p-8 text-center">
        <p className="eyebrow">Selesai</p>
        <p className="mt-2 font-display text-4xl font-semibold">
          {skor}/{urut.length}
        </p>
        <p className="mt-2 text-ink-2">{skor / urut.length >= 0.8 ? 'Hadé pisan! Luar biasa.' : 'Terus berlatih — sakeudik-sakeudik lila-lila jadi bukit.'}</p>
        <Button
          className="mt-5"
          varian="primary"
          ikon={<RotateCcw />}
          onClick={() => {
            setUrut(acak(data))
            setI(0)
            setSkor(0)
            setPilih(null)
          }}
        >
          Ulangi kuis
        </Button>
      </div>
    )

  return (
    <div className="card p-5 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <Badge nada="aksen">
          Soal {i + 1} dari {urut.length}
        </Badge>
        <span className="text-sm font-semibold text-ink-2 tabular">Skor {skor}</span>
      </div>
      <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <motion.div className="h-full w-full origin-left bg-accent" animate={{ scaleX: i / urut.length }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}>
          <div className="py-8 text-center">
            <p className="sunda text-5xl leading-tight">{soal.aksara}</p>
            <p className="mt-3 text-lg font-semibold">{soal.sunda}</p>
            <p className="mt-1 text-sm text-ink-3">Apa artinya?</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {opsi.map((o) => {
              const benar = o === soal.arti
              const dipilih = pilih === o
              return (
                <motion.button
                  key={o}
                  whileTap={{ scale: 0.97 }}
                  animate={pilih && dipilih && !benar ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                  disabled={pilih !== null}
                  onClick={() => {
                    setPilih(o)
                    if (benar) setSkor((s) => s + 1)
                    bunyi(benar ? 'sukses' : 'galat')
                    catat('kamus', 'kuis')
                  }}
                  className={cn(
                    'flex min-h-12 items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors',
                    pilih === null && 'border-line bg-surface hover:border-accent hover:bg-accent-soft',
                    pilih !== null && benar && 'border-success bg-success-soft text-success',
                    pilih !== null && dipilih && !benar && 'border-danger bg-danger-soft text-danger',
                    pilih !== null && !benar && !dipilih && 'border-line opacity-50',
                  )}
                >
                  {o}
                  {pilih !== null && benar && <Check className="size-4 shrink-0" />}
                  {pilih !== null && dipilih && !benar && <X className="size-4 shrink-0" />}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 flex justify-end">
        <Button
          varian="primary"
          disabled={pilih === null}
          onClick={() => {
            setPilih(null)
            setI((x) => x + 1)
          }}
        >
          Lanjut
        </Button>
      </div>
    </div>
  )
}

export default function Kamus() {
  const [q, setQ] = useState('')
  const [kat, setKat] = useState('all')
  const [mode, setMode] = useState<'cari' | 'kuis'>('cari')
  const semua = useMemo(() => KamusData.getAll(), [])
  const hasil = useMemo(() => KamusData.search(q, kat), [q, kat])

  return (
    <div>
      <PageHeader
        eyebrow="Aksara Sunda"
        judul="Kamus Sunda"
        deskripsi={`${semua.length} kosakata pilihan dengan arti Indonesia dan tulisan aksara baku. Cocok untuk belajar bersama keluarga.`}
        ikon={<BookOpenText />}
        aksi={
          <Segmented
            label="Mode"
            nilai={mode}
            onChange={setMode}
            pilihan={[
              { id: 'cari', label: 'Jelajahi', ikon: <Search /> },
              { id: 'kuis', label: 'Kuis kilat', ikon: <Brain /> },
            ]}
          />
        }
      />

      {mode === 'kuis' ? (
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex flex-wrap gap-1.5">
            {Object.entries(KATEGORI).map(([id, n]) => (
              <Chip key={id} aktif={kat === id} onClick={() => setKat(id)}>
                {n}
              </Chip>
            ))}
          </div>
          <Kuis key={kat} data={KamusData.search('', kat).length >= 4 ? KamusData.search('', kat) : semua} />
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              className="flex-1"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              ikon={<Search />}
              placeholder="Cari kata Sunda, arti Indonesia, atau aksara…"
              aria-label="Cari kosakata"
            />
            <Badge nada="aksen" className="self-start sm:self-auto">
              {hasil.length} hasil
            </Badge>
          </div>
          <div className="mb-5 flex flex-wrap gap-1.5">
            {Object.entries(KATEGORI).map(([id, n]) => (
              <Chip key={id} aktif={kat === id} onClick={() => setKat(id)}>
                {n}
              </Chip>
            ))}
          </div>
          {hasil.length === 0 ? (
            <EmptyState ikon={<Shuffle />} judul="Tidak ditemukan" isi="Coba kata lain atau pilih kategori Semua." />
          ) : (
            <motion.ul key={kat + q.length} variants={stagger.wadah} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {hasil.map((e) => (
                <motion.li key={e.sunda} variants={stagger.anak} whileHover={{ y: -3 }} className="card group flex flex-col gap-3 p-4 transition-shadow hover:shadow-[var(--shadow-lift)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold">{e.sunda}</p>
                      <p className="text-sm text-ink-2">{e.arti}</p>
                    </div>
                    <Badge>{KATEGORI[e.kategori] ?? e.kategori}</Badge>
                  </div>
                  <p className="sunda text-[26px] leading-snug text-accent-text">{e.aksara}</p>
                  <div className="mt-auto flex items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100">
                    <IconButton label={`Lafalkan ${e.sunda}`} ukuran="sm" onClick={() => ucap(e.sunda)}>
                      <Volume2 />
                    </IconButton>
                    <CopyButton teks={e.aksara} tool="kamus" label="Salin aksara" varian="ghost" />
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </>
      )}
    </div>
  )
}
