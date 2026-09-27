import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import QRCode from 'qrcode'
import { Crown, DoorOpen, Home, KeyRound, LogOut, RefreshCw, Share2, Shield, UserMinus, UserPlus, Users } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { LABEL_PERAN, useFamily, type Anggota, type Peran } from '@/lib/family'
import { pesanGalat } from '@/lib/supabase'
import { waktuRelatif } from '@/lib/utils'
import { PageHeader, Panel, stagger } from '@/components/ui/Layout'
import { Avatar, Badge, CopyButton } from '@/components/ui/Controls'
import { Button, IconButton } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Select } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'

const PENJELASAN: Record<Peran, string> = {
  owner: 'Mengelola semuanya, termasuk mengangkat admin.',
  admin: 'Mengundang, mengatur peran, mengeluarkan anggota, menghapus item bersama.',
  anggota: 'Melihat & menyunting item bersama, membagikan miliknya.',
  anak: 'Melihat item bersama; hanya menyunting miliknya sendiri.',
}

function BelumBerkeluarga() {
  const { buat, gabung } = useFamily()
  const { namaTampil } = useAuth()
  const [sp] = useSearchParams()
  const toast = useToast()
  const [nama, setNama] = useState(`Keluarga ${namaTampil.split(' ').slice(-1)[0]}`)
  const [kode, setKode] = useState(sp.get('kode')?.toUpperCase() ?? '')
  const [namaSaya, setNamaSaya] = useState(namaTampil)
  const [memuat, setMemuat] = useState<'buat' | 'gabung' | null>(null)

  async function jalan(jenis: 'buat' | 'gabung') {
    setMemuat(jenis)
    try {
      if (jenis === 'buat') {
        if (nama.trim().length < 2) throw new Error('Nama keluarga minimal 2 huruf.')
        await buat(nama, namaSaya)
        toast('Keluarga dibuat', { isi: 'Bagikan kode undangan ke anggota keluarga.' })
      } else {
        if (kode.trim().length < 6) throw new Error('Kode undangan terdiri dari 6 karakter.')
        await gabung(kode, namaSaya)
        toast('Berhasil bergabung')
      }
    } catch (e) {
      toast('Gagal', { nada: 'galat', isi: pesanGalat(e) })
    } finally {
      setMemuat(null)
    }
  }

  return (
    <div>
      <div className="mx-auto mb-6 max-w-sm">
        <Input label="Nama Anda di keluarga" value={namaSaya} onChange={(e) => setNamaSaya(e.target.value)} bantuan="Mis. Ayah, Bunda, Kakak Rara." />
      </div>
      <motion.div variants={stagger.wadah} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
        <motion.div variants={stagger.anak} className="card flex flex-col p-6">
          <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent-text">
            <Home className="size-6" aria-hidden />
          </span>
          <h2 className="font-display text-xl font-semibold">Buat keluarga baru</h2>
          <p className="mt-1 mb-5 text-sm text-ink-2">Anda menjadi pemilik dan mendapat kode undangan untuk anggota lain (maks. 12).</p>
          <Input label="Nama keluarga" value={nama} onChange={(e) => setNama(e.target.value)} maxLength={60} />
          <div className="mt-auto pt-4">
            <Button varian="primary" penuh memuat={memuat === 'buat'} ikon={<Home />} onClick={() => jalan('buat')}>
              Buat keluarga
            </Button>
          </div>
        </motion.div>
        <motion.div variants={stagger.anak} className="card flex flex-col p-6">
          <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-info-soft text-info">
            <KeyRound className="size-6" aria-hidden />
          </span>
          <h2 className="font-display text-xl font-semibold">Gabung dengan kode</h2>
          <p className="mt-1 mb-5 text-sm text-ink-2">Minta kode 6 karakter dari pemilik atau admin keluarga.</p>
          <Input
            label="Kode undangan"
            value={kode}
            onChange={(e) => setKode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            placeholder="MISAL7"
            inputClassName="font-mono tracking-[0.3em] uppercase"
            autoComplete="off"
          />
          <div className="mt-auto pt-4">
            <Button varian="secondary" penuh memuat={memuat === 'gabung'} ikon={<UserPlus />} onClick={() => jalan('gabung')}>
              Gabung
            </Button>
          </div>
        </motion.div>
      </motion.div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(PENJELASAN) as Peran[]).map((p) => (
          <div key={p} className="rounded-2xl bg-surface-2 p-4">
            <p className="text-sm font-bold">{LABEL_PERAN[p]}</p>
            <p className="mt-1 text-[13px] text-ink-3">{PENJELASAN[p]}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Keluarga() {
  const { user } = useAuth()
  const f = useFamily()
  const toast = useToast()
  const [qr, setQr] = useState('')
  const [ubahNama, setUbahNama] = useState<string | null>(null)
  const [keluarKonfirm, setKeluarKonfirm] = useState(false)
  const [keluarkan, setKeluarkan] = useState<Anggota | null>(null)

  const tautan = f.keluarga ? `${location.origin}/keluarga?kode=${f.keluarga.invite_code}` : ''
  useEffect(() => {
    if (tautan) QRCode.toDataURL(tautan, { margin: 1, width: 360, color: { dark: '#14183e', light: '#ffffff' } }).then(setQr)
  }, [tautan])

  async function jalan(fn: () => Promise<unknown>, ok: string) {
    try {
      await fn()
      toast(ok)
    } catch (e) {
      toast('Gagal', { nada: 'galat', isi: pesanGalat(e) })
    }
  }

  if (f.memuat)
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton h-24" />
        <div className="skeleton h-64" />
      </div>
    )

  return (
    <div>
      <PageHeader
        eyebrow="Akun"
        judul="Keluarga"
        deskripsi="Satu keluarga, banyak akun. Setiap anggota punya ruang pribadi, dan bisa membagikan koleksi, resep, modul ajar, serta laporan ke seluruh keluarga secara real-time."
        ikon={<Users />}
      />
      {!f.keluarga ? (
        <BelumBerkeluarga />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Panel
            judul={
              <span className="flex items-center gap-2">
                <span className="font-display text-lg text-ink">{f.keluarga.name}</span>
                <Badge nada="sukses">{f.anggota.length} anggota</Badge>
              </span>
            }
            aksi={
              f.bisaKelola && (
                <Button ukuran="sm" varian="ghost" onClick={() => setUbahNama(f.keluarga!.name)}>
                  Ubah nama
                </Button>
              )
            }
          >
            <motion.ul variants={stagger.wadah} initial="hidden" animate="show" className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {f.anggota.map((a) => {
                  const saya = a.user_id === user?.id
                  const bisaUbah = f.bisaKelola && a.role !== 'owner' && !saya && !(f.peranSaya === 'admin' && a.role === 'admin')
                  return (
                    <motion.li key={a.user_id} layout variants={stagger.anak} exit={{ opacity: 0, x: 30 }} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line p-3">
                      <Avatar nama={a.display_name} ukuran={42} />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 truncate font-bold">
                          {a.display_name}
                          {saya && <span className="text-xs font-semibold text-ink-3">(Anda)</span>}
                          {a.role === 'owner' && <Crown className="size-4 text-warning" aria-label="Pemilik" />}
                        </p>
                        <p className="text-xs text-ink-3">Bergabung {waktuRelatif(a.joined_at)}</p>
                      </div>
                      {bisaUbah ? (
                        <div className="flex items-center gap-1">
                          <Select
                            aria-label={`Peran ${a.display_name}`}
                            value={a.role}
                            onChange={(e) => jalan(() => f.ubahPeran(a.user_id, e.target.value as Exclude<Peran, 'owner'>), 'Peran diperbarui')}
                            className="w-32"
                          >
                            {f.peranSaya === 'owner' && <option value="admin">Admin</option>}
                            <option value="anggota">Anggota</option>
                            <option value="anak">Anak</option>
                          </Select>
                          <IconButton label={`Keluarkan ${a.display_name}`} onClick={() => setKeluarkan(a)} className="hover:!text-danger">
                            <UserMinus />
                          </IconButton>
                        </div>
                      ) : (
                        <Badge nada={a.role === 'owner' ? 'peringatan' : a.role === 'admin' ? 'info' : 'netral'}>
                          {a.role === 'admin' && <Shield className="size-3" />}
                          {LABEL_PERAN[a.role]}
                        </Badge>
                      )}
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </motion.ul>
            <div className="mt-5 flex justify-end border-t border-line pt-4">
              <Button varian="danger" ukuran="sm" ikon={<LogOut />} onClick={() => setKeluarKonfirm(true)}>
                Keluar dari keluarga
              </Button>
            </div>
          </Panel>

          <div className="flex flex-col gap-4">
            {f.bisaKelola ? (
              <Panel judul="Undang anggota" titik="aksen">
                <p className="text-sm text-ink-2">Bagikan kode, tautan, atau minta anggota memindai QR ini.</p>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-ink p-4 text-bg">
                  <motion.span key={f.keluarga.invite_code} initial={{ opacity: 0, letterSpacing: '0.6em' }} animate={{ opacity: 1, letterSpacing: '0.3em' }} className="font-mono text-3xl font-bold">
                    {f.keluarga.invite_code}
                  </motion.span>
                  <IconButton label="Buat kode baru" varian="ghost" className="text-bg hover:!bg-white/10 hover:!text-bg" onClick={() => jalan(() => f.kodeBaru(), 'Kode baru dibuat — kode lama tidak berlaku')}>
                    <RefreshCw />
                  </IconButton>
                </div>
                {qr && <img src={qr} alt={`QR undangan keluarga ${f.keluarga.name}`} width={176} height={176} className="mx-auto mt-4 size-44 rounded-xl border border-line" />}
                <div className="mt-4 flex flex-wrap gap-2">
                  <CopyButton teks={tautan} tool="keluarga" label="Salin tautan" />
                  <Button
                    ukuran="sm"
                    varian="ghost"
                    ikon={<Share2 />}
                    onClick={async () => {
                      const teks = `Ayo gabung ke keluarga "${f.keluarga!.name}" di Ruang. Kode: ${f.keluarga!.invite_code}`
                      if (navigator.share) await navigator.share({ title: 'Undangan Ruang', text: teks, url: tautan }).catch(() => {})
                      else window.open(`https://wa.me/?text=${encodeURIComponent(`${teks}\n${tautan}`)}`, '_blank', 'noopener')
                    }}
                  >
                    Bagikan
                  </Button>
                </div>
              </Panel>
            ) : (
              <Panel judul="Undang anggota">
                <p className="text-sm text-ink-2">Minta pemilik atau admin untuk mengundang anggota baru.</p>
              </Panel>
            )}
            <Panel judul="Yang tersinkron">
              <ul className="flex flex-col gap-2 text-sm text-ink-2">
                <li>• Koleksi & resep yang Anda tandai “Bagikan”</li>
                <li>• Modul ajar APMA yang dibagikan</li>
                <li>• Laporan keluarga (jumlah aktivitas, bukan isi teks)</li>
                <li>• Perubahan tampil seketika di semua perangkat</li>
              </ul>
              <p className="mt-3 text-xs text-ink-3">Item yang tidak dibagikan tetap pribadi — anggota lain tidak dapat melihatnya.</p>
            </Panel>
          </div>
        </div>
      )}

      <Dialog
        buka={ubahNama !== null}
        tutup={() => setUbahNama(null)}
        judul="Nama keluarga"
        lebar="sm"
        kaki={
          <Button
            varian="primary"
            onClick={async () => {
              await jalan(() => f.ubahNama(ubahNama ?? ''), 'Nama diperbarui')
              setUbahNama(null)
            }}
          >
            Simpan
          </Button>
        }
      >
        <Input label="Nama" value={ubahNama ?? ''} onChange={(e) => setUbahNama(e.target.value)} maxLength={60} autoFocus />
      </Dialog>

      <Dialog
        bahaya
        buka={keluarKonfirm}
        tutup={() => setKeluarKonfirm(false)}
        judul="Keluar dari keluarga?"
        deskripsi={f.peranSaya === 'owner' ? (f.anggota.length > 1 ? 'Kepemilikan akan dialihkan ke admin/anggota terlama.' : 'Anda anggota terakhir — keluarga akan dihapus.') : 'Item Anda yang dibagikan akan kembali menjadi pribadi.'}
        lebar="sm"
        kaki={
          <>
            <Button varian="ghost" onClick={() => setKeluarKonfirm(false)}>
              Batal
            </Button>
            <Button
              varian="danger"
              ikon={<DoorOpen />}
              onClick={async () => {
                await jalan(() => f.keluar(), 'Anda telah keluar dari keluarga')
                setKeluarKonfirm(false)
              }}
            >
              Keluar
            </Button>
          </>
        }
      />

      <Dialog
        bahaya
        buka={!!keluarkan}
        tutup={() => setKeluarkan(null)}
        judul={`Keluarkan ${keluarkan?.display_name ?? ''}?`}
        deskripsi="Item yang dibagikannya akan kembali menjadi pribadi miliknya."
        lebar="sm"
        kaki={
          <>
            <Button varian="ghost" onClick={() => setKeluarkan(null)}>
              Batal
            </Button>
            <Button
              varian="danger"
              onClick={async () => {
                if (keluarkan) await jalan(() => f.keluarkan(keluarkan.user_id), 'Anggota dikeluarkan')
                setKeluarkan(null)
              }}
            >
              Keluarkan
            </Button>
          </>
        }
      />
    </div>
  )
}
