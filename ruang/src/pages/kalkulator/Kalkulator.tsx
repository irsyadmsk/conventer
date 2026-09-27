import { lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Binary, Calculator, CalendarDays, GraduationCap, Percent, Ruler, Sigma, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/ui/Layout'
import { Segmented } from '@/components/ui/Controls'

const MODE = {
  umum: { label: 'Ilmiah', ikon: <Sigma />, C: lazy(() => import('./Umum')) },
  programmer: { label: 'Programmer', ikon: <Binary />, C: lazy(() => import('./Programmer')) },
  satuan: { label: 'Satuan', ikon: <Ruler />, C: lazy(() => import('./Satuan')) },
  persen: { label: 'Persen', ikon: <Percent />, C: lazy(() => import('./Persen')) },
  tanggal: { label: 'Tanggal', ikon: <CalendarDays />, C: lazy(() => import('./Tanggal')) },
  nilai: { label: 'Nilai', ikon: <GraduationCap />, C: lazy(() => import('./Nilai')) },
  keuangan: { label: 'Keuangan', ikon: <Wallet />, C: lazy(() => import('./Keuangan')) },
} as const

type Mode = keyof typeof MODE

export default function Kalkulator() {
  const [sp, setSp] = useSearchParams()
  const mode = (sp.get('mode') as Mode) in MODE ? (sp.get('mode') as Mode) : 'umum'
  const Isi = MODE[mode].C

  return (
    <div>
      <PageHeader
        eyebrow="Hitung"
        judul="Kalkulator"
        deskripsi="Satu kalkulator untuk semua kebutuhan: ilmiah, programmer, konversi satuan, diskon, tanggal & weton, nilai rapor, hingga cicilan dan zakat."
        ikon={<Calculator />}
      />
      <Segmented
        className="mb-5"
        label="Mode kalkulator"
        nilai={mode}
        onChange={(m) => setSp(m === 'umum' ? {} : { mode: m }, { replace: true })}
        pilihan={Object.entries(MODE).map(([id, m]) => ({ id: id as Mode, label: m.label, ikon: m.ikon }))}
      />
      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          <Suspense fallback={<div className="skeleton h-96" />}>
            <Isi />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
