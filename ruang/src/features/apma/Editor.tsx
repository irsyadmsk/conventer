import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion, Reorder } from 'framer-motion'
import {
  ArrowLeft,
  Bot,
  Check,
  CloudCheck,
  CloudUpload,
  Download,
  Eye,
  FileCode2,
  FileText,
  GripVertical,
  History,
  LayoutList,
  Lock,
  Palette,
  Pencil,
  Plus,
  Printer,
  Redo2,
  School,
  ShieldCheck,
  Sparkles,
  Trash2,
  Undo2,
  Users,
  Wand2,
} from 'lucide-react'
import { supabase, pesanGalat } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { useFamily } from '@/lib/family'
import { usePrefs } from '@/lib/prefs'
import { useItemAksi, type Item } from '@/lib/items'
import { panggilAI } from '@/lib/ai'
import { catat } from '@/lib/activity'
import { cn, waktuRelatif } from '@/lib/utils'
import { Button, IconButton } from '@/components/ui/Button'
import { Badge, Segmented, Switch } from '@/components/ui/Controls'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { Dialog } from '@/components/ui/Dialog'
import { useToast } from '@/components/ui/Toast'
import { Cincin } from '@/components/charts/Charts'
import type { DocumentDesign, ModuleBlock, SchoolProfile } from './types'
import { REGULATORY_GLOSSARY, replaceRegulatoryTerms } from './utils'
import { cetak, eksporHtml, eksporMarkdown, eksporWord, mdKeHtml, susunDokumen } from './berkas'
import { GENERATOR, TEMA_DOKUMEN, desainBawaan, sekolahBawaan, type KontenModul } from './konstanta'
import { auditLokal, periksaKelengkapan, type AnalisisAudit } from './model'

type Tab = 'struktur' | 'copilot' | 'audit' | 'desain' | 'profil'

const LABEL_CHECK: Record<string, string> = {
  cp: 'Capaian Pembelajaran',
  tp: 'Tujuan Pembelajaran',
  kktp: 'KKTP',
  asesmenAwal: 'Asesmen diagnostik',
  formatif: 'Asesmen formatif',
  sumatif: 'Asesmen sumatif',
  lkpd: 'LKPD',
  rubrik: 'Rubrik penilaian',
  daftarPustaka: 'Glosarium & pustaka',
}

function Markdown({ md, className }: { md: string; className?: string }) {
  const html = useMemo(() => mdKeHtml(md), [md])
  return <div className={cn('prose-ruang', className)} dangerouslySetInnerHTML={{ __html: html }} />
}

export default function Editor() {
  const { id } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const { keluarga, peranSaya } = useFamily()
  const { prefs, set: setPrefs } = usePrefs()
  const aksi = useItemAksi()

  const [item, setItem] = useState<Item<KontenModul> | null>(null)
  const [k, setK] = useState<KontenModul | null>(null)
  const [tidakAda, setTidakAda] = useState(false)
  const [tab, setTab] = useState<Tab>('struktur')
  const [pilih, setPilih] = useState<string | null>(null)
  const [mode, setMode] = useState<'dokumen' | 'blok'>('dokumen')
  const [sunting, setSunting] = useState<string | null>(null)
  const [undo, setUndo] = useState<ModuleBlock[][]>([])
  const [redo, setRedo] = useState<ModuleBlock[][]>([])
  const [status, setStatus] = useState<'tersimpan' | 'menyimpan' | 'berubah'>('tersimpan')
  const [genJenis, setGenJenis] = useState(GENERATOR[1])
  const [genInstruksi, setGenInstruksi] = useState('')
  const [memuatAI, setMemuatAI] = useState<'blok' | 'audit' | 'lengkapi' | null>(null)
  const [hapusBlok, setHapusBlok] = useState<ModuleBlock | null>(null)
  const [ekspor, setEkspor] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pertama = useRef(true)

  const bolehSunting = !!item && (item.owner_id === user?.id || (item.family_id != null && peranSaya !== 'anak'))

  useEffect(() => {
    supabase
      .from('studio_items')
      .select('*')
      .eq('id', id!)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return setTidakAda(true)
        const it = data as Item<KontenModul>
        setItem(it)
        setK({ ...it.content, versions: it.content.versions ?? [], design: { ...desainBawaan, ...it.content.design }, school: { ...sekolahBawaan, ...it.content.school } })
        setPilih(it.content.blocks?.[0]?.id ?? null)
      })
  }, [id])

  // Simpan otomatis 1,2 detik setelah berhenti mengubah.
  useEffect(() => {
    if (!k || !item) return
    if (pertama.current) {
      pertama.current = false
      return
    }
    if (!bolehSunting) return
    setStatus('berubah')
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setStatus('menyimpan')
      try {
        await aksi.ubah(item.id, { content: k as unknown as Record<string, unknown>, title: `${k.form.mapel} — ${k.form.materi}`.slice(0, 200) })
        setStatus('tersimpan')
      } catch (e) {
        setStatus('berubah')
        toast('Gagal menyimpan', { nada: 'galat', isi: pesanGalat(e) })
      }
    }, 1200)
    return () => clearTimeout(timer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k])

  // Peringatkan bila menutup tab saat perubahan belum tersimpan.
  useEffect(() => {
    if (status === 'tersimpan') return
    const f = (e: BeforeUnloadEvent) => e.preventDefault()
    addEventListener('beforeunload', f)
    return () => removeEventListener('beforeunload', f)
  }, [status])

  const ubahBlok = useCallback(
    (fn: (b: ModuleBlock[]) => ModuleBlock[]) => {
      setK((x) => {
        if (!x) return x
        setUndo((u) => [...u.slice(-40), x.blocks])
        setRedo([])
        return { ...x, blocks: fn(x.blocks) }
      })
    },
    [],
  )

  const setDesain = (p: Partial<DocumentDesign>) => setK((x) => x && { ...x, design: { ...x.design, ...p } })
  const setSekolah = (p: Partial<SchoolProfile>) => setK((x) => x && { ...x, school: { ...x.school, ...p } })

  // Pintasan papan ketik.
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key.toLowerCase() === 'z' && !e.shiftKey && undo.length && !(e.target as HTMLElement).matches('textarea,input')) {
        e.preventDefault()
        batal()
      }
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault()
        cetakDok()
      }
    }
    addEventListener('keydown', f)
    return () => removeEventListener('keydown', f)
  })

  if (tidakAda)
    return (
      <div className="py-20 text-center">
        <p className="font-display text-2xl font-semibold">Modul tidak ditemukan</p>
        <p className="mt-2 text-ink-2">Mungkin sudah dihapus atau tidak lagi dibagikan kepada Anda.</p>
        <Button className="mt-6" onClick={() => nav('/modul-ajar')}>
          Kembali ke daftar
        </Button>
      </div>
    )
  if (!k || !item) return <div className="skeleton h-[70vh]" />

  const blok = k.blocks.find((b) => b.id === pilih)
  const kelengkapan = periksaKelengkapan(k.blocks)
  const perluDilengkapi = kelengkapan.terpotong || kelengkapan.hilang.length > 0
  const audit: AnalisisAudit = k.audit ?? auditLokal(k.blocks)
  const html = () => susunDokumen(k.blocks, k.design, k.school, k.form)

  function batal() {
    if (!undo.length) return
    const prev = undo[undo.length - 1]
    setRedo((r) => [...r, k!.blocks])
    setUndo((u) => u.slice(0, -1))
    setK((x) => x && { ...x, blocks: prev })
  }
  function ulang() {
    if (!redo.length) return
    const next = redo[redo.length - 1]
    setUndo((u) => [...u, k!.blocks])
    setRedo((r) => r.slice(0, -1))
    setK((x) => x && { ...x, blocks: next })
  }
  function cetakDok() {
    try {
      cetak(html())
      catat('apma', 'unduh')
    } catch (e) {
      toast('Tidak dapat mencetak', { nada: 'galat', isi: pesanGalat(e) })
    }
  }

  async function copilot() {
    setMemuatAI('blok')
    try {
      const ringkasan = k!.blocks
        .filter((b) => /tujuan|pemahaman|asesmen/i.test(b.title))
        .map((b) => `${b.title}:\n${b.content.slice(0, 1500)}`)
        .join('\n\n')
      const h = await panggilAI('apma_blok', { jenis: genJenis, kategori: 'Lampiran', konteks: k!.form, ringkasan, instruksi: genInstruksi })
      const baru: ModuleBlock = { id: `blok-${Date.now()}`, title: genJenis, category: 'Lampiran', content: replaceRegulatoryTerms(h.teks ?? '') }
      ubahBlok((b) => [...b, baru])
      setPilih(baru.id)
      setMode('blok')
      setGenInstruksi('')
      toast(`Blok “${genJenis}” ditambahkan`)
    } catch (e) {
      toast('Copilot gagal', { nada: 'galat', isi: pesanGalat(e) })
    } finally {
      setMemuatAI(null)
    }
  }

  /** Perbaiki modul terpotong: sambung blok terakhir lalu buat blok baku yang hilang. */
  async function lengkapi() {
    setMemuatAI('lengkapi')
    const { hilang, terpotong } = periksaKelengkapan(k!.blocks)
    const ringkasan = k!.blocks
      .filter((b) => /tujuan|pemahaman|asesmen/i.test(b.title))
      .map((b) => `${b.title}:\n${b.content.slice(0, 1200)}`)
      .join('\n\n')
    let berhasil = 0
    try {
      if (terpotong) {
        const akhir = k!.blocks[k!.blocks.length - 1]
        const h = await panggilAI('apma_blok', {
          jenis: `Lanjutan "${akhir.title}"`,
          kategori: akhir.category,
          konteks: k!.form,
          ringkasan,
          instruksi: `Bagian ini terpotong. Lanjutkan TEPAT dari akhir teks berikut tanpa mengulangnya, lalu selesaikan bagian ini:\n\n${akhir.content.slice(-2500)}`,
        })
        const sambung = replaceRegulatoryTerms(h.teks ?? '')
        ubahBlok((bs) => bs.map((b) => (b.id === akhir.id ? { ...b, content: `${b.content}${/^\s/.test(sambung) ? '' : ' '}${sambung}` } : b)))
        berhasil++
      }
      for (const s of hilang) {
        const h = await panggilAI('apma_blok', { jenis: s.judul, kategori: s.kategori, konteks: k!.form, ringkasan, instruksi: 'Ikuti struktur modul ajar baku; lengkap dan operasional.' })
        const baru: ModuleBlock = { id: `blok-${Date.now()}-${berhasil}`, title: s.judul, category: s.kategori, content: replaceRegulatoryTerms(h.teks ?? '') }
        ubahBlok((bs) => [...bs, baru])
        berhasil++
      }
      toast('Modul dilengkapi', { isi: `${berhasil} bagian diperbaiki atau ditambahkan.` })
    } catch (e) {
      toast(berhasil ? `Sebagian selesai (${berhasil})` : 'Gagal melengkapi', { nada: 'galat', isi: pesanGalat(e) })
    } finally {
      setMemuatAI(null)
    }
  }

  async function auditAI() {
    setMemuatAI('audit')
    try {
      const h = await panggilAI('apma_audit', { blocks: k!.blocks, mapel: k!.form.mapel })
      const a = h.json as AnalisisAudit
      setK((x) => x && { ...x, audit: { ...auditLokal(x.blocks), ...a } })
      toast('Audit selesai', { isi: `Skor ${a.score}/100` })
    } catch (e) {
      setK((x) => x && { ...x, audit: auditLokal(x.blocks) })
      toast('Audit AI gagal — memakai audit lokal', { nada: 'info', isi: pesanGalat(e) })
    } finally {
      setMemuatAI(null)
    }
  }

  function perbaikiIstilah() {
    let n = 0
    ubahBlok((bs) =>
      bs.map((b) => {
        const c = replaceRegulatoryTerms(b.content)
        if (c !== b.content) n++
        return { ...b, content: c }
      }),
    )
    setK((x) => x && { ...x, audit: { ...(x.audit ?? auditLokal(x.blocks)), warnings: (x.audit?.warnings ?? []).filter((w) => w.type !== 'regulasi') } })
    toast(n ? `Istilah diperbarui di ${n} blok` : 'Semua istilah sudah sesuai')
  }

  function simpanVersi() {
    setK((x) => x && { ...x, versions: [{ id: `v-${Date.now()}`, waktu: new Date().toISOString(), label: `Versi ${x.versions.length + 1}`, blocks: x.blocks }, ...x.versions].slice(0, 15) })
    toast('Versi disimpan')
  }

  const TAB: { id: Tab; label: string; ikon: React.ReactNode }[] = [
    { id: 'struktur', label: 'Struktur', ikon: <LayoutList /> },
    { id: 'copilot', label: 'Copilot', ikon: <Bot /> },
    { id: 'audit', label: 'Audit', ikon: <ShieldCheck /> },
    { id: 'desain', label: 'Desain', ikon: <Palette /> },
    { id: 'profil', label: 'Profil', ikon: <School /> },
  ]

  return (
    <div>
      {/* Bilah alat */}
      <div className="sticky top-16 z-20 -mx-4 mb-4 flex flex-wrap items-center gap-2 border-b border-line bg-bg/85 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <IconButton label="Kembali ke daftar modul" onClick={() => nav('/modul-ajar')}>
          <ArrowLeft />
        </IconButton>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold">{k.form.materi || 'Modul ajar'}</p>
          <p className="flex items-center gap-1.5 truncate text-xs text-ink-3">
            {status === 'tersimpan' ? <CloudCheck className="size-3.5 text-success" /> : <CloudUpload className="size-3.5 animate-pulse" />}
            {!bolehSunting ? 'Hanya baca' : status === 'tersimpan' ? `Tersimpan · ${waktuRelatif(item.updated_at)}` : status === 'menyimpan' ? 'Menyimpan…' : 'Perubahan belum tersimpan'}
            <span aria-hidden>·</span> {k.form.mapel} · Fase {k.form.fase}
          </p>
        </div>
        <IconButton label="Urungkan (Ctrl Z)" ukuran="sm" onClick={batal} disabled={!undo.length}>
          <Undo2 />
        </IconButton>
        <IconButton label="Ulangi" ukuran="sm" onClick={ulang} disabled={!redo.length}>
          <Redo2 />
        </IconButton>
        {item.owner_id === user?.id && keluarga && (
          <Button
            ukuran="sm"
            varian={item.family_id ? 'soft' : 'ghost'}
            ikon={item.family_id ? <Users /> : <Lock />}
            onClick={async () => {
              try {
                await aksi.bagikan(item.id, !item.family_id)
                setItem((x) => x && { ...x, family_id: x.family_id ? null : keluarga.id })
                toast(item.family_id ? 'Modul kini pribadi' : `Dibagikan ke ${keluarga.name}`)
              } catch (e) {
                toast('Gagal', { nada: 'galat', isi: pesanGalat(e) })
              }
            }}
          >
            {item.family_id ? 'Dibagikan' : 'Pribadi'}
          </Button>
        )}
        <Button ukuran="sm" varian="outline" ikon={<Printer />} onClick={cetakDok}>
          Cetak / PDF
        </Button>
        <Button ukuran="sm" varian="primary" ikon={<Download />} onClick={() => setEkspor(true)}>
          Ekspor
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* Panel samping */}
        <aside className="card flex flex-col self-start lg:sticky lg:top-36">
          <div className="border-b border-line p-2">
            <Segmented label="Panel" nilai={tab} onChange={setTab} ukuran="sm" penuh pilihan={TAB.map((t) => ({ id: t.id, label: <span className="sr-only sm:not-sr-only">{t.label}</span>, ikon: t.ikon }))} />
          </div>
          <div className="max-h-[calc(100dvh-14rem)] overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {tab === 'struktur' && (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold">{k.blocks.length} blok</p>
                      {bolehSunting && (
                        <Button
                          ukuran="sm"
                          varian="soft"
                          ikon={<Plus />}
                          onClick={() => {
                            const b: ModuleBlock = { id: `blok-${Date.now()}`, title: 'Blok baru', category: 'Komponen Inti', content: '#### Judul\nTulis isi di sini.' }
                            ubahBlok((x) => [...x, b])
                            setPilih(b.id)
                            setMode('blok')
                            setSunting(b.content)
                          }}
                        >
                          Blok
                        </Button>
                      )}
                    </div>
                    <Reorder.Group axis="y" values={k.blocks} onReorder={(v) => bolehSunting && ubahBlok(() => v)} className="flex flex-col gap-1.5">
                      {k.blocks.map((b) => (
                        <Reorder.Item key={b.id} value={b} dragListener={bolehSunting} whileDrag={{ scale: 1.02, boxShadow: 'var(--shadow-pop)' }} className="rounded-xl">
                          <button
                            onClick={() => {
                              setPilih(b.id)
                              setMode('blok')
                              setSunting(null)
                            }}
                            className={cn('flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors', pilih === b.id && mode === 'blok' ? 'border-accent bg-accent-soft/60' : 'border-transparent hover:bg-surface-2')}
                          >
                            {bolehSunting && <GripVertical className="size-4 shrink-0 cursor-grab text-ink-3" aria-hidden />}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-semibold">{b.title}</span>
                              <span className="block text-[11px] text-ink-3">{b.category}</span>
                            </span>
                          </button>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                )}

                {tab === 'copilot' && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-ink-2">Tambahkan bagian baru yang disesuaikan dengan isi modul ini.</p>
                    <Select label="Jenis bagian" value={genJenis} onChange={(e) => setGenJenis(e.target.value)}>
                      {GENERATOR.map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </Select>
                    <Textarea label="Instruksi tambahan (opsional)" value={genInstruksi} onChange={(e) => setGenInstruksi(e.target.value)} placeholder="Mis. 10 soal pilihan ganda berbasis kasus di lingkungan sekolah" />
                    <Button varian="primary" ikon={<Sparkles />} memuat={memuatAI === 'blok'} onClick={copilot} disabled={!bolehSunting}>
                      Buat dengan AI
                    </Button>
                  </div>
                )}

                {tab === 'audit' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 rounded-2xl bg-surface-2 p-4">
                      <Cincin nilai={audit.score} maks={100} ukuran={76} label="Skor kualitas" />
                      <div>
                        <p className="text-sm font-bold">Skor kualitas</p>
                        <p className="text-xs text-ink-3">{k.audit?.scores ? 'Audit AI' : 'Pemeriksaan otomatis lokal'}</p>
                      </div>
                    </div>
                    {audit.scores && (
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(audit.scores).map(([n, v]) => (
                          <div key={n} className="rounded-xl border border-line p-2 text-center">
                            <p className="text-[10.5px] text-ink-3 capitalize">{n}</p>
                            <p className="font-display text-lg font-semibold">{v}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <ul className="flex flex-col gap-1">
                      {Object.entries(audit.checklist ?? {}).map(([n, v]) => (
                        <li key={n} className={cn('flex items-center gap-2 text-sm', !v && 'text-ink-3')}>
                          <span className={cn('grid size-5 place-items-center rounded-full', v ? 'bg-success text-white' : 'bg-surface-3')}>{v && <Check className="size-3" />}</span>
                          {LABEL_CHECK[n] ?? n}
                        </li>
                      ))}
                    </ul>
                    {(audit.warnings?.length ?? 0) > 0 && (
                      <div className="rounded-2xl bg-warning-soft p-3">
                        <p className="mb-1.5 text-sm font-bold text-warning">Temuan</p>
                        <ul className="flex list-disc flex-col gap-1 pl-4 text-[13px]">
                          {audit.warnings!.map((w, i) => (
                            <li key={i}>{w.message}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(audit.recommendations?.length ?? 0) > 0 && (
                      <div className="rounded-2xl bg-info-soft p-3">
                        <p className="mb-1.5 text-sm font-bold text-info">Rekomendasi</p>
                        <ul className="flex list-disc flex-col gap-1 pl-4 text-[13px]">
                          {audit.recommendations!.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <Button varian="primary" ikon={<ShieldCheck />} memuat={memuatAI === 'audit'} onClick={auditAI}>
                        Audit dengan AI
                      </Button>
                      <Button varian="outline" ikon={<Wand2 />} onClick={perbaikiIstilah} disabled={!bolehSunting}>
                        Perbarui istilah regulasi
                      </Button>
                    </div>
                    <details className="text-xs text-ink-3">
                      <summary className="font-semibold">Daftar istilah yang diperiksa</summary>
                      <ul className="mt-2 flex flex-col gap-1">
                        {REGULATORY_GLOSSARY.filter((g) => g.oldTerm[0] === g.oldTerm[0].toUpperCase()).map((g) => (
                          <li key={g.oldTerm}>
                            {g.oldTerm} → <strong>{g.newTerm}</strong>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                )}

                {tab === 'desain' && (
                  <div className="flex flex-col gap-3">
                    <Select label="Tema dokumen" value={k.design.theme} onChange={(e) => setDesain({ theme: e.target.value as DocumentDesign['theme'] })}>
                      {TEMA_DOKUMEN.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nama}
                        </option>
                      ))}
                    </Select>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-2">
                        Warna utama
                        <input type="color" value={k.design.primaryColor} onChange={(e) => setDesain({ primaryColor: e.target.value })} className="h-10 w-full rounded-lg border border-line" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-2">
                        Warna kedua
                        <input type="color" value={k.design.secondaryColor} onChange={(e) => setDesain({ secondaryColor: e.target.value })} className="h-10 w-full rounded-lg border border-line" />
                      </label>
                    </div>
                    <Select label="Huruf" value={k.design.fontFamily} onChange={(e) => setDesain({ fontFamily: e.target.value })}>
                      <option value="sans-serif">Sans modern</option>
                      <option value="serif">Serif formal</option>
                      <option value="mono">Monospace</option>
                    </Select>
                    <Select label="Margin" value={k.design.marginSize} onChange={(e) => setDesain({ marginSize: e.target.value as DocumentDesign['marginSize'] })}>
                      <option value="normal">Normal (2 cm)</option>
                      <option value="narrow">Sempit (1,2 cm)</option>
                      <option value="wide">Lebar (3,5 cm)</option>
                    </Select>
                    <Input label="Teks kepala halaman" value={k.design.headerText} onChange={(e) => setDesain({ headerText: e.target.value })} />
                    <Input label="Teks kaki halaman" value={k.design.footerText} onChange={(e) => setDesain({ footerText: e.target.value })} />
                    <Switch checked={k.design.showCover} onChange={(v) => setDesain({ showCover: v })} label="Halaman sampul" />
                    <Switch checked={k.design.useIcons} onChange={(v) => setDesain({ useIcons: v })} label="Ikon di judul blok" />
                    <Switch checked={k.design.showPageNumbers} onChange={(v) => setDesain({ showPageNumbers: v })} label="Nomor halaman" />
                    <Button
                      ukuran="sm"
                      varian="ghost"
                      onClick={() => {
                        setPrefs({ apma: { ...prefs.apma, design: k.design as unknown as Record<string, unknown> } })
                        toast('Desain dijadikan bawaan modul baru')
                      }}
                    >
                      Jadikan bawaan
                    </Button>
                  </div>
                )}

                {tab === 'profil' && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-bold">Kop sekolah</p>
                    <Input label="Nama sekolah" value={k.school.namaSekolah} onChange={(e) => setSekolah({ namaSekolah: e.target.value })} />
                    <Input label="Alamat" value={k.school.alamat} onChange={(e) => setSekolah({ alamat: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="NPSN" value={k.school.npsn} onChange={(e) => setSekolah({ npsn: e.target.value })} />
                      <Input label="NSS" value={k.school.nss} onChange={(e) => setSekolah({ nss: e.target.value })} />
                    </div>
                    <Input label="Kepala sekolah" value={k.school.kepalaSekolah} onChange={(e) => setSekolah({ kepalaSekolah: e.target.value })} />
                    <Input label="Nama guru" value={k.school.namaGuru} onChange={(e) => setSekolah({ namaGuru: e.target.value })} />
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line-2 p-3 text-sm font-semibold hover:border-accent">
                      {k.school.logoUrl ? <img src={k.school.logoUrl} alt="Logo sekolah" width={40} height={40} className="size-10 object-contain" /> : <School className="size-5 text-ink-3" />}
                      {k.school.logoUrl ? 'Ganti logo' : 'Unggah logo sekolah'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (!f) return
                          if (f.size > 400 * 1024) return toast('Logo maksimal 400 KB', { nada: 'galat' })
                          const r = new FileReader()
                          r.onload = () => setSekolah({ logoUrl: String(r.result) })
                          r.readAsDataURL(f)
                        }}
                      />
                    </label>
                    <Button
                      ukuran="sm"
                      varian="ghost"
                      onClick={() => {
                        const { logoUrl: _l, ...s } = k.school
                        void _l
                        setPrefs({ apma: { ...prefs.apma, school: s as unknown as Record<string, string> } })
                        toast('Profil sekolah disimpan sebagai bawaan')
                      }}
                    >
                      Simpan sebagai bawaan
                    </Button>

                    <div className="mt-3 border-t border-line pt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-sm font-bold">
                          <History className="size-4" /> Riwayat versi
                        </p>
                        <Button ukuran="sm" varian="soft" onClick={simpanVersi} disabled={!bolehSunting}>
                          Simpan versi
                        </Button>
                      </div>
                      <ul className="flex flex-col gap-1">
                        {k.versions.map((v) => (
                          <li key={v.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2">
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-semibold">{v.label}</span>
                              <span className="block text-[11px] text-ink-3">
                                {waktuRelatif(v.waktu)} · {v.blocks.length} blok
                              </span>
                            </span>
                            <Button
                              ukuran="sm"
                              varian="ghost"
                              disabled={!bolehSunting}
                              onClick={() => {
                                ubahBlok(() => v.blocks)
                                toast(`Dipulihkan ke ${v.label}`, { aksi: { label: 'Urungkan', jalankan: batal } })
                              }}
                            >
                              Pulihkan
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </aside>

        {/* Area utama */}
        <section className="min-w-0">
          {perluDilengkapi && bolehSunting && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-warning/40 bg-warning-soft px-4 py-3 text-sm"
            >
              <span className="min-w-0 flex-1">
                <strong>Modul belum lengkap.</strong>{' '}
                {kelengkapan.terpotong && 'Bagian terakhir berhenti di tengah kalimat. '}
                {kelengkapan.hilang.length > 0 && `${kelengkapan.hilang.length} bagian baku belum ada: ${kelengkapan.hilang.map((h) => h.judul.replace(/^Lampiran d+ - /, '')).join(', ')}.`}
              </span>
              <Button ukuran="sm" varian="primary" ikon={<Sparkles />} memuat={memuatAI === 'lengkapi'} onClick={lengkapi}>
                Lengkapi dengan AI
              </Button>
            </motion.div>
          )}
          <div className="mb-3 flex items-center justify-between gap-2">
            <Segmented
              label="Tampilan"
              nilai={mode}
              onChange={(v) => {
                setMode(v)
                setSunting(null)
              }}
              pilihan={[
                { id: 'dokumen', label: 'Dokumen', ikon: <Eye /> },
                { id: 'blok', label: 'Blok terpilih', ikon: <Pencil /> },
              ]}
            />
            {mode === 'blok' && blok && bolehSunting && (
              <div className="flex gap-1.5">
                {sunting === null ? (
                  <Button ukuran="sm" varian="soft" ikon={<Pencil />} onClick={() => setSunting(blok.content)}>
                    Sunting
                  </Button>
                ) : (
                  <>
                    <Button ukuran="sm" varian="ghost" onClick={() => setSunting(null)}>
                      Batal
                    </Button>
                    <Button
                      ukuran="sm"
                      varian="primary"
                      ikon={<Check />}
                      onClick={() => {
                        ubahBlok((bs) => bs.map((b) => (b.id === blok.id ? { ...b, content: sunting } : b)))
                        setSunting(null)
                      }}
                    >
                      Terapkan
                    </Button>
                  </>
                )}
                <IconButton label="Hapus blok" ukuran="sm" onClick={() => setHapusBlok(blok)} className="hover:!text-danger">
                  <Trash2 />
                </IconButton>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {mode === 'dokumen' ? (
              <motion.article key="dok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border border-line bg-white p-6 text-[#1e293b] shadow-[var(--shadow-soft)] sm:p-10" style={{ ['--ink' as string]: '#1e293b', ['--line' as string]: '#e2e8f0', ['--surface-2' as string]: '#f1f5f9' }}>
                <header className="mb-8 border-b-2 pb-4 text-center" style={{ borderColor: k.design.primaryColor }}>
                  <p className="text-xs font-bold tracking-[0.2em]" style={{ color: k.design.secondaryColor }}>
                    MODUL AJAR
                  </p>
                  <h1 className="mt-1 font-display text-2xl font-semibold" style={{ color: k.design.primaryColor }}>
                    {k.form.materi}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {k.form.mapel} · {k.form.jenjang} · Fase {k.form.fase} · Kelas {k.form.kelas}
                  </p>
                </header>
                {k.blocks.map((b) => (
                  <section key={b.id} className="group relative mb-6">
                    <h2 className="mb-2 border-b pb-1 font-display text-lg font-semibold" style={{ color: k.design.primaryColor, borderColor: `${k.design.primaryColor}55` }}>
                      {b.title}
                    </h2>
                    <Markdown md={b.content} />
                    {bolehSunting && (
                      <button
                        onClick={() => {
                          setPilih(b.id)
                          setMode('blok')
                          setSunting(b.content)
                        }}
                        className="absolute top-0 right-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        Sunting
                      </button>
                    )}
                  </section>
                ))}
              </motion.article>
            ) : blok ? (
              <motion.div key={blok.id + String(sunting !== null)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-5 sm:p-6">
                {sunting !== null ? (
                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="flex flex-col gap-3">
                      <Input
                        label="Judul blok"
                        value={blok.title}
                        onChange={(e) => {
                          const v = e.target.value
                          setK((x) => x && { ...x, blocks: x.blocks.map((b) => (b.id === blok.id ? { ...b, title: v } : b)) })
                        }}
                      />
                      <Select
                        label="Kategori"
                        value={blok.category}
                        onChange={(e) => {
                          const v = e.target.value as ModuleBlock['category']
                          setK((x) => x && { ...x, blocks: x.blocks.map((b) => (b.id === blok.id ? { ...b, category: v } : b)) })
                        }}
                      >
                        <option>Informasi Umum</option>
                        <option>Komponen Inti</option>
                        <option>Lampiran</option>
                      </Select>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-semibold text-ink-2">Isi (Markdown)</span>
                        <textarea value={sunting} onChange={(e) => setSunting(e.target.value)} className="field min-h-[50vh] font-mono text-[13px] leading-relaxed" autoFocus />
                      </label>
                    </div>
                    <div>
                      <p className="eyebrow mb-2">Pratinjau</p>
                      <div className="max-h-[70vh] overflow-auto rounded-xl border border-line p-4">
                        <Markdown md={sunting} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center gap-2">
                      <Badge nada="aksen">{blok.category}</Badge>
                    </div>
                    <h2 className="mb-3 font-display text-2xl font-semibold">{blok.title}</h2>
                    <Markdown md={blok.content} />
                  </>
                )}
              </motion.div>
            ) : (
              <p className="text-ink-3">Pilih blok di panel Struktur.</p>
            )}
          </AnimatePresence>
        </section>
      </div>

      <Dialog buka={ekspor} tutup={() => setEkspor(false)} judul="Ekspor modul ajar" lebar="sm">
        <div className="flex flex-col gap-2">
          {[
            { l: 'Cetak / simpan PDF', s: 'Tata letak A4 siap cetak', ikon: <Printer />, f: cetakDok },
            { l: 'Microsoft Word (.doc)', s: 'Bisa disunting di Word & Google Docs', ikon: <FileText />, f: () => eksporWord(susunDokumen(k.blocks, k.design, k.school, k.form, true), k.form) },
            { l: 'Halaman web (.html)', s: 'Untuk LMS atau dibagikan', ikon: <FileCode2 />, f: () => eksporHtml(html(), k.form) },
            { l: 'Markdown (.md)', s: 'Teks polos berformat', ikon: <FileText />, f: () => eksporMarkdown(k.blocks, k.form) },
          ].map((o) => (
            <motion.button
              key={o.l}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                o.f()
                catat('apma', 'unduh')
                setEkspor(false)
              }}
              className="flex items-center gap-3 rounded-2xl border border-line p-3.5 text-left transition-colors hover:border-accent hover:bg-accent-soft/40"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-surface-2 text-accent-text [&>svg]:size-5">{o.ikon}</span>
              <span>
                <span className="block text-sm font-bold">{o.l}</span>
                <span className="block text-xs text-ink-3">{o.s}</span>
              </span>
            </motion.button>
          ))}
        </div>
      </Dialog>

      <Dialog
        bahaya
        buka={!!hapusBlok}
        tutup={() => setHapusBlok(null)}
        judul="Hapus blok?"
        deskripsi={hapusBlok?.title}
        lebar="sm"
        kaki={
          <>
            <Button varian="ghost" onClick={() => setHapusBlok(null)}>
              Batal
            </Button>
            <Button
              varian="danger"
              onClick={() => {
                const idh = hapusBlok!.id
                ubahBlok((bs) => bs.filter((b) => b.id !== idh))
                setPilih(k.blocks.find((b) => b.id !== idh)?.id ?? null)
                setHapusBlok(null)
                toast('Blok dihapus', { aksi: { label: 'Urungkan', jalankan: batal } })
              }}
            >
              Hapus
            </Button>
          </>
        }
      />
    </div>
  )
}
