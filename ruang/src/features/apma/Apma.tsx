import { lazy, Suspense } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FilePlus2, GraduationCap, ShieldCheck, Users } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useItems } from '@/lib/items'
import { useAkses } from '@/lib/akses'
import { waktuRelatif } from '@/lib/utils'
import { PageHeader, stagger } from '@/components/ui/Layout'
import { Badge, EmptyState } from '@/components/ui/Controls'
import { Button } from '@/components/ui/Button'
import type { KontenModul } from './konstanta'

const Wizard = lazy(() => import('./Wizard'))
const Editor = lazy(() => import('./Editor'))
const Terkunci = lazy(() => import('./Terkunci'))
const KelolaAkses = lazy(() => import('./KelolaAkses'))

function Daftar({ admin }: { admin: boolean }) {
  const nav = useNavigate()
  const { user } = useAuth()
  const { items, memuat } = useItems<KontenModul>({ kind: 'apma' })

  return (
    <div>
      <PageHeader
        eyebrow="Pendidikan"
        judul="Modul Ajar (APMA)"
        deskripsi="Susun modul ajar Kurikulum Merdeka, Kurikulum Berbasis Cinta, atau kurikulum sekolah dalam hitungan menit — lengkap dengan LKPD, rubrik, asesmen, dan audit nomenklatur terbaru."
        ikon={<GraduationCap />}
        aksi={
          <>
            {admin && (
              <Button varian="ghost" ikon={<ShieldCheck />} onClick={() => nav('/modul-ajar/akses')}>
                Kelola akses
              </Button>
            )}
            <Button varian="primary" ikon={<FilePlus2 />} onClick={() => nav('/modul-ajar/baru')}>
              Modul baru
            </Button>
          </>
        }
      />
      {memuat ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          ikon={<GraduationCap />}
          judul="Belum ada modul ajar"
          isi="Isi identitas dan rencana pembelajaran, lalu AI menyusun modul lengkap yang bisa Anda sunting, audit, dan cetak."
          aksi={
            <Button varian="primary" ikon={<FilePlus2 />} onClick={() => nav('/modul-ajar/baru')}>
              Buat modul pertama
            </Button>
          }
        />
      ) : (
        <motion.ul variants={stagger.wadah} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((m) => {
            const f = m.content.form
            const skor = m.content.audit?.score
            return (
              <motion.li key={m.id} variants={stagger.anak} whileHover={{ y: -3 }}>
                <button onClick={() => nav(`/modul-ajar/${m.id}`)} className="card flex h-full w-full flex-col p-5 text-left transition-shadow hover:shadow-[var(--shadow-lift)]">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <Badge nada="aksen">{f?.mapel || 'Modul'}</Badge>
                    {skor != null && <Badge nada={skor >= 85 ? 'sukses' : skor >= 70 ? 'peringatan' : 'bahaya'}>Skor {skor}</Badge>}
                  </div>
                  <p className="font-display text-lg leading-snug font-semibold">{m.title}</p>
                  <p className="mt-1 text-sm text-ink-3">
                    {f?.jenjang} · Fase {f?.fase} · Kelas {f?.kelas} · {m.content.blocks?.length ?? 0} blok
                  </p>
                  <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-ink-3">
                    {m.family_id && <Users className="size-3.5 text-info" aria-label="Dibagikan" />}
                    {m.owner_id === user?.id ? 'Milik Anda' : 'Dari keluarga'} · diperbarui {waktuRelatif(m.updated_at)}
                  </p>
                </button>
              </motion.li>
            )
          })}
        </motion.ul>
      )}
    </div>
  )
}

export default function Apma() {
  const { akses, ajukan } = useAkses('apma')

  if (!akses) return <div className="skeleton h-96" />
  // Fitur privat: hanya admin & pengguna yang disetujui admin.
  if (!akses.boleh)
    return (
      <Suspense fallback={<div className="skeleton h-96" />}>
        <Terkunci akses={akses} ajukan={ajukan} />
      </Suspense>
    )

  return (
    <Suspense fallback={<div className="skeleton h-96" />}>
      <Routes>
        <Route index element={<Daftar admin={akses.admin} />} />
        <Route path="baru" element={<Wizard />} />
        {akses.admin && <Route path="akses" element={<KelolaAkses />} />}
        <Route path=":id" element={<Editor />} />
      </Routes>
    </Suspense>
  )
}
