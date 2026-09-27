import { useDeferredValue, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Stylish } from '@/legacy'
import { PageHeader, stagger } from '@/components/ui/Layout'
import { CopyButton } from '@/components/ui/Controls'
import { Input } from '@/components/ui/Field'
import { Chip } from '@/components/ToolKit'

const KATEGORI: Record<string, string> = {
  all: 'Semua',
  bold: 'Tebal',
  script: 'Sambung',
  gothic: 'Gotik',
  blackboard: 'Papan tulis',
  enclosed: 'Berbingkai',
  lines: 'Garis',
  decorations: 'Hiasan',
}

export default function GayaTeks() {
  const [teks, setTeks] = useState('Ruang Keluarga')
  const [kat, setKat] = useState('all')
  const tunda = useDeferredValue(teks)
  const hasil = useMemo(() => Stylish.generateAll(tunda || 'Ruang Keluarga', kat), [tunda, kat])

  return (
    <div>
      <PageHeader
        eyebrow="Teks & Visual"
        judul="Gaya Teks"
        deskripsi="Ubah tulisan menjadi huruf unik Unicode yang bisa ditempel di Instagram, WhatsApp, TikTok, dan bio media sosial."
        ikon={<Sparkles />}
      />
      <div className="sticky top-16 z-10 -mx-4 mb-4 bg-bg/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Input value={teks} onChange={(e) => setTeks(e.target.value)} placeholder="Ketik teks Anda…" aria-label="Teks" maxLength={200} />
        <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
          {Object.entries(KATEGORI).map(([id, n]) => (
            <Chip key={id} aktif={kat === id} onClick={() => setKat(id)}>
              {n}
            </Chip>
          ))}
        </div>
      </div>
      <motion.ul key={kat} variants={stagger.wadah} initial="hidden" animate="show" className="grid gap-3 md:grid-cols-2">
        {hasil.map((h) => (
          <motion.li key={h.title} variants={stagger.anak} layout className="card group flex items-center gap-3 p-4 transition-shadow hover:shadow-[var(--shadow-lift)]">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-semibold text-ink-3">{h.title}</p>
              <p className="truncate text-xl" title={h.text}>
                {h.text}
              </p>
            </div>
            <CopyButton teks={h.text} tool="gaya" />
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
