import { useState } from 'react'
import { motion } from 'framer-motion'
import { Grid3x3 } from 'lucide-react'
import { Sunda } from '@/legacy'
import { PageHeader, stagger } from '@/components/ui/Layout'
import { Dialog } from '@/components/ui/Dialog'
import { CopyButton } from '@/components/ui/Controls'
import { bunyi } from '@/lib/sound'
import { ANGKA, NGALAGENA, RARANGKEN, SERAPAN, SWARA, type Kunci } from './data'

const BAGIAN: { judul: string; ket: string; data: Kunci[]; rarangken?: boolean }[] = [
  { judul: 'Aksara Swara', ket: '7 vokal mandiri, ditulis sendiri di awal kata.', data: SWARA },
  { judul: 'Aksara Ngalagena', ket: '18 konsonan baku, masing-masing berbunyi vokal /a/.', data: NGALAGENA },
  { judul: 'Ngalagena Serapan', ket: 'Konsonan untuk bunyi serapan dari bahasa asing.', data: SERAPAN },
  { judul: 'Rarangkén', ket: '13 penanda yang mengubah bunyi vokal atau menambah konsonan.', data: RARANGKEN, rarangken: true },
  { judul: 'Angka', ket: 'Angka Sunda ditulis diapit tanda | agar tidak tertukar dengan huruf.', data: ANGKA },
]

const CONTOH: Record<string, string> = {
  Panghulu: 'kita',
  Panyuku: 'buku',
  Panéléng: 'sére',
  Panolong: 'toko',
  Pamepet: 'beber',
  Paneuleung: 'beureum',
  Pamingkal: 'kyai',
  Panyakra: 'krupuk',
  Panyiku: 'plastik',
  Panyecek: 'bangbang',
  Panglayar: 'kurma',
  Pangwisad: 'bahbir',
  Pamaéh: 'ngan',
}

export default function Pedoman() {
  const [pilih, setPilih] = useState<Kunci | null>(null)

  return (
    <div>
      <PageHeader
        eyebrow="Aksara Sunda"
        judul="Pedoman Aksara"
        deskripsi="Anatomi Aksara Sunda baku. Ketuk kartu untuk melihat contoh pemakaiannya."
        ikon={<Grid3x3 />}
      />
      <div className="flex flex-col gap-8">
        {BAGIAN.map((b) => (
          <section key={b.judul}>
            <div className="mb-3">
              <h2 className="font-display text-xl font-semibold">{b.judul}</h2>
              <p className="text-sm text-ink-3">{b.ket}</p>
            </div>
            <motion.ul variants={stagger.wadah} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9">
              {b.data.map((k) => (
                <motion.li key={k.ch} variants={stagger.anak}>
                  <motion.button
                    whileHover={{ y: -4, rotate: -1.5 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      bunyi('tap')
                      setPilih(k)
                    }}
                    className="card flex aspect-[4/5] w-full flex-col items-center justify-center gap-1 p-2 transition-colors hover:border-accent"
                  >
                    <span className="sunda text-[34px] leading-none">{b.rarangken ? `◌${k.ch}` : k.ch}</span>
                    <span className="mt-1 font-mono text-xs font-semibold text-accent-text">{k.latin}</span>
                    {k.ket && <span className="truncate text-[11px] text-ink-3">{k.ket}</span>}
                  </motion.button>
                </motion.li>
              ))}
            </motion.ul>
          </section>
        ))}
      </div>

      <Dialog buka={!!pilih} tutup={() => setPilih(null)} judul={pilih?.ket ?? `Aksara ${pilih?.latin ?? ''}`} lebar="sm">
        {pilih && (
          <div className="flex flex-col items-center gap-4 pb-2 text-center">
            <motion.span initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="sunda text-7xl">
              {pilih.ch}
            </motion.span>
            <p className="font-mono text-lg font-semibold">{pilih.latin}</p>
            {pilih.ket && CONTOH[pilih.ket] && (
              <div className="w-full rounded-2xl bg-surface-2 p-4">
                <p className="eyebrow mb-2">Contoh</p>
                <p className="sunda text-3xl">{Sunda.latinToSunda(CONTOH[pilih.ket])}</p>
                <p className="mt-1 text-sm text-ink-2">{CONTOH[pilih.ket]}</p>
              </div>
            )}
            <CopyButton teks={pilih.ch} tool="pedoman" label="Salin aksara" />
          </div>
        )}
      </Dialog>
    </div>
  )
}
