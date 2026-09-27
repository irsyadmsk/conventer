import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion'
import { CalendarClock, GripVertical, ListChecks, Play, Plus, Save, Sparkles, Trash2, Users, Workflow, X, Zap } from 'lucide-react'
import { TRANSFORMASI, jalankanResep, paramBawaan, transformasiById, type Langkah } from '@/lib/transforms'
import { useItemAksi, useItems, type Item } from '@/lib/items'
import { useFamily } from '@/lib/family'
import { usePrefs } from '@/lib/prefs'
import { catat } from '@/lib/activity'
import { pesanGalat } from '@/lib/supabase'
import { cn, unduh } from '@/lib/utils'
import { PageHeader, Panel } from '@/components/ui/Layout'
import { Badge, CopyButton, Segmented, Switch } from '@/components/ui/Controls'
import { Button, IconButton } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'

type LangkahId = Langkah & { uid: string }
type KontenResep = { langkah: Langkah[]; deskripsi?: string }

const uid = () => Math.random().toString(36).slice(2, 9)

const TEMPLAT: { nama: string; ket: string; langkah: Langkah[] }[] = [
  { nama: 'Pesan rahasia', ket: 'Caesar lalu Base64 — sulit dibaca sekilas', langkah: [{ id: 'caesar:enc', param: { geser: 7 } }, { id: 'base64:enc' }] },
  { nama: 'Buka pesan rahasia', ket: 'Kebalikan resep di atas', langkah: [{ id: 'base64:dec' }, { id: 'caesar:dec', param: { geser: 7 } }] },
  { nama: 'Undangan beraksara', ket: 'Rapikan spasi lalu alih aksara Sunda', langkah: [{ id: 'trim' }, { id: 'l2s' }] },
  { nama: 'Slug tautan', ket: 'Hapus diakritik → kebab-case', langkah: [{ id: 'nodiacritic' }, { id: 'kebab' }] },
  { nama: 'Daftar bersih', ket: 'Rapikan, hapus duplikat, urutkan', langkah: [{ id: 'trim' }, { id: 'dedupe' }, { id: 'sortlines' }] },
  { nama: 'Sidik jari teks', ket: 'Rapikan lalu SHA-256', langkah: [{ id: 'trim' }, { id: 'sha256' }] },
]

function KartuLangkah({
  l,
  i,
  jejak,
  ubah,
  hapus,
}: {
  l: LangkahId
  i: number
  jejak?: { hasil: string; galat?: string }
  ubah: (p: Record<string, string | number>) => void
  hapus: () => void
}) {
  const t = transformasiById(l.id)!
  const kontrol = useDragControls()
  return (
    <Reorder.Item
      value={l}
      dragListener={false}
      dragControls={kontrol}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 30 }}
      whileDrag={{ scale: 1.02, boxShadow: 'var(--shadow-pop)' }}
      className="relative rounded-2xl border border-line bg-surface"
    >
      <div className="flex items-center gap-2 p-3">
        <button
          onPointerDown={(e) => kontrol.start(e)}
          className="grid size-9 cursor-grab touch-none place-items-center rounded-lg text-ink-3 hover:bg-surface-2 active:cursor-grabbing"
          aria-label={`Seret untuk mengurutkan langkah ${i + 1}`}
        >
          <GripVertical className="size-4" />
        </button>
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-ink">{i + 1}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{t.label}</p>
          <p className="text-xs text-ink-3">{t.grup}</p>
        </div>
        <IconButton label={`Hapus langkah ${t.label}`} ukuran="sm" onClick={hapus}>
          <X />
        </IconButton>
      </div>
      {t.param && (
        <div className="grid gap-2 border-t border-line px-3 py-2.5 sm:grid-cols-2">
          {t.param.map((p) =>
            p.jenis === 'pilihan' ? (
              <label key={p.kunci} className="flex items-center gap-2 text-xs font-semibold text-ink-2">
                {p.label}
                <select className="field h-9 py-0 text-sm" value={String(l.param?.[p.kunci] ?? p.bawaan)} onChange={(e) => ubah({ ...l.param, [p.kunci]: e.target.value })}>
                  {p.pilihan!.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label key={p.kunci} className="flex items-center gap-2 text-xs font-semibold text-ink-2">
                <span className="shrink-0">{p.label}</span>
                <input
                  className="field h-9 py-0 text-sm"
                  type={p.jenis === 'angka' ? 'number' : 'text'}
                  value={l.param?.[p.kunci] ?? p.bawaan}
                  onChange={(e) => ubah({ ...l.param, [p.kunci]: p.jenis === 'angka' ? Number(e.target.value) : e.target.value })}
                />
              </label>
            ),
          )}
        </div>
      )}
      {jejak && (
        <div className={cn('mx-3 mb-3 truncate rounded-lg px-2.5 py-1.5 font-mono text-xs', jejak.galat ? 'bg-danger-soft text-danger' : 'bg-surface-2 text-ink-2')} title={jejak.hasil}>
          {jejak.galat ?? (jejak.hasil || '∅')}
        </div>
      )}
    </Reorder.Item>
  )
}

export default function Otomatisasi() {
  const [sp, setSp] = useSearchParams()
  const { keluarga } = useFamily()
  const { prefs, set } = usePrefs()
  const { items: resep } = useItems<KontenResep>({ kind: 'pipeline' })
  const aksi = useItemAksi()
  const toast = useToast()

  const [langkah, setLangkah] = useState<LangkahId[]>(() => TEMPLAT[0].langkah.map((l) => ({ ...l, uid: uid() })))
  const [nama, setNama] = useState(TEMPLAT[0].nama)
  const [idAktif, setIdAktif] = useState<string | null>(null)
  const [masukan, setMasukan] = useState('Rapat keluarga hari Minggu jam 10 di rumah Nenek.')
  const [mode, setMode] = useState<'satu' | 'massal'>('satu')
  const [jejak, setJejak] = useState<{ id: string; hasil: string; galat?: string }[]>([])
  const [hasil, setHasil] = useState('')
  const [massal, setMassal] = useState<{ a: string; b: string }[]>([])
  const [memuat, setMemuat] = useState(false)
  const [pilih, setPilih] = useState(false)
  const [cari, setCari] = useState('')
  const [simpanBuka, setSimpanBuka] = useState(false)
  const [bagikan, setBagikan] = useState(false)

  function muatResep(it: Item<KontenResep>) {
    setLangkah((it.content.langkah ?? []).map((l) => ({ ...l, uid: uid() })))
    setNama(it.title)
    setIdAktif(it.id)
  }

  useEffect(() => {
    const id = sp.get('resep')
    const it = id && resep.find((r) => r.id === id)
    if (it) {
      muatResep(it)
      setSp({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp, resep])

  const bersih = useMemo(() => langkah.map(({ id, param }) => ({ id, param })), [langkah])

  // Pratinjau langsung (mode satu).
  useEffect(() => {
    if (mode !== 'satu') return
    let batal = false
    jalankanResep(masukan, bersih).then((r) => {
      if (batal) return
      setJejak(r.jejak)
      setHasil(r.hasil)
    })
    return () => {
      batal = true
    }
  }, [masukan, bersih, mode])

  async function jalankanMassal() {
    setMemuat(true)
    const baris = masukan.split('\n').filter((b) => b.trim())
    const out: { a: string; b: string }[] = []
    for (const b of baris.slice(0, 2000)) out.push({ a: b, b: (await jalankanResep(b, bersih)).hasil })
    setMassal(out)
    setMemuat(false)
    catat('otomatisasi', 'resep', masukan.length, { baris: out.length, langkah: bersih.length })
    toast(`${out.length} baris diproses`)
  }

  async function simpan() {
    try {
      if (idAktif && resep.some((r) => r.id === idAktif)) {
        await aksi.ubah(idAktif, { title: nama, content: { langkah: bersih } })
        toast('Resep diperbarui')
      } else {
        const it = await aksi.simpan({ kind: 'pipeline', tool: 'otomatisasi', title: nama, content: { langkah: bersih }, bagikan })
        setIdAktif(it.id)
        toast('Resep disimpan', { isi: bagikan ? 'Semua anggota keluarga bisa memakainya.' : undefined })
      }
      setSimpanBuka(false)
    } catch (e) {
      toast('Gagal menyimpan', { nada: 'galat', isi: pesanGalat(e) })
    }
  }

  const tersaring = TRANSFORMASI.filter((t) => !cari || t.label.toLowerCase().includes(cari.toLowerCase()) || t.grup.toLowerCase().includes(cari.toLowerCase()))

  return (
    <div>
      <PageHeader
        eyebrow="Ruang"
        judul="Otomatisasi"
        deskripsi="Rangkai beberapa langkah konversi menjadi satu resep, jalankan untuk satu teks atau ratusan baris sekaligus, lalu bagikan resepnya ke keluarga."
        ikon={<Workflow />}
      />

      <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
        {/* Kiri: resep tersimpan & templat */}
        <div className="flex flex-col gap-4">
          <Panel judul="Resep tersimpan" isiClassName="p-2 sm:p-2">
            {resep.length === 0 ? (
              <p className="p-3 text-sm text-ink-3">Belum ada. Susun resep lalu tekan Simpan.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {resep.map((r) => (
                  <li key={r.id} className="group flex items-center gap-1">
                    <button
                      onClick={() => muatResep(r)}
                      className={cn('flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors', idAktif === r.id ? 'bg-accent-soft' : 'hover:bg-surface-2')}
                    >
                      <Zap className={cn('size-4 shrink-0', idAktif === r.id ? 'text-accent-text' : 'text-ink-3')} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{r.title}</span>
                        <span className="block text-xs text-ink-3">{r.content.langkah?.length ?? 0} langkah</span>
                      </span>
                      {r.family_id && <Users className="size-3.5 shrink-0 text-info" aria-label="Dibagikan ke keluarga" />}
                    </button>
                    <IconButton
                      label={`Hapus resep ${r.title}`}
                      ukuran="sm"
                      className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                      onClick={async () => {
                        try {
                          await aksi.hapus(r.id)
                          if (idAktif === r.id) setIdAktif(null)
                          toast('Resep dihapus')
                        } catch (e) {
                          toast('Gagal', { nada: 'galat', isi: pesanGalat(e) })
                        }
                      }}
                    >
                      <Trash2 />
                    </IconButton>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel judul="Templat siap pakai" isiClassName="p-2 sm:p-2">
            <ul className="flex flex-col gap-1">
              {TEMPLAT.map((t) => (
                <li key={t.nama}>
                  <button
                    onClick={() => {
                      setLangkah(t.langkah.map((l) => ({ ...l, uid: uid() })))
                      setNama(t.nama)
                      setIdAktif(null)
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-2"
                  >
                    <span className="block text-sm font-semibold">{t.nama}</span>
                    <span className="block text-xs text-ink-3">{t.ket}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Kanan: editor */}
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
            <Panel
              judul={
                <input
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  aria-label="Nama resep"
                  className="-ml-1 rounded-lg bg-transparent px-1 py-0.5 text-[15px] font-bold text-ink outline-none focus:bg-surface-2 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40"
                />
              }
              aksi={
                <>
                  <Button ukuran="sm" varian="soft" ikon={<Save />} onClick={() => (idAktif ? simpan() : setSimpanBuka(true))} disabled={!langkah.length}>
                    {idAktif ? 'Perbarui' : 'Simpan'}
                  </Button>
                </>
              }
            >
              <Reorder.Group axis="y" values={langkah} onReorder={setLangkah} className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {langkah.map((l, i) => (
                    <KartuLangkah
                      key={l.uid}
                      l={l}
                      i={i}
                      jejak={mode === 'satu' ? jejak[i] : undefined}
                      ubah={(p) => setLangkah((xs) => xs.map((x) => (x.uid === l.uid ? { ...x, param: p } : x)))}
                      hapus={() => setLangkah((xs) => xs.filter((x) => x.uid !== l.uid))}
                    />
                  ))}
                </AnimatePresence>
              </Reorder.Group>
              {!langkah.length && <p className="rounded-2xl border border-dashed border-line-2 p-6 text-center text-sm text-ink-3">Tambahkan langkah pertama.</p>}
              <Button varian="outline" penuh ikon={<Plus />} className="mt-3" onClick={() => setPilih(true)}>
                Tambah langkah
              </Button>
            </Panel>

            <Panel
              judul="Jalankan"
              titik="sukses"
              aksi={
                <Segmented
                  ukuran="sm"
                  label="Mode"
                  nilai={mode}
                  onChange={setMode}
                  pilihan={[
                    { id: 'satu', label: 'Satu teks', ikon: <Sparkles /> },
                    { id: 'massal', label: 'Per baris', ikon: <ListChecks /> },
                  ]}
                />
              }
            >
              <label htmlFor="oto-in" className="eyebrow mb-1.5 block">
                {mode === 'satu' ? 'Masukan' : 'Satu item per baris (maks. 2.000)'}
              </label>
              <textarea id="oto-in" value={masukan} onChange={(e) => setMasukan(e.target.value)} className="field min-h-32 font-mono text-sm" />
              {mode === 'satu' ? (
                <>
                  <div className="mt-4 mb-1.5 flex items-center justify-between">
                    <p className="eyebrow">Hasil akhir</p>
                    <CopyButton teks={hasil} tool="otomatisasi" onSalin={() => catat('otomatisasi', 'resep', masukan.length)} />
                  </div>
                  <output className={cn('block min-h-24 rounded-xl bg-surface-2 p-3 text-sm break-words whitespace-pre-wrap', bersih.some((l) => l.id === 'l2s') ? 'sunda text-xl' : 'font-mono')}>{hasil || '—'}</output>
                </>
              ) : (
                <>
                  <div className="mt-3 flex gap-2">
                    <Button varian="primary" ikon={<Play />} memuat={memuat} onClick={jalankanMassal} disabled={!langkah.length}>
                      Proses semua baris
                    </Button>
                    {massal.length > 0 && (
                      <Button
                        varian="outline"
                        onClick={() => unduh(`${nama}.csv`, '﻿masukan;hasil\n' + massal.map((m) => `"${m.a.replace(/"/g, '""')}";"${m.b.replace(/"/g, '""')}"`).join('\n'), 'text/csv;charset=utf-8')}
                      >
                        Unduh CSV
                      </Button>
                    )}
                  </div>
                  {massal.length > 0 && (
                    <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-line">
                      <table className="w-full text-[13px]">
                        <thead className="sticky top-0 bg-surface-2 text-xs text-ink-3">
                          <tr>
                            <th className="px-3 py-2 text-left">Masukan</th>
                            <th className="px-3 py-2 text-left">Hasil</th>
                          </tr>
                        </thead>
                        <tbody>
                          {massal.map((m, i) => (
                            <tr key={i} className="border-t border-line">
                              <td className="max-w-40 truncate px-3 py-1.5">{m.a}</td>
                              <td className="max-w-60 truncate px-3 py-1.5 font-mono">{m.b}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </Panel>
          </div>

          <Panel judul="Otomatisasi berjalan di latar" aksi={<CalendarClock className="size-4 text-accent-text" aria-hidden />}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-surface-2 p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-bold">Laporan mingguan</p>
                  <Badge nada="sukses">Aktif</Badge>
                </div>
                <p className="text-[13px] text-ink-3">Dibuat otomatis tiap Senin 00.10 WIB untuk Anda{keluarga ? ` dan keluarga ${keluarga.name}` : ''}. Lihat di Laporan → Arsip.</p>
              </div>
              <div className="rounded-2xl bg-surface-2 p-4">
                <Switch checked={prefs.weeklyAi} onChange={(v) => set({ weeklyAi: v })} label="Ringkasan AI mingguan" keterangan="AI menuliskan narasi laporan saat Anda membuka Laporan." />
              </div>
              <div className="rounded-2xl bg-surface-2 p-4">
                <Switch checked={prefs.autoSave} onChange={(v) => set({ autoSave: v })} label="Simpan otomatis" keterangan="Setiap hasil yang disalin langsung masuk Koleksi." />
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <Dialog buka={pilih} tutup={() => setPilih(false)} judul="Tambah langkah" lebar="lg">
        <Input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari transformasi…" aria-label="Cari transformasi" autoFocus className="mb-4" />
        {(['Pengodean', 'Aksara', 'Sandi', 'Huruf', 'Rapikan', 'Hash'] as const).map((g) => {
          const xs = tersaring.filter((t) => t.grup === g)
          if (!xs.length) return null
          return (
            <div key={g} className="mb-4">
              <p className="eyebrow mb-2">{g}</p>
              <div className="flex flex-wrap gap-1.5">
                {xs.map((t) => (
                  <motion.button
                    key={t.id}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      setLangkah((ls) => [...ls, { id: t.id, param: paramBawaan(t), uid: uid() }])
                      setPilih(false)
                      setCari('')
                    }}
                    className="h-9 rounded-full border border-line bg-surface px-3.5 text-[13px] font-semibold transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-text"
                  >
                    {t.label}
                  </motion.button>
                ))}
              </div>
            </div>
          )
        })}
      </Dialog>

      <Dialog
        buka={simpanBuka}
        tutup={() => setSimpanBuka(false)}
        judul="Simpan resep"
        lebar="sm"
        kaki={
          <>
            <Button varian="ghost" onClick={() => setSimpanBuka(false)}>
              Batal
            </Button>
            <Button varian="primary" onClick={simpan}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Nama resep" value={nama} onChange={(e) => setNama(e.target.value)} autoFocus />
          {keluarga && <Switch checked={bagikan} onChange={setBagikan} label={`Bagikan ke keluarga ${keluarga.name}`} />}
        </div>
      </Dialog>
    </div>
  )
}
