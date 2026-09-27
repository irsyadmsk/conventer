import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Lock, Send, ShieldX } from 'lucide-react'
import { pesanGalat } from '@/lib/supabase'
import { waktuRelatif } from '@/lib/utils'
import type { StatusAkses } from '@/lib/akses'
import { PageHeader } from '@/components/ui/Layout'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'

/** Layar untuk pengguna yang belum berizin memakai Modul Ajar. */
export default function Terkunci({ akses, ajukan }: { akses: StatusAkses; ajukan: (alasan: string) => Promise<void> }) {
  const [alasan, setAlasan] = useState('')
  const [memuat, setMemuat] = useState(false)
  const toast = useToast()
  const menunggu = akses.status === 'menunggu'
  const ditolak = akses.status === 'ditolak' || akses.status === 'dicabut'

  return (
    <div>
      <PageHeader
        judul="Modul Ajar (APMA)"
        deskripsi="Penyusun modul ajar berbantuan AI ini fitur privat: hanya admin dan pengguna yang telah disetujui admin yang dapat memakainya."
        ikon={<Lock />}
      />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="card mx-auto max-w-xl p-6 sm:p-8"
      >
        {menunggu ? (
          <div className="text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-warning-soft text-warning">
              <Clock className="size-7" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-xl">Permintaan sedang ditinjau</h2>
            <p className="mt-2 text-sm text-ink-2">
              Diajukan {akses.diminta_at ? waktuRelatif(akses.diminta_at) : 'baru saja'}. Halaman ini otomatis terbuka setelah admin menyetujui — muat ulang untuk mengecek.
            </p>
            {akses.alasan && <p className="mt-4 rounded-xl bg-surface-2 p-3 text-left text-sm text-ink-2">“{akses.alasan}”</p>}
          </div>
        ) : (
          <>
            <div className="flex items-start gap-4">
              <span className={ditolak ? 'grid size-12 shrink-0 place-items-center rounded-2xl bg-danger-soft text-danger' : 'grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-text'}>
                {ditolak ? <ShieldX className="size-6" aria-hidden /> : <Lock className="size-6" aria-hidden />}
              </span>
              <div>
                <h2 className="font-display text-xl">{ditolak ? 'Akses belum diberikan' : 'Minta akses Modul Ajar'}</h2>
                <p className="mt-1 text-sm text-ink-2">
                  {ditolak
                    ? 'Permintaan sebelumnya belum disetujui atau aksesnya dicabut. Anda boleh mengajukan lagi dengan keterangan yang lebih jelas.'
                    : 'Ceritakan singkat siapa Anda dan untuk apa modul ajar ini, agar admin mudah memutuskan.'}
                </p>
              </div>
            </div>
            <Textarea
              className="mt-5"
              label="Keterangan"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              maxLength={500}
              placeholder="Mis. Guru Sosiologi di MA …, perlu modul ajar untuk kelas X semester ganjil."
            />
            <Button
              className="mt-4"
              varian="primary"
              penuh
              ikon={<Send />}
              memuat={memuat}
              disabled={alasan.trim().length < 10}
              onClick={async () => {
                setMemuat(true)
                try {
                  await ajukan(alasan)
                  toast('Permintaan terkirim', { isi: 'Admin akan meninjau permintaan Anda.' })
                } catch (e) {
                  toast('Gagal mengirim', { nada: 'galat', isi: pesanGalat(e) })
                } finally {
                  setMemuat(false)
                }
              }}
            >
              Ajukan akses
            </Button>
            <p className="mt-2 text-center text-xs text-ink-3">Minimal 10 karakter.</p>
          </>
        )}
      </motion.div>
    </div>
  )
}
