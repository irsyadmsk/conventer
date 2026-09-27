import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, FileText, GraduationCap, Loader2, RotateCcw, Sparkles, Upload, X } from 'lucide-react'
import { usePrefs } from '@/lib/prefs'
import { useItemAksi } from '@/lib/items'
import { useFamily } from '@/lib/family'
import { panggilAI } from '@/lib/ai'
import { pesanGalat } from '@/lib/supabase'
import { catat } from '@/lib/activity'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/ui/Layout'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { Switch } from '@/components/ui/Controls'
import { useToast } from '@/components/ui/Toast'
import { FASE_DESCRIPTIONS, FASE_MAPPING, JENJANG_OPTIONS, KBC_DATA, type AppFormData, type SchoolProfile } from './types'
import { assemblePrompt, parseGeneratedBlocks, replaceRegulatoryTerms } from './utils'
import { bacaBerkas } from './berkas'
import { KURIKULUM, MODEL, PROFIL_LULUSAN, desainBawaan, formBawaan, hitungDurasi, sekolahBawaan, type KontenModul } from './konstanta'
import { auditLokal } from './model'

const KUNCI_DRAF = 'ruang:apma:draf'
const TAHAP = ['Membaca identitas & capaian pembelajaran', 'Merumuskan tujuan & KKTP', 'Menyusun langkah pembelajaran tiap pertemuan', 'Membuat LKPD, rubrik & soal HOTS', 'Menyusun pengayaan, remedial & glosarium', 'Memeriksa nomenklatur terbaru']

function Cek({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-sm transition-colors', checked ? 'border-accent bg-accent-soft/60' : 'border-line hover:border-line-2')}>
      <input type="checkbox" checked={checked} onChange={onChange} className="mt-0.5 size-4 shrink-0" />
      <span className="font-medium">{label}</span>
    </label>
  )
}

export default function Wizard() {
  const nav = useNavigate()
  const toast = useToast()
  const { prefs } = usePrefs()
  const { keluarga } = useFamily()
  const { simpan } = useItemAksi()
  const school = { ...sekolahBawaan, ...(prefs.apma?.school ?? {}) } as SchoolProfile

  const [form, setForm] = useState<AppFormData>(() => {
    try {
      const d = localStorage.getItem(KUNCI_DRAF)
      if (d) return { ...formBawaan(school), ...JSON.parse(d), uploadedText: null, uploadedImage: null }
    } catch {
      /* abaikan */
    }
    return formBawaan(school)
  })
  const [langkah, setLangkah] = useState(1)
  const [galat, setGalat] = useState<Record<string, string>>({})
  const [berkas, setBerkas] = useState<{ nama: string; status: 'memuat' | 'ok' | 'galat' } | null>(null)
  const [bagikan, setBagikan] = useState(false)
  const [proses, setProses] = useState<{ tahap: number; galat?: string } | null>(null)
  const atas = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const { uploadedText: _t, uploadedImage: _i, ...simpanDraf } = form
      void _t
      void _i
      localStorage.setItem(KUNCI_DRAF, JSON.stringify(simpanDraf))
    } catch {
      /* penuh */
    }
  }, [form])

  // Jangan tutup tab saat AI sedang menyusun.
  useEffect(() => {
    if (!proses || proses.galat) return
    const f = (e: BeforeUnloadEvent) => e.preventDefault()
    addEventListener('beforeunload', f)
    return () => removeEventListener('beforeunload', f)
  }, [proses])

  const set = <K extends keyof AppFormData>(k: K, v: AppFormData[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (galat[k as string]) setGalat((g) => ({ ...g, [k]: '' }))
  }
  const tog = (k: 'topikPancaCinta' | 'materiInsersi' | 'profilLulusan', v: string) =>
    setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }))

  function validasi(n: number) {
    const g: Record<string, string> = {}
    const wajib = (k: keyof AppFormData, pesan: string) => {
      if (!String(form[k] ?? '').trim()) g[k] = pesan
    }
    if (n === 1) {
      wajib('namaGuru', 'Nama guru wajib diisi.')
      wajib('institusi', 'Nama sekolah wajib diisi.')
      wajib('jenjang', 'Pilih jenjang.')
      wajib('fase', 'Pilih fase.')
      wajib('kelas', 'Kelas wajib diisi.')
      wajib('mapel', 'Mata pelajaran wajib diisi.')
    } else {
      wajib('materi', 'Materi pokok wajib diisi.')
      wajib('lamaWaktu', 'Durasi wajib diisi.')
      if (!form.profilLulusan.length) g.profilLulusan = 'Pilih minimal satu dimensi.'
      if (form.kurikulum === 'kbc') {
        if (!form.topikPancaCinta.length) g.topikPancaCinta = 'Pilih minimal satu topik Panca Cinta.'
        if (!form.materiInsersi.length) g.materiInsersi = 'Pilih minimal satu materi insersi.'
      }
    }
    setGalat(g)
    const pertama = Object.keys(g)[0]
    if (pertama) document.getElementById(`apma-${pertama}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return !pertama
  }

  async function buat() {
    if (!validasi(2)) return
    const f = hitungDurasi({ ...form, schoolProfile: school, documentDesign: desainBawaan })
    setProses({ tahap: 0 })
    const timer = setInterval(() => setProses((p) => (p && !p.galat ? { tahap: Math.min(p.tahap + 1, TAHAP.length - 1) } : p)), 9000)
    try {
      const h = await panggilAI('apma_modul', { prompt: assemblePrompt(f), gambar: f.uploadedImage ?? undefined })
      const blocks = parseGeneratedBlocks(replaceRegulatoryTerms(h.teks ?? '')).map((b) => ({ ...b, content: replaceRegulatoryTerms(b.content) }))
      if (!blocks.length) throw new Error('Jawaban AI tidak dapat diurai. Coba lagi.')
      const { uploadedText: _t, uploadedImage: _i, schoolProfile: _s, documentDesign: _d, ...formBersih } = f
      void _t
      void _i
      void _s
      void _d
      const konten: KontenModul = {
        form: formBersih as AppFormData,
        blocks,
        design: { ...desainBawaan, ...((prefs.apma?.design as object) ?? {}) },
        school,
        versions: [{ id: `v-${Date.now()}`, waktu: new Date().toISOString(), label: 'Hasil AI pertama', blocks }],
        audit: auditLokal(blocks),
      }
      const it = await simpan({ kind: 'apma', tool: 'apma', title: `${f.mapel} — ${f.materi}`.slice(0, 200), content: konten, bagikan })
      catat('apma', 'apma_modul', (h.teks ?? '').length)
      localStorage.removeItem(KUNCI_DRAF)
      if (h.terpotong) toast('Modul mungkin terpotong', { nada: 'info', isi: 'Periksa lampiran terakhir dan lengkapi dengan Copilot.' })
      nav(`/modul-ajar/${it.id}`, { replace: true })
    } catch (e) {
      setProses((p) => ({ tahap: p?.tahap ?? 0, galat: pesanGalat(e) }))
    } finally {
      clearInterval(timer)
    }
  }

  if (proses)
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-lg place-items-center">
        <div className="w-full text-center">
          <motion.div
            animate={proses.galat ? { rotate: 0 } : { rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2.4, repeat: proses.galat ? 0 : Infinity }}
            className={cn('mx-auto grid size-20 place-items-center rounded-3xl', proses.galat ? 'bg-danger-soft text-danger' : 'bg-accent-soft text-accent-text')}
          >
            {proses.galat ? <X className="size-9" /> : <GraduationCap className="size-9" />}
          </motion.div>
          <h1 className="mt-6 font-display text-2xl font-semibold">{proses.galat ? 'Belum berhasil' : 'AI sedang menyusun modul ajar'}</h1>
          <p className="mt-2 text-ink-2">{proses.galat ?? `${form.mapel} · ${form.materi}. Biasanya 1–2 menit — jangan tutup halaman ini.`}</p>
          {!proses.galat && (
            <ol className="mt-8 flex flex-col gap-2 text-left">
              {TAHAP.map((t, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: i <= proses.tahap ? 1 : 0.4, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl bg-surface-2 px-4 py-2.5 text-sm"
                >
                  {i < proses.tahap ? <Check className="size-4 text-success" /> : i === proses.tahap ? <Loader2 className="size-4 animate-spin text-accent-text" /> : <span className="size-4 rounded-full border-2 border-line-2" />}
                  {t}
                </motion.li>
              ))}
            </ol>
          )}
          {proses.galat && (
            <div className="mt-6 flex justify-center gap-2">
              <Button varian="ghost" ikon={<ArrowLeft />} onClick={() => setProses(null)}>
                Ubah isian
              </Button>
              <Button varian="primary" ikon={<RotateCcw />} onClick={buat}>
                Coba lagi
              </Button>
            </div>
          )}
        </div>
      </div>
    )

  const fase = FASE_MAPPING[form.jenjang] ?? []
  const jenjang = JENJANG_OPTIONS[(form.kurikulum as keyof typeof JENJANG_OPTIONS) || 'kumer'] ?? JENJANG_OPTIONS.kumer

  return (
    <div ref={atas}>
      <PageHeader eyebrow="Modul Ajar" judul="Modul ajar baru" deskripsi="Dua langkah singkat. Isian tersimpan otomatis sebagai draf di perangkat ini." ikon={<GraduationCap />} />

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-3">
        {['Identitas', 'Rencana pembelajaran'].map((l, i) => {
          const n = i + 1
          const aktif = langkah === n
          const selesai = langkah > n
          return (
            <div key={l} className="flex flex-1 items-center gap-3">
              <motion.span
                animate={{ scale: aktif ? 1.08 : 1 }}
                className={cn('grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold', selesai ? 'bg-success text-white' : aktif ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-3')}
              >
                {selesai ? <Check className="size-4" /> : n}
              </motion.span>
              <span className={cn('text-sm font-semibold', aktif ? 'text-ink' : 'text-ink-3')}>{l}</span>
              {i === 0 && (
                <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-line">
                  <motion.div className="h-full w-full origin-left bg-accent" initial={false} animate={{ scaleX: langkah > 1 ? 1 : 0 }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {langkah === 1 ? (
          <motion.div key="1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="card grid gap-4 p-5 sm:p-6 md:grid-cols-2">
            <Input id="apma-namaGuru" label="Nama guru penyusun" value={form.namaGuru} onChange={(e) => set('namaGuru', e.target.value)} galat={galat.namaGuru} />
            <Input id="apma-institusi" label="Sekolah / institusi" value={form.institusi} onChange={(e) => set('institusi', e.target.value)} galat={galat.institusi} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Tahun ajaran" value={form.tahun} onChange={(e) => set('tahun', e.target.value)} />
              <Select label="Semester" value={form.semester} onChange={(e) => set('semester', e.target.value)}>
                <option>Ganjil</option>
                <option>Genap</option>
              </Select>
            </div>
            <Select
              label="Landasan kurikulum"
              value={form.kurikulum}
              onChange={(e) => {
                set('kurikulum', e.target.value)
                set('jenjang', '')
                set('fase', '')
              }}
            >
              {KURIKULUM.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </Select>
            {(form.kurikulum === 'khas' || form.kurikulum === 'yayasan') && (
              <Input className="md:col-span-2" label="Nama kurikulum khusus" value={form.customKurikulumName ?? ''} onChange={(e) => set('customKurikulumName', e.target.value)} placeholder="Mis. Kurikulum Pesantren Al-…" />
            )}
            <Select id="apma-jenjang" label="Jenjang" value={form.jenjang} galat={galat.jenjang} onChange={(e) => { set('jenjang', e.target.value); set('fase', FASE_MAPPING[e.target.value]?.length === 1 ? FASE_MAPPING[e.target.value][0] : '') }}>
              <option value="" disabled>
                Pilih jenjang
              </option>
              {jenjang.map((j) => (
                <option key={j}>{j}</option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Select id="apma-fase" label="Fase" value={form.fase} galat={galat.fase} onChange={(e) => set('fase', e.target.value)} disabled={!fase.length}>
                <option value="" disabled>
                  Pilih
                </option>
                {fase.map((f) => (
                  <option key={f} value={f}>
                    {FASE_DESCRIPTIONS[f] ?? f}
                  </option>
                ))}
              </Select>
              <Input id="apma-kelas" label="Kelas" value={form.kelas} onChange={(e) => set('kelas', e.target.value)} galat={galat.kelas} placeholder="Mis. X" />
            </div>
            <Input id="apma-mapel" label="Mata pelajaran" value={form.mapel} onChange={(e) => set('mapel', e.target.value)} galat={galat.mapel} placeholder="Mis. Sosiologi" />
            <Input label="Elemen (opsional)" value={form.elemen} onChange={(e) => set('elemen', e.target.value)} placeholder="Mis. Pemahaman konsep" />
            <Textarea className="md:col-span-2" label="Capaian Pembelajaran (opsional)" value={form.cp} onChange={(e) => set('cp', e.target.value)} bantuan="Kosongkan agar AI menjabarkan CP sesuai fase." />
          </motion.div>
        ) : (
          <motion.div key="2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="flex flex-col gap-4">
            <div className="card grid gap-4 p-5 sm:p-6 md:grid-cols-2">
              <Input id="apma-materi" className="md:col-span-2" label="Materi pokok / judul pembelajaran" value={form.materi} onChange={(e) => set('materi', e.target.value)} galat={galat.materi} placeholder="Mis. Interaksi sosial dan dinamika kelompok" />
              <div className="grid grid-cols-2 gap-3">
                <Select label="Jumlah pertemuan" value={form.jumlahPertemuan} onChange={(e) => set('jumlahPertemuan', Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} pertemuan
                    </option>
                  ))}
                </Select>
                <Input id="apma-lamaWaktu" label="Durasi per pertemuan" value={form.lamaWaktu} onChange={(e) => set('lamaWaktu', e.target.value)} galat={galat.lamaWaktu} bantuan="Mis. 2 x 45 menit" />
              </div>
              <Select label="Model pembelajaran" value={form.model} onChange={(e) => set('model', e.target.value)}>
                {MODEL.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
              <Input label="Karakteristik murid" value={form.karakteristikMurid} onChange={(e) => set('karakteristikMurid', e.target.value)} />
              <Input label="Kesiapan belajar murid" value={form.kesiapanBelajar} onChange={(e) => set('kesiapanBelajar', e.target.value)} />
              <Input label="Metode" value={form.metode} onChange={(e) => set('metode', e.target.value)} />
              <Input label="Media" value={form.media} onChange={(e) => set('media', e.target.value)} />
              <Input label="Sarana & prasarana" value={form.saranaPrasarana} onChange={(e) => set('saranaPrasarana', e.target.value)} />
              <Input label="Sumber belajar" value={form.sumberBelajar} onChange={(e) => set('sumberBelajar', e.target.value)} />
            </div>

            <div className="card p-5 sm:p-6">
              <h2 className="mb-1 font-bold" id="apma-profilLulusan">
                Dimensi profil lulusan
              </h2>
              <p className="mb-3 text-sm text-ink-3">Dimensi karakter yang ingin diasah (pilih minimal satu).</p>
              {galat.profilLulusan && <p className="mb-2 text-sm font-medium text-danger">{galat.profilLulusan}</p>}
              <div className="grid gap-2 sm:grid-cols-2">
                {PROFIL_LULUSAN.map((d) => (
                  <Cek key={d} label={d.startsWith('Keimanan') ? 'Keimanan, ketakwaan & akhlak mulia' : d} checked={form.profilLulusan.includes(d)} onChange={() => tog('profilLulusan', d)} />
                ))}
              </div>
            </div>

            {form.kurikulum === 'kbc' && (
              <div className="card p-5 sm:p-6">
                <h2 className="mb-3 font-bold" id="apma-topikPancaCinta">
                  Integrasi Kurikulum Berbasis Cinta
                </h2>
                {galat.topikPancaCinta && <p className="mb-2 text-sm font-medium text-danger">{galat.topikPancaCinta}</p>}
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.keys(KBC_DATA).map((k) => (
                    <Cek key={k} label={k} checked={form.topikPancaCinta.includes(k)} onChange={() => tog('topikPancaCinta', k)} />
                  ))}
                </div>
                {form.topikPancaCinta.length > 0 && (
                  <div className="mt-4" id="apma-materiInsersi">
                    <p className="eyebrow mb-2">Materi insersi</p>
                    {galat.materiInsersi && <p className="mb-2 text-sm font-medium text-danger">{galat.materiInsersi}</p>}
                    <div className="flex max-h-72 flex-col gap-3 overflow-y-auto rounded-xl bg-surface-2 p-3">
                      {form.topikPancaCinta.map((t) => (
                        <div key={t}>
                          <p className="mb-1.5 text-xs font-bold text-accent-text">{t}</p>
                          <div className="flex flex-col gap-1.5">
                            {KBC_DATA[t].map((m) => (
                              <Cek key={m} label={m} checked={form.materiInsersi.includes(m)} onChange={() => tog('materiInsersi', m)} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="card grid gap-4 p-5 sm:p-6 md:grid-cols-2">
              <div>
                <p className="mb-1 font-bold">Rujukan buku (opsional)</p>
                <p className="mb-3 text-sm text-ink-3">PDF/DOCX dibaca di perangkat Anda; foto halaman buku dikirim ke AI.</p>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-line-2 p-4 transition-colors hover:border-accent hover:bg-accent-soft/40">
                  {berkas?.status === 'memuat' ? <Loader2 className="size-5 animate-spin text-accent-text" /> : berkas?.status === 'ok' ? <FileText className="size-5 text-success" /> : <Upload className="size-5 text-ink-3" />}
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{berkas ? berkas.nama : 'Pilih PDF, DOCX, JPG, atau PNG'}</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".pdf,.docx,.jpg,.jpeg,.png,.webp"
                    onChange={async (e) => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      if (f.size > 25 * 1024 * 1024) return toast('Berkas terlalu besar', { nada: 'galat', isi: 'Maksimal 25 MB.' })
                      setBerkas({ nama: f.name, status: 'memuat' })
                      try {
                        const r = await bacaBerkas(f)
                        setForm((x) => ({ ...x, uploadedText: r.text, uploadedImage: r.image }))
                        setBerkas({ nama: f.name, status: 'ok' })
                      } catch (err) {
                        setBerkas({ nama: f.name, status: 'galat' })
                        toast('Gagal membaca berkas', { nada: 'galat', isi: pesanGalat(err) })
                      }
                    }}
                  />
                </label>
              </div>
              <div className="flex flex-col justify-center gap-4">
                <Switch checked={form.isDaring} onChange={(v) => set('isDaring', v)} label="Mode daring / PJJ" keterangan="Kegiatan dirancang untuk pembelajaran jarak jauh." />
                {keluarga && <Switch checked={bagikan} onChange={setBagikan} label={`Bagikan ke keluarga ${keluarga.name}`} keterangan="Anggota bisa membuka & menyunting." />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky bottom-20 z-10 mt-6 flex justify-between gap-3 rounded-2xl border border-line bg-surface/90 p-3 backdrop-blur-xl lg:bottom-4">
        {langkah === 1 ? (
          <Button varian="ghost" ikon={<ArrowLeft />} onClick={() => nav('/modul-ajar')}>
            Batal
          </Button>
        ) : (
          <Button varian="ghost" ikon={<ArrowLeft />} onClick={() => setLangkah(1)}>
            Kembali
          </Button>
        )}
        {langkah === 1 ? (
          <Button
            varian="primary"
            ikonKanan={<ArrowRight />}
            onClick={() => {
              if (validasi(1)) {
                setLangkah(2)
                atas.current?.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            Lanjut
          </Button>
        ) : (
          <Button varian="primary" ikon={<Sparkles />} onClick={buat}>
            Susun dengan AI
          </Button>
        )}
      </div>
    </div>
  )
}
