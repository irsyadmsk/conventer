import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function TidakAda() {
  const nav = useNavigate()
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <motion.p
          initial={{ rotate: -8, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="sunda text-7xl text-accent-text"
          aria-hidden
        >
          |᮴᮰᮴|
        </motion.p>
        <p className="mt-1 font-mono text-sm text-ink-3">404 dalam angka Sunda</p>
        <h1 className="mt-4 font-display text-3xl font-semibold">Ruangan ini tidak ada</h1>
        <p className="mt-2 text-ink-2">Halaman yang Anda cari sudah pindah atau salah alamat.</p>
        <Button varian="primary" className="mt-6" ikon={<Home />} onClick={() => nav('/')}>
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  )
}
