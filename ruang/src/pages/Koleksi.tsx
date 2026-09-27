import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, ExternalLink, Library, Lock, Pencil, Pin, PinOff, Search, Trash2, Users } from 'lucide-react'
import { alatById, namaAlat } from '@/tools'
import { useAuth } from '@/lib/auth'
import { useFamily } from '@/lib/family'
import { useItemAksi, useItems, type Item } from '@/lib/items'
import { pesanGalat } from '@/lib/supabase'
import { cn, unduh, waktuRelatif } from '@/lib/utils'
import { PageHeader } from '@/components/ui/Layout'
import { Avatar, Badge, CopyButton, EmptyState, Segmented } from '@/components/ui/Controls'
import { Button, IconButton } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { Chip } from '@/components/ToolKit'

type Lingkup = 'semua' | 'saya' | 'keluarga'
const JENIS: Record<string, string> = { semua: 'Semua', snippet: 'Hasil alat', apma: 'Modul ajar', pipeline: 'Resep', calc: 'Perhitungan' }

function teksUtama(it: Item) {
  const c = it.content as Record<string, unknown>
  if (typeof c.hasil === 'string') return c.hasil
  if (typeof c.teks === 'string') return c.teks
  return JSON.stringify(c, null, 2)
}

export default function Koleksi() {
  const { user } = useAuth()
  const { keluarga, anggota, peranSaya } = useFamily()
  const { items, memuat } = useItems()
  const aksi = useItemAksi()
  const toast = useToast()
  const nav = useNavigate()
  const [sp, setSp] = useSearchParams()
  const [q, setQ] = useState('')
  const [jenis, setJenis] = useState('semua')
  const [lingkup, setLingkup] = useState<Lingkup>('semua')
  const [buka, setBuka] = useState<Item | null>(null)
  const [ubahJudul, setUbahJudul] = useState<{ id: string; judul: string } | null>(null)
  const [hapus, setHapus] = useState<Item | null>(null)

  useEffect(() => {
    const id = sp.get('buka')
    if (id && items.length) {
      const it = items.find((x) => x.id === id)
      if (it) bukaItem(it)
      setSp({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp, items])

  const saring = useMemo(() => {
    const k = q.trim().toLowerCase()
    return items.filter((it) => {
      if (jenis !== 'semua' && it.kind !== jenis) return false
      if (lingkup === 'saya' && it.owner_id !== user?.id) return false
      if (lingkup === 'keluarga' && !it.family_id) return false
      if (!k) return true
      return it.title.toLowerCase().includes(k) || namaAlat(it.tool).toLowerCase().includes(k) || teksUtama(it).toLowerCase().includes(k)
    })
  }, [items, q, jenis, lingkup, user])

  const namaPemilik = (id: string) => (id === user?.id ? 'Anda' : anggota.find((a) => a.user_id === id)?.display_name ?? 'Anggota')

  function bukaItem(it: Item) {
    if (it.kind === 'apma') return nav(`/modul-ajar/${it.id}`)
    if (it.kind === 'pipeline') return nav(`/otomatisasi?resep=${it.id}`)
    setBuka(it)
  }

  async function jalan(fn: () => Promise<void>, ok: string) {
    try {
      await fn()
      toast(ok)
    } catch (e) {
      toast('Gagal', { nada: 'galat', isi: pesanGalat(e) })
    }
  }

  const bisaHapus = (it: Item) => it.owner_id === user?.id || peranSaya === 'owner' || peranSaya === 'admin'

  return (
    <div>
      <PageHeader
        eyebrow="Ruang"
        judul="Koleksi"
        deskripsi="Semua yang Anda simpan — hasil alat, modul ajar, resep, dan perhitungan. Tersinkron seketika ke semua perangkat dan anggota keluarga."
        ikon={<Library />}
        aksi={
          <Button ukuran="sm" varian="ghost" ikon={<Download />} disabled={!items.length} onClick={() => unduh('koleksi-ruang.json', JSON.stringify(items, null, 2), 'application/json')}>
            Ekspor JSON
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input className="flex-1" ikon={<Search />} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari judul, alat, atau isi…" aria-label="Cari koleksi" />
        <Segmented
          label="Pemilik"
          nilai={lingkup}
          onChange={setLingkup}
          pilihan={[
            { id: 'semua', label: 'Semua' },
            { id: 'saya', label: 'Milik saya' },
            { id: 'keluarga', label: 'Dibagikan', ikon: <Users /> },
          ]}
        />
      </div>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {Object.entries(JENIS).map(([id, n]) => (
          <Chip key={id} aktif={jenis === id} onClick={() => setJenis(id)}>
            {n} {id !== 'semua' && <span className="opacity-60">{items.filter((i) => i.kind === id).length}</span>}
          </Chip>
        ))}
      </div>

      {memuat ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton h-36" />
          ))}
        </div>
      ) : saring.length === 0 ? (
        <EmptyState
          ikon={<Library />}
          judul={items.length ? 'Tidak ada yang cocok' : 'Koleksi masih kosong'}
          isi={items.length ? 'Ubah kata kunci atau filter.' : 'Tekan tombol “Simpan” di alat mana pun. Hasilnya muncul di sini dan di semua perangkat Anda.'}
          aksi={!items.length && <Button varian="primary" onClick={() => nav('/aksara')}>Coba Pangalihtulis</Button>}
        />
      ) : (
        <motion.ul layout className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {saring.map((it) => {
              const a = alatById(it.tool)
              const milikSaya = it.owner_id === user?.id
              return (
                <motion.li
                  key={it.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="card group flex flex-col p-4 transition-shadow hover:shadow-[var(--shadow-lift)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-text">{a ? <a.ikon className="size-5" /> : <Library className="size-5" />}</span>
                    <div className="min-w-0 flex-1">
                      <button onClick={() => bukaItem(it)} className="block w-full truncate text-left font-bold hover:text-accent-text">
                        {it.title}
                      </button>
                      <p className="truncate text-xs text-ink-3">
                        {JENIS[it.kind]} · {a?.nama ?? it.tool} · {waktuRelatif(it.updated_at)}
                      </p>
                    </div>
                    <IconButton
                      label={it.pinned ? 'Lepas sematan' : 'Sematkan'}
                      ukuran="sm"
                      varian={it.pinned ? 'soft' : 'ghost'}
                      onClick={() => jalan(() => aksi.ubah(it.id, { pinned: !it.pinned }), it.pinned ? 'Sematan dilepas' : 'Disematkan')}
                    >
                      {it.pinned ? <PinOff /> : <Pin />}
                    </IconButton>
                  </div>
                  <p className={cn('mt-3 line-clamp-3 min-h-[3.6em] text-[13px] break-words text-ink-2', it.tool === 'aksara' && 'sunda text-base')}>{teksUtama(it).slice(0, 300)}</p>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                    <span className="flex min-w-0 items-center gap-1.5 text-xs text-ink-3">
                      {it.family_id ? (
                        <>
                          <Avatar nama={namaPemilik(it.owner_id)} ukuran={20} />
                          <span className="truncate">{namaPemilik(it.owner_id)} · keluarga</span>
                        </>
                      ) : (
                        <>
                          <Lock className="size-3.5" aria-hidden /> Pribadi
                        </>
                      )}
                    </span>
                    <div className="flex gap-0.5 opacity-80 transition-opacity group-hover:opacity-100">
                      {milikSaya && keluarga && (
                        <IconButton
                          label={it.family_id ? 'Jadikan pribadi' : `Bagikan ke ${keluarga.name}`}
                          ukuran="sm"
                          onClick={() => jalan(() => aksi.bagikan(it.id, !it.family_id), it.family_id ? 'Kini pribadi' : 'Dibagikan ke keluarga')}
                        >
                          {it.family_id ? <Lock /> : <Users />}
                        </IconButton>
                      )}
                      {(milikSaya || peranSaya !== 'anak') && (
                        <IconButton label="Ubah judul" ukuran="sm" onClick={() => setUbahJudul({ id: it.id, judul: it.title })}>
                          <Pencil />
                        </IconButton>
                      )}
                      {bisaHapus(it) && (
                        <IconButton label="Hapus" ukuran="sm" onClick={() => setHapus(it)} className="hover:!text-danger">
                          <Trash2 />
                        </IconButton>
                      )}
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </motion.ul>
      )}

      <Dialog buka={!!buka} tutup={() => setBuka(null)} judul={buka?.title ?? ''} deskripsi={buka ? `${namaAlat(buka.tool)} · disimpan ${waktuRelatif(buka.created_at)} oleh ${namaPemilik(buka.owner_id)}` : ''} lebar="lg">
        {buka && (
          <div className="flex flex-col gap-4">
            {typeof (buka.content as Record<string, unknown>).masukan === 'string' && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="eyebrow">Masukan</p>
                  <CopyButton teks={String((buka.content as Record<string, unknown>).masukan)} tool="koleksi" varian="ghost" />
                </div>
                <pre className="max-h-48 overflow-auto rounded-xl bg-surface-2 p-3 font-mono text-[13px] whitespace-pre-wrap">{String((buka.content as Record<string, unknown>).masukan)}</pre>
              </div>
            )}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="eyebrow">Hasil</p>
                <CopyButton teks={teksUtama(buka)} tool="koleksi" />
              </div>
              <pre className={cn('max-h-80 overflow-auto rounded-xl bg-surface-2 p-3 text-[13px] break-words whitespace-pre-wrap', buka.tool === 'aksara' ? 'sunda text-2xl' : 'font-mono')}>{teksUtama(buka)}</pre>
            </div>
            {alatById(buka.tool) && (
              <Button varian="ghost" ikon={<ExternalLink />} onClick={() => nav(alatById(buka.tool)!.path)} className="self-start">
                Buka {alatById(buka.tool)!.nama}
              </Button>
            )}
          </div>
        )}
      </Dialog>

      <Dialog
        buka={!!ubahJudul}
        tutup={() => setUbahJudul(null)}
        judul="Ubah judul"
        lebar="sm"
        kaki={
          <>
            <Button varian="ghost" onClick={() => setUbahJudul(null)}>
              Batal
            </Button>
            <Button
              varian="primary"
              onClick={async () => {
                if (!ubahJudul) return
                await jalan(() => aksi.ubah(ubahJudul.id, { title: ubahJudul.judul.trim() || 'Tanpa judul' }), 'Judul diperbarui')
                setUbahJudul(null)
              }}
            >
              Simpan
            </Button>
          </>
        }
      >
        <Input label="Judul" value={ubahJudul?.judul ?? ''} onChange={(e) => setUbahJudul((x) => x && { ...x, judul: e.target.value })} maxLength={200} autoFocus />
      </Dialog>

      <Dialog
        bahaya
        buka={!!hapus}
        tutup={() => setHapus(null)}
        judul="Hapus item ini?"
        deskripsi={hapus?.family_id ? 'Item ini dibagikan — akan hilang untuk semua anggota keluarga.' : 'Tindakan ini tidak dapat dibatalkan.'}
        lebar="sm"
        kaki={
          <>
            <Button varian="ghost" onClick={() => setHapus(null)}>
              Batal
            </Button>
            <Button
              varian="danger"
              ikon={<Trash2 />}
              onClick={async () => {
                if (!hapus) return
                await jalan(() => aksi.hapus(hapus.id), 'Dihapus')
                setHapus(null)
              }}
            >
              Hapus
            </Button>
          </>
        }
      >
        <p className="rounded-xl bg-surface-2 p-3 text-sm font-semibold">{hapus?.title}</p>
        {hapus?.family_id && <Badge nada="peringatan" className="mt-3">Dibagikan ke keluarga</Badge>}
      </Dialog>
    </div>
  )
}
