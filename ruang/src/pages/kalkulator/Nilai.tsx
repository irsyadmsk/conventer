import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { angkaDesimal, cn } from '@/lib/utils'
import { Panel } from '@/components/ui/Layout'
import { Badge, Segmented } from '@/components/ui/Controls'
import { Button, IconButton } from '@/components/ui/Button'
import { TombolSimpan } from '@/components/ToolKit'
import { Angka, Hasil, bacaAngka } from './bagian'

type Komponen = { nama: string; bobot: string; nilai: string }

function predikat(n: number, kktp: number) {
  if (n >= 90) return { h: 'A', ket: 'Sangat baik' }
  if (n >= 80) return { h: 'B', ket: 'Baik' }
  if (n >= kktp) return { h: 'C', ket: 'Cukup' }
  return { h: 'D', ket: 'Perlu bimbingan' }
}

function NilaiAkhir() {
  const [kktp, setKktp] = useState('75')
  const [komp, setKomp] = useState<Komponen[]>([
    { nama: 'Formatif / tugas', bobot: '40', nilai: '85' },
    { nama: 'Sumatif tengah semester', bobot: '30', nilai: '78' },
    { nama: 'Sumatif akhir semester', bobot: '30', nilai: '82' },
  ])
  const totalBobot = komp.reduce((a, k) => a + (bacaAngka(k.bobot) || 0), 0)
  const akhir = totalBobot ? komp.reduce((a, k) => a + (bacaAngka(k.nilai) || 0) * (bacaAngka(k.bobot) || 0), 0) / totalBobot : 0
  const K = bacaAngka(kktp) || 75
  const p = predikat(akhir, K)

  // Berapa nilai minimal di komponen terakhir agar tuntas?
  const terakhir = komp[komp.length - 1]
  const bobotTerakhir = bacaAngka(terakhir?.bobot ?? '0') || 0
  const tanpaTerakhir = komp.slice(0, -1).reduce((a, k) => a + (bacaAngka(k.nilai) || 0) * (bacaAngka(k.bobot) || 0), 0)
  const minimal = bobotTerakhir ? (K * totalBobot - tanpaTerakhir) / bobotTerakhir : NaN

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Panel judul="Komponen penilaian" titik="aksen" aksi={<Badge nada={Math.abs(totalBobot - 100) < 0.01 ? 'sukses' : 'peringatan'}>Bobot {angkaDesimal(totalBobot)}%</Badge>}>
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {komp.map((k, i) => (
              <motion.div key={i} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-[1fr_80px_80px_auto] items-end gap-2">
                <label className="flex flex-col gap-1">
                  {i === 0 && <span className="text-xs font-semibold text-ink-3">Komponen</span>}
                  <input className="field h-11" value={k.nama} onChange={(e) => setKomp((x) => x.map((y, j) => (j === i ? { ...y, nama: e.target.value } : y)))} aria-label={`Nama komponen ${i + 1}`} />
                </label>
                <label className="flex flex-col gap-1">
                  {i === 0 && <span className="text-xs font-semibold text-ink-3">Bobot %</span>}
                  <input className="field h-11 text-center tabular" inputMode="decimal" value={k.bobot} onChange={(e) => setKomp((x) => x.map((y, j) => (j === i ? { ...y, bobot: e.target.value } : y)))} aria-label={`Bobot ${k.nama}`} />
                </label>
                <label className="flex flex-col gap-1">
                  {i === 0 && <span className="text-xs font-semibold text-ink-3">Nilai</span>}
                  <input className="field h-11 text-center font-semibold tabular" inputMode="decimal" value={k.nilai} onChange={(e) => setKomp((x) => x.map((y, j) => (j === i ? { ...y, nilai: e.target.value } : y)))} aria-label={`Nilai ${k.nama}`} />
                </label>
                <IconButton label={`Hapus ${k.nama}`} onClick={() => setKomp((x) => x.filter((_, j) => j !== i))} disabled={komp.length === 1}>
                  <X />
                </IconButton>
              </motion.div>
            ))}
          </AnimatePresence>
          <Button ukuran="sm" varian="ghost" ikon={<Plus />} className="self-start" onClick={() => setKomp((x) => [...x, { nama: `Komponen ${x.length + 1}`, bobot: '10', nilai: '80' }])}>
            Tambah komponen
          </Button>
          <Angka className="mt-2 max-w-40" label="KKTP / batas tuntas" nilai={kktp} onChange={setKktp} />
        </div>
      </Panel>
      <Panel judul="Hasil">
        <div className="flex flex-col gap-3">
          <Hasil label="Nilai akhir" nilai={angkaDesimal(akhir, 2)} sub={`Predikat ${p.h} · ${p.ket}`} aksen salin={angkaDesimal(akhir, 2)} />
          <div className={cn('rounded-2xl p-4 text-sm font-semibold', akhir >= K ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger')}>
            {akhir >= K ? `Tuntas — ${angkaDesimal(akhir - K)} poin di atas KKTP.` : `Belum tuntas — kurang ${angkaDesimal(K - akhir)} poin.`}
          </div>
          {terakhir && Number.isFinite(minimal) && (
            <p className="text-[13px] text-ink-2">
              Agar tuntas, nilai minimal <strong>{terakhir.nama}</strong> adalah{' '}
              <strong className="tabular">{minimal <= 0 ? '0 (sudah aman)' : minimal > 100 ? `${angkaDesimal(minimal)} (tidak mungkin, perlu remedial)` : angkaDesimal(minimal)}</strong>.
            </p>
          )}
          <TombolSimpan tool="kalkulator" kind="calc" judulAwal={`Nilai akhir ${angkaDesimal(akhir)}`} konten={{ jenis: 'nilai', komponen: komp, kktp, akhir }} />
        </div>
      </Panel>
    </div>
  )
}

function Statistik() {
  const [data, setData] = useState('78 85 90 66 72 88 95 81 74 69 92 77')
  const [kktp, setKktp] = useState('75')
  const xs = useMemo(
    () =>
      data
        .split(/[\s;\n]+/)
        .map((s) => bacaAngka(s))
        .filter((n) => Number.isFinite(n)),
    [data],
  )
  const n = xs.length
  const urut = [...xs].sort((a, b) => a - b)
  const rata = n ? xs.reduce((a, b) => a + b, 0) / n : 0
  const median = n ? (n % 2 ? urut[(n - 1) / 2] : (urut[n / 2 - 1] + urut[n / 2]) / 2) : 0
  const sd = n > 1 ? Math.sqrt(xs.reduce((a, x) => a + (x - rata) ** 2, 0) / (n - 1)) : 0
  const K = bacaAngka(kktp) || 75
  const tuntas = xs.filter((x) => x >= K).length
  const modus = (() => {
    const m = new Map<number, number>()
    xs.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1))
    const maks = Math.max(0, ...m.values())
    return maks > 1 ? [...m].filter(([, c]) => c === maks).map(([v]) => v) : []
  })()
  // Histogram rentang 10.
  const ember = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((b) => ({ b, c: xs.filter((x) => x >= b && (b === 90 ? x <= 100 : x < b + 10)).length }))
  const maksE = Math.max(1, ...ember.map((e) => e.c))

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <Panel judul="Data nilai kelas" titik="aksen">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-ink-2">Tempel nilai (pisahkan spasi, baris, atau titik koma)</span>
          <textarea className="field min-h-40 font-mono" value={data} onChange={(e) => setData(e.target.value)} />
        </label>
        <Angka className="mt-3 max-w-40" label="KKTP" nilai={kktp} onChange={setKktp} />
      </Panel>
      <Panel judul={`Ringkasan ${n} siswa`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Hasil label="Rata-rata" nilai={angkaDesimal(rata)} aksen />
          <Hasil label="Median" nilai={angkaDesimal(median)} />
          <Hasil label="Simpangan baku" nilai={angkaDesimal(sd)} />
          <Hasil label="Tertinggi" nilai={n ? angkaDesimal(urut[n - 1]) : '—'} />
          <Hasil label="Terendah" nilai={n ? angkaDesimal(urut[0]) : '—'} />
          <Hasil label="Ketuntasan" nilai={n ? `${angkaDesimal((tuntas / n) * 100, 0)}%` : '—'} sub={`${tuntas} tuntas · ${n - tuntas} remedial`} />
        </div>
        {modus.length > 0 && <p className="mt-3 text-[13px] text-ink-2">Modus: {modus.join(', ')}</p>}
        <div className="mt-4 flex h-28 items-end gap-1.5" role="img" aria-label="Sebaran nilai per rentang sepuluh">
          {ember.map((e) => (
            <div key={e.b} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] font-semibold text-ink-3">{e.c || ''}</span>
              <div className="relative w-full flex-1"><motion.div className={cn('absolute inset-0 origin-bottom rounded-t-md', e.b + 10 > K ? 'bg-accent' : 'bg-line-2')} animate={{ scaleY: Math.max(0.02, e.c / maksE) }} /></div>
              <span className="text-[10px] text-ink-3">{e.b}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

export default function Nilai() {
  const [mode, setMode] = useState<'akhir' | 'kelas'>('akhir')
  return (
    <div>
      <Segmented
        className="mb-4"
        label="Jenis hitungan nilai"
        nilai={mode}
        onChange={setMode}
        pilihan={[
          { id: 'akhir', label: 'Nilai rapor berbobot' },
          { id: 'kelas', label: 'Statistik kelas' },
        ]}
      />
      {mode === 'akhir' ? <NilaiAkhir /> : <Statistik />}
    </div>
  )
}
