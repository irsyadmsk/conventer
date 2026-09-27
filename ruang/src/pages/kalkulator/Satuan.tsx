import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpDown } from 'lucide-react'
import { catat } from '@/lib/activity'
import { cn } from '@/lib/utils'
import { Panel } from '@/components/ui/Layout'
import { CopyButton } from '@/components/ui/Controls'
import { Select } from '@/components/ui/Field'
import { formatHasil } from './parser'

type Unit = { id: string; nama: string; ke: (x: number) => number; dari: (x: number) => number; ket?: string }
const lin = (id: string, nama: string, faktor: number, ket?: string): Unit => ({ id, nama, ke: (x) => x * faktor, dari: (x) => x / faktor, ket })

const KATEGORI: Record<string, { nama: string; unit: Unit[] }> = {
  panjang: {
    nama: 'Panjang',
    unit: [
      lin('mm', 'Milimeter', 0.001), lin('cm', 'Sentimeter', 0.01), lin('m', 'Meter', 1), lin('km', 'Kilometer', 1000),
      lin('in', 'Inci', 0.0254), lin('ft', 'Kaki', 0.3048), lin('yd', 'Yard', 0.9144), lin('mi', 'Mil', 1609.344), lin('nmi', 'Mil laut', 1852),
      lin('depa', 'Depa', 1.698, 'Satuan tradisional ± 1,7 m'),
    ],
  },
  luas: {
    nama: 'Luas',
    unit: [
      lin('cm2', 'cm²', 1e-4), lin('m2', 'm²', 1), lin('are', 'Are', 100), lin('ha', 'Hektare', 10000), lin('km2', 'km²', 1e6),
      lin('ft2', 'ft²', 0.09290304), lin('acre', 'Acre', 4046.8564224),
      lin('tumbak', 'Tumbak', 14, 'Jawa Barat: 1 tumbak = 14 m²'), lin('bata', 'Bata', 14, 'Jawa Tengah/Timur: 1 bata ≈ 14 m²'), lin('bau', 'Bau', 7096, '1 bau ≈ 7.096 m² (500 ru)'),
    ],
  },
  massa: {
    nama: 'Massa',
    unit: [
      lin('mg', 'Miligram', 1e-6), lin('g', 'Gram', 0.001), lin('ons', 'Ons', 0.1, '1 ons = 100 g'), lin('kg', 'Kilogram', 1), lin('kuintal', 'Kuintal', 100),
      lin('ton', 'Ton', 1000), lin('lb', 'Pon (lb)', 0.45359237), lin('oz', 'Ounce', 0.028349523125), lin('karat', 'Karat', 0.0002),
    ],
  },
  suhu: {
    nama: 'Suhu',
    unit: [
      { id: 'c', nama: 'Celsius', ke: (x) => x, dari: (x) => x },
      { id: 'f', nama: 'Fahrenheit', ke: (x) => ((x - 32) * 5) / 9, dari: (x) => (x * 9) / 5 + 32 },
      { id: 'k', nama: 'Kelvin', ke: (x) => x - 273.15, dari: (x) => x + 273.15 },
      { id: 'r', nama: 'Reamur', ke: (x) => x * 1.25, dari: (x) => x / 1.25 },
    ],
  },
  volume: {
    nama: 'Volume',
    unit: [
      lin('ml', 'Mililiter', 0.001), lin('l', 'Liter', 1), lin('m3', 'm³', 1000), lin('cc', 'cc', 0.001), lin('sdt', 'Sendok teh', 0.005), lin('sdm', 'Sendok makan', 0.015),
      lin('gelas', 'Gelas', 0.24), lin('galon', 'Galon (AS)', 3.785411784), lin('gl-air', 'Galon air minum', 19, 'Galon isi ulang 19 L'),
    ],
  },
  kecepatan: {
    nama: 'Kecepatan',
    unit: [lin('ms', 'm/detik', 1), lin('kmh', 'km/jam', 1 / 3.6), lin('mph', 'mil/jam', 0.44704), lin('knot', 'Knot', 0.514444), lin('mach', 'Mach', 343)],
  },
  waktu: {
    nama: 'Waktu',
    unit: [lin('ms', 'Milidetik', 0.001), lin('s', 'Detik', 1), lin('min', 'Menit', 60), lin('h', 'Jam', 3600), lin('d', 'Hari', 86400), lin('w', 'Minggu', 604800), lin('mo', 'Bulan (30 h)', 2592000), lin('y', 'Tahun', 31557600)],
  },
  data: {
    nama: 'Data',
    unit: [lin('bit', 'Bit', 0.125), lin('B', 'Byte', 1), lin('KB', 'Kilobyte', 1e3), lin('MB', 'Megabyte', 1e6), lin('GB', 'Gigabyte', 1e9), lin('TB', 'Terabyte', 1e12), lin('KiB', 'Kibibyte', 1024), lin('MiB', 'Mebibyte', 1024 ** 2), lin('GiB', 'Gibibyte', 1024 ** 3)],
  },
  tekanan: {
    nama: 'Tekanan',
    unit: [lin('pa', 'Pascal', 1), lin('kpa', 'Kilopascal', 1000), lin('bar', 'Bar', 1e5), lin('atm', 'Atmosfer', 101325), lin('psi', 'PSI', 6894.757), lin('mmhg', 'mmHg', 133.322)],
  },
  energi: {
    nama: 'Energi',
    unit: [lin('j', 'Joule', 1), lin('kj', 'Kilojoule', 1000), lin('kal', 'Kalori', 4.184), lin('kkal', 'Kilokalori', 4184), lin('wh', 'Watt-jam', 3600), lin('kwh', 'kWh', 3.6e6)],
  },
}

export default function Satuan() {
  const [kat, setKat] = useState('panjang')
  const [dari, setDari] = useState('m')
  const [ke, setKe] = useState('cm')
  const [nilai, setNilai] = useState('1')
  const unit = KATEGORI[kat].unit
  const uDari = unit.find((u) => u.id === dari) ?? unit[0]
  const uKe = unit.find((u) => u.id === ke) ?? unit[1]
  const angka = Number(nilai.replace(',', '.'))

  const hasil = useMemo(() => (Number.isFinite(angka) ? uKe.dari(uDari.ke(angka)) : NaN), [angka, uDari, uKe])

  function gantiKat(k: string) {
    setKat(k)
    setDari(KATEGORI[k].unit[0].id)
    setKe(KATEGORI[k].unit[1].id)
    catat('kalkulator', 'satuan', 0, { kategori: k })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Kategori satuan" className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar lg:flex-col lg:overflow-visible">
        {Object.entries(KATEGORI).map(([id, k]) => (
          <button
            key={id}
            onClick={() => gantiKat(id)}
            aria-current={kat === id}
            className={cn('relative h-10 shrink-0 rounded-xl px-3.5 text-left text-sm font-semibold transition-colors', kat === id ? 'text-accent-ink' : 'text-ink-2 hover:bg-surface-2')}
          >
            {kat === id && <motion.span layoutId="satuan-aktif" className="absolute inset-0 rounded-xl bg-accent" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
            <span className="relative">{k.nama}</span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-4">
        <Panel judul={`Konversi ${KATEGORI[kat].nama.toLowerCase()}`} titik="aksen">
          <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <div className="flex flex-col gap-2">
              <Select label="Dari" value={uDari.id} onChange={(e) => setDari(e.target.value)}>
                {unit.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama}
                  </option>
                ))}
              </Select>
              <input className="field h-14 font-display text-2xl font-semibold tabular" inputMode="decimal" value={nilai} onChange={(e) => setNilai(e.target.value)} aria-label="Nilai asal" />
            </div>
            <motion.button
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setDari(uKe.id)
                setKe(uDari.id)
              }}
              className="mx-auto mb-2 grid size-11 place-items-center rounded-full bg-ink text-bg"
              aria-label="Tukar satuan"
            >
              <ArrowUpDown className="size-4 sm:-rotate-90" />
            </motion.button>
            <div className="flex flex-col gap-2">
              <Select label="Ke" value={uKe.id} onChange={(e) => setKe(e.target.value)}>
                {unit.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama}
                  </option>
                ))}
              </Select>
              <div className="flex h-14 items-center justify-between gap-2 rounded-xl bg-accent-soft px-3">
                <output className="truncate font-display text-2xl font-semibold text-accent-text tabular" aria-live="polite">
                  {Number.isFinite(hasil) ? formatHasil(hasil) : '—'}
                </output>
                <CopyButton teks={Number.isFinite(hasil) ? String(Number(hasil.toPrecision(12))) : ''} tool="kalkulator" varian="ghost" label="" />
              </div>
            </div>
          </div>
          {(uDari.ket || uKe.ket) && <p className="mt-3 text-[13px] text-ink-3">{[uDari.ket, uKe.ket].filter(Boolean).join(' · ')}</p>}
        </Panel>

        <Panel judul="Semua satuan sekaligus">
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {unit.map((u) => {
              const v = Number.isFinite(angka) ? u.dari(uDari.ke(angka)) : NaN
              return (
                <li key={u.id}>
                  <button
                    onClick={() => setKe(u.id)}
                    className={cn('flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors', u.id === uKe.id ? 'border-accent bg-accent-soft/50' : 'border-line hover:border-line-2')}
                  >
                    <span className="text-[13px] text-ink-2">{u.nama}</span>
                    <span className="truncate font-mono text-sm font-semibold">{Number.isFinite(v) ? formatHasil(v) : '—'}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>
    </div>
  )
}
