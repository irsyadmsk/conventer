import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  CalendarRange,
  Clock3,
  FileDown,
  FileSpreadsheet,
  Flame,
  Lightbulb,
  Minus,
  Printer,
  RefreshCw,
  Users,
} from 'lucide-react'
import { alatById, namaAlat } from '@/tools'
import { supabase, pesanGalat } from '@/lib/supabase'
import { useFamily } from '@/lib/family'
import { usePrefs } from '@/lib/prefs'
import { panggilAI } from '@/lib/ai'
import { awalHari, buatWawasan, deretHarian, hitungBeruntun, menitDihemat, tambahHari, useRingkasan, type Cakupan, type Ringkasan } from '@/lib/wawasan'
import { angka, cn, tanggalPendek, unduh } from '@/lib/utils'
import { AngkaHidup, PageHeader, Panel } from '@/components/ui/Layout'
import { Badge, EmptyState, Segmented } from '@/components/ui/Controls'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { useToast } from '@/components/ui/Toast'
import { AreaChart, BarList, PetaJam } from '@/components/charts/Charts'

type Periode = '7' | '30' | '90' | 'bulan'
type Arsip = { id: string; scope: Cakupan; period_start: string; period_end: string; data: Ringkasan; summary: string | null; created_at: string }

function rentang(p: Periode) {
  const besok = tambahHari(awalHari(), 1)
  if (p === 'bulan') {
    const d = new Date()
    const awal = new Date(d.getFullYear(), d.getMonth(), 1)
    const hari = Math.round((besok.getTime() - awal.getTime()) / 86400000)
    return { dari: awal, sampai: besok, hari }
  }
  const n = Number(p)
  return { dari: tambahHari(besok, -n), sampai: besok, hari: n }
}

function Delta({ kini, lalu }: { kini: number; lalu: number | undefined }) {
  if (lalu === undefined) return null
  if (lalu === 0 && kini === 0) return <span className="text-xs text-ink-3">—</span>
  const p = lalu === 0 ? 100 : Math.round(((kini - lalu) / lalu) * 100)
  const I = p > 0 ? ArrowUpRight : p < 0 ? ArrowDownRight : Minus
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-bold', p > 0 ? 'text-success' : p < 0 ? 'text-danger' : 'text-ink-3')}>
      <I className="size-3.5" aria-hidden />
      {Math.abs(p)}%<span className="sr-only">{p >= 0 ? 'naik' : 'turun'} dibanding periode sebelumnya</span>
    </span>
  )
}

function keCsv(r: Ringkasan, judul: string) {
  const baris: string[][] = [['Laporan', judul], [], ['Metrik', 'Nilai'], ['Total aktivitas', String(r.total)], ['Hari aktif', String(r.active_days)], ['Karakter diproses', String(r.chars)], ['Item disimpan', String(r.items_created)], [], ['Alat', 'Aktivitas', 'Karakter']]
  r.by_tool.forEach((t) => baris.push([namaAlat(t.tool), String(t.n), String(t.chars ?? 0)]))
  baris.push([], ['Tanggal', 'Aktivitas'])
  r.by_day.forEach((d) => baris.push([d.day, String(d.n)]))
  if (r.by_member.length > 1) {
    baris.push([], ['Anggota', 'Aktivitas'])
    r.by_member.forEach((m) => baris.push([m.name, String(m.n)]))
  }
  return '﻿' + baris.map((b) => b.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\n')
}

function NarasiAI({ teks }: { teks: string }) {
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(teks, { async: false }) as string), [teks])
  return <div className="prose-ruang" dangerouslySetInnerHTML={{ __html: html }} />
}

export default function Laporan() {
  const { keluarga } = useFamily()
  const { prefs } = usePrefs()
  const toast = useToast()
  const [periode, setPeriode] = useState<Periode>('7')
  const [cakupan, setCakupan] = useState<Cakupan>('pribadi')
  const [narasi, setNarasi] = useState<string | null>(null)
  const [memuatAI, setMemuatAI] = useState(false)
  const [arsip, setArsip] = useState<Arsip[]>([])
  const [bukaArsip, setBukaArsip] = useState<Arsip | null>(null)

  const cak = cakupan === 'keluarga' && !keluarga ? 'pribadi' : cakupan
  const { dari, sampai, hari } = useMemo(() => rentang(periode), [periode])
  const lalu = useMemo(() => ({ dari: tambahHari(dari, -hari), sampai: dari }), [dari, hari])
  const { data, galat } = useRingkasan(dari, sampai, cak)
  const { data: dataLalu } = useRingkasan(lalu.dari, lalu.sampai, cak)

  const deret = useMemo(() => deretHarian(data, dari, hari), [data, dari, hari])
  const wawasan = useMemo(() => buatWawasan(data, dataLalu, cak, !!keluarga), [data, dataLalu, cak, keluarga])
  const judulPeriode = `${tanggalPendek(dari)} – ${tanggalPendek(tambahHari(sampai, -1))} ${sampai.getFullYear()}`

  useEffect(() => setNarasi(null), [periode, cak])

  // Laporan mingguan otomatis: pastikan minggu lalu sudah dibuat, lalu muat arsip.
  useEffect(() => {
    let batal = false
    ;(async () => {
      await supabase.rpc('studio_ensure_last_week_report')
      const { data: rows } = await supabase.from('studio_reports').select('*').order('period_start', { ascending: false }).limit(24)
      if (!batal) setArsip((rows as Arsip[]) ?? [])
    })()
    return () => {
      batal = true
    }
  }, [keluarga?.id])

  // Ringkasan AI otomatis untuk laporan mingguan terbaru (sekali per laporan).
  useEffect(() => {
    if (!prefs.weeklyAi) return
    const terbaru = arsip.find((a) => a.scope === 'pribadi' && !a.summary && a.data?.total > 0)
    if (!terbaru) return
    panggilAI('laporan', { ringkasan: terbaru.data, periode: `${terbaru.period_start} s.d. ${terbaru.period_end}`, cakupan: 'pribadi' })
      .then(async (h) => {
        if (!h.teks) return
        await supabase.from('studio_reports').update({ summary: h.teks }).eq('id', terbaru.id)
        setArsip((xs) => xs.map((x) => (x.id === terbaru.id ? { ...x, summary: h.teks! } : x)))
      })
      .catch(() => {})
  }, [arsip, prefs.weeklyAi])

  async function mintaNarasi() {
    if (!data) return
    setMemuatAI(true)
    try {
      const h = await panggilAI('laporan', { ringkasan: data, pembanding: dataLalu, periode: judulPeriode, cakupan: cak })
      setNarasi(h.teks ?? '')
    } catch (e) {
      toast('Ringkasan AI gagal', { nada: 'galat', isi: pesanGalat(e) })
    } finally {
      setMemuatAI(false)
    }
  }

  const kpi = [
    { l: 'Total aktivitas', v: data?.total ?? 0, lv: dataLalu?.total, ikon: BarChart3 },
    { l: 'Hari aktif', v: data?.active_days ?? 0, lv: dataLalu?.active_days, ikon: CalendarRange, akhir: ` / ${hari}` },
    { l: 'Menit dihemat', v: menitDihemat(data), lv: dataLalu ? menitDihemat(dataLalu) : undefined, ikon: Clock3, akhir: ' mnt' },
    { l: 'Beruntun', v: hitungBeruntun(data), lv: undefined, ikon: Flame, akhir: ' hari' },
  ]

  return (
    <div className="print:text-black">
      <PageHeader
        eyebrow="Ruang"
        judul="Laporan"
        deskripsi="Laporan cerdas yang terisi otomatis dari pemakaian Anda — tanpa menyimpan isi teks. Laporan mingguan dibuat setiap Senin dan dirangkum AI."
        ikon={<BarChart3 />}
        aksi={
          <div className="no-print flex flex-wrap gap-2">
            <Button ukuran="sm" varian="ghost" ikon={<Printer />} onClick={() => window.print()} disabled={!data}>
              Cetak / PDF
            </Button>
            <Button ukuran="sm" varian="ghost" ikon={<FileSpreadsheet />} onClick={() => data && unduh(`laporan-ruang-${cak}-${periode}.csv`, keCsv(data, judulPeriode), 'text/csv;charset=utf-8')} disabled={!data}>
              CSV
            </Button>
          </div>
        }
      />

      <div className="no-print mb-5 flex flex-wrap items-center gap-3">
        <Segmented
          label="Periode"
          nilai={periode}
          onChange={setPeriode}
          pilihan={[
            { id: '7', label: '7 hari' },
            { id: '30', label: '30 hari' },
            { id: 'bulan', label: 'Bulan ini' },
            { id: '90', label: '90 hari' },
          ]}
        />
        <Segmented
          label="Cakupan"
          nilai={cak}
          onChange={(v) => {
            if (v === 'keluarga' && !keluarga) return toast('Belum tergabung keluarga', { nada: 'info', isi: 'Buat atau gabung keluarga di menu Keluarga.' })
            setCakupan(v)
          }}
          pilihan={[
            { id: 'pribadi', label: 'Pribadi' },
            { id: 'keluarga', label: 'Keluarga', ikon: <Users /> },
          ]}
        />
        <span className="text-sm text-ink-3">{judulPeriode}</span>
      </div>

      {galat && (
        <p role="alert" className="mb-4 rounded-xl bg-danger-soft p-3 text-sm text-danger">
          Laporan belum bisa dimuat. Periksa koneksi, lalu muat ulang halaman. <span className="opacity-70">({pesanGalat(galat)})</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpi.map((k, i) => (
          <motion.div key={k.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-4">
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] font-semibold text-ink-3">{k.l}</p>
              <k.ikon className="size-4 text-accent-text" aria-hidden />
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <p className="font-display text-[30px] leading-none font-semibold">
                {data ? <AngkaHidup nilai={k.v} /> : '–'}
                {k.akhir && <span className="text-sm font-medium text-ink-3">{k.akhir}</span>}
              </p>
              <Delta kini={k.v} lalu={k.lv} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel judul="Aktivitas harian" className="lg:col-span-2">
          {data ? <AreaChart data={deret} judul="Aktivitas harian" /> : <div className="skeleton h-52" />}
        </Panel>
        <Panel judul="Wawasan otomatis" aksi={<Lightbulb className="size-4 text-accent-text" aria-hidden />}>
          {!data ? (
            <div className="skeleton h-40" />
          ) : (
            <ul className="flex flex-col gap-2">
              {wawasan.map((w, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-2.5 rounded-xl bg-surface-2 p-3 text-[13.5px]"
                >
                  <span aria-hidden className={cn('mt-[7px] size-2 shrink-0 rounded-full', w.nada === 'baik' ? 'bg-success' : w.nada === 'perhatian' ? 'bg-warning' : 'bg-ink-3')} />
                  {w.teks}
                </motion.li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel judul="Alat yang dipakai" className="lg:col-span-2">
          <BarList
            data={(data?.by_tool ?? []).slice(0, 10).map((t) => {
              const a = alatById(t.tool)
              return { label: namaAlat(t.tool), nilai: t.n, ikon: a ? <a.ikon /> : <Bot /> }
            })}
            kosong="Belum ada aktivitas pada periode ini."
          />
        </Panel>
        <Panel judul="Jam paling aktif">
          <PetaJam data={data?.by_hour ?? []} />
          {cak === 'keluarga' && (
            <div className="mt-5">
              <p className="eyebrow mb-2">Kontribusi anggota</p>
              <BarList data={(data?.by_member ?? []).map((m) => ({ label: m.name, nilai: m.n }))} />
            </div>
          )}
        </Panel>
      </div>

      {/* Ringkasan AI */}
      <Panel
        className="mt-4"
        judul="Ringkasan cerdas (AI)"
        aksi={
          <Button ukuran="sm" varian={narasi ? 'ghost' : 'primary'} ikon={narasi ? <RefreshCw /> : <Bot />} memuat={memuatAI} onClick={mintaNarasi} disabled={!data || data.total === 0} className="no-print">
            {narasi ? 'Buat ulang' : 'Buat ringkasan'}
          </Button>
        }
      >
        <AnimatePresence mode="wait">
          {memuatAI ? (
            <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
            </motion.div>
          ) : narasi ? (
            <motion.div key="n" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <NarasiAI teks={narasi} />
              <p className="mt-3 text-xs text-ink-3">Dibuat AI dari angka ringkasan saja (bukan isi teks Anda). Periksa sebelum dibagikan.</p>
            </motion.div>
          ) : (
            <motion.p key="k" className="text-sm text-ink-3">
              Minta AI menuliskan ringkasan naratif, pencapaian, dan saran untuk periode ini.
            </motion.p>
          )}
        </AnimatePresence>
      </Panel>

      {/* Arsip mingguan */}
      <Panel className="no-print mt-4" judul="Arsip laporan mingguan otomatis" aksi={<Badge nada="aksen">Setiap Senin 00.10 WIB</Badge>}>
        {arsip.length === 0 ? (
          <EmptyState ikon={<FileDown />} judul="Belum ada arsip" isi="Laporan mingguan pertama akan muncul otomatis setelah satu minggu pemakaian." />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {arsip.map((a) => (
              <li key={a.id}>
                <button onClick={() => setBukaArsip(a)} className="flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left transition-colors hover:border-line-2 hover:bg-surface-2">
                  <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', a.scope === 'keluarga' ? 'bg-info-soft text-info' : 'bg-accent-soft text-accent-text')}>
                    {a.scope === 'keluarga' ? <Users className="size-4" /> : <BarChart3 className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {tanggalPendek(a.period_start)} – {tanggalPendek(a.period_end)}
                    </span>
                    <span className="block text-xs text-ink-3">
                      {a.scope === 'keluarga' ? 'Keluarga' : 'Pribadi'} · {angka(a.data?.total ?? 0)} aktivitas {a.summary ? '· ringkasan AI' : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Dialog buka={!!bukaArsip} tutup={() => setBukaArsip(null)} judul={bukaArsip ? `Laporan ${tanggalPendek(bukaArsip.period_start)} – ${tanggalPendek(bukaArsip.period_end)}` : ''} lebar="lg">
        {bukaArsip && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                ['Aktivitas', bukaArsip.data.total],
                ['Hari aktif', bukaArsip.data.active_days],
                ['Disimpan', bukaArsip.data.items_created],
              ].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-surface-2 p-3">
                  <p className="text-xs text-ink-3">{l}</p>
                  <p className="font-display text-2xl font-semibold">{angka(Number(v))}</p>
                </div>
              ))}
            </div>
            <BarList data={bukaArsip.data.by_tool.slice(0, 8).map((t) => ({ label: namaAlat(t.tool), nilai: t.n }))} />
            {bukaArsip.summary && (
              <div className="rounded-2xl bg-surface-2 p-4">
                <p className="eyebrow mb-2">Ringkasan AI</p>
                <NarasiAI teks={bukaArsip.summary} />
              </div>
            )}
            <Button varian="outline" ikon={<FileSpreadsheet />} onClick={() => unduh(`laporan-mingguan-${bukaArsip.period_start}.csv`, keCsv(bukaArsip.data, `${bukaArsip.period_start} s.d. ${bukaArsip.period_end}`), 'text/csv;charset=utf-8')}>
              Unduh CSV
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  )
}
