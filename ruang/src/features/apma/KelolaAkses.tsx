import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, ShieldCheck, UserPlus, X } from 'lucide-react'
import { supabase, pesanGalat } from '@/lib/supabase'
import { waktuRelatif } from '@/lib/utils'
import { PageHeader, Panel } from '@/components/ui/Layout'
import { Avatar, Badge, EmptyState, Segmented } from '@/components/ui/Controls'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'

type Baris = {
  user_id: string
  status: 'menunggu' | 'disetujui' | 'ditolak' | 'dicabut'
  alasan: string | null
  email: string | null
  nama: string | null
  diminta_at: string
  diputuskan_at: string | null
}

const NADA = { menunggu: 'peringatan', disetujui: 'sukses', ditolak: 'bahaya', dicabut: 'netral' } as const
const LABEL = { menunggu: 'Menunggu', disetujui: 'Disetujui', ditolak: 'Ditolak', dicabut: 'Dicabut' }

/** Panel admin: menyetujui, menolak, mencabut, atau memberi akses Modul Ajar. */
export default function KelolaAkses() {
  const nav = useNavigate()
  const toast = useToast()
  const [baris, setBaris] = useState<Baris[] | null>(null)
  const [saring, setSaring] = useState<'menunggu' | 'semua'>('menunggu')
  const [email, setEmail] = useState('')
  const [sibuk, setSibuk] = useState<string | null>(null)

  const muat = useCallback(async () => {
    const { data, error } = await supabase.from('studio_izin_fitur').select('*').eq('fitur', 'apma').order('diminta_at', { ascending: false })
    if (error) toast('Gagal memuat', { nada: 'galat', isi: pesanGalat(error) })
    setBaris((data as Baris[]) ?? [])
  }, [toast])

  useEffect(() => {
    muat()
  }, [muat])

  async function putuskan(b: Baris, status: 'disetujui' | 'ditolak' | 'dicabut') {
    setSibuk(b.user_id + status)
    const { error } = await supabase.rpc('studio_putuskan_akses', { p_user: b.user_id, p_fitur: 'apma', p_status: status })
    setSibuk(null)
    if (error) return toast('Gagal', { nada: 'galat', isi: pesanGalat(error) })
    toast(`${b.nama ?? b.email}: ${LABEL[status].toLowerCase()}`)
    muat()
  }

  const tampil = (baris ?? []).filter((b) => saring === 'semua' || b.status === 'menunggu')
  const jumlahMenunggu = (baris ?? []).filter((b) => b.status === 'menunggu').length

  return (
    <div>
      <PageHeader
        judul="Akses Modul Ajar"
        deskripsi="Hanya Anda (admin) dan orang yang Anda setujui yang dapat menyusun modul ajar dan memakai AI-nya."
        ikon={<ShieldCheck />}
        aksi={
          <Button varian="ghost" ikon={<ArrowLeft />} onClick={() => nav('/modul-ajar')}>
            Kembali ke modul
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Panel
          judul={`Permintaan${jumlahMenunggu ? ` · ${jumlahMenunggu} menunggu` : ''}`}
          aksi={
            <Segmented
              ukuran="sm"
              label="Saring"
              nilai={saring}
              onChange={setSaring}
              pilihan={[
                { id: 'menunggu', label: 'Menunggu' },
                { id: 'semua', label: 'Semua' },
              ]}
            />
          }
        >
          {baris === null ? (
            <div className="flex flex-col gap-2">
              <div className="skeleton h-20" />
              <div className="skeleton h-20" />
            </div>
          ) : tampil.length === 0 ? (
            <EmptyState ikon={<ShieldCheck />} judul={saring === 'menunggu' ? 'Tidak ada permintaan baru' : 'Belum ada data'} isi="Permintaan dari pengguna muncul di sini, atau beri akses langsung lewat email." />
          ) : (
            <ul className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {tampil.map((b) => {
                  const nama = b.nama ?? b.email ?? 'Pengguna'
                  return (
                    <motion.li key={b.user_id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 24 }} className="rounded-2xl border border-line p-3.5">
                      <div className="flex flex-wrap items-start gap-3">
                        <Avatar nama={nama} ukuran={38} />
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-2 font-bold">
                            {nama} <Badge nada={NADA[b.status]}>{LABEL[b.status]}</Badge>
                          </p>
                          <p className="truncate text-xs text-ink-3">
                            {b.email} · diminta {waktuRelatif(b.diminta_at)}
                          </p>
                          {b.alasan && <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-[13px] text-ink-2">{b.alasan}</p>}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        {b.status !== 'disetujui' && (
                          <Button ukuran="sm" varian="primary" ikon={<Check />} memuat={sibuk === b.user_id + 'disetujui'} onClick={() => putuskan(b, 'disetujui')}>
                            Setujui
                          </Button>
                        )}
                        {b.status === 'menunggu' && (
                          <Button ukuran="sm" varian="danger" ikon={<X />} memuat={sibuk === b.user_id + 'ditolak'} onClick={() => putuskan(b, 'ditolak')}>
                            Tolak
                          </Button>
                        )}
                        {b.status === 'disetujui' && (
                          <Button ukuran="sm" varian="danger" memuat={sibuk === b.user_id + 'dicabut'} onClick={() => putuskan(b, 'dicabut')}>
                            Cabut akses
                          </Button>
                        )}
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
          )}
        </Panel>

        <Panel judul="Beri akses langsung">
          <p className="mb-3 text-sm text-ink-2">Orangnya harus sudah punya akun (Ruang atau irsyads.com).</p>
          <Input label="Email" type="email" inputMode="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="guru@contoh.sch.id" />
          <Button
            className="mt-3"
            varian="primary"
            penuh
            ikon={<UserPlus />}
            memuat={sibuk === 'email'}
            disabled={!email.includes('@')}
            onClick={async () => {
              setSibuk('email')
              const { error } = await supabase.rpc('studio_beri_akses_email', { p_email: email, p_fitur: 'apma' })
              setSibuk(null)
              if (error) return toast('Gagal', { nada: 'galat', isi: pesanGalat(error) })
              toast('Akses diberikan', { isi: email })
              setEmail('')
              muat()
            }}
          >
            Beri akses
          </Button>
        </Panel>
      </div>
    </div>
  )
}
