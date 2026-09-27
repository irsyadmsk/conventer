import { useMemo, useState } from 'react'
import { angka, tanggalPanjang } from '@/lib/utils'
import { Panel } from '@/components/ui/Layout'
import { Segmented } from '@/components/ui/Controls'
import { Input } from '@/components/ui/Field'
import { Angka, Hasil, bacaAngka } from './bagian'

const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon']
const REF_LEGI = Date.UTC(1945, 7, 17) // 17 Agustus 1945: Jumat Legi
const HARI_MS = 86400000

const isoHariIni = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
const utc = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export function pasaran(iso: string) {
  const n = Math.round((utc(iso) - REF_LEGI) / HARI_MS)
  return PASARAN[((n % 5) + 5) % 5]
}

export function hijriah(iso: string) {
  try {
    return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(utc(iso) + 12 * 3600000))
  } catch {
    return '—'
  }
}

function selisihYMD(a: string, b: string) {
  let [y1, m1, d1] = a.split('-').map(Number)
  const [y2, m2, d2] = b.split('-').map(Number)
  let tukar = false
  if (utc(a) > utc(b)) {
    tukar = true
  }
  const [A, B] = tukar ? [[y2, m2, d2], [y1, m1, d1]] : [[y1, m1, d1], [y2, m2, d2]]
  ;[y1, m1, d1] = A
  let th = B[0] - y1
  let bl = B[1] - m1
  let hr = B[2] - d1
  if (hr < 0) {
    bl--
    hr += new Date(Date.UTC(B[0], B[1] - 1, 0)).getUTCDate()
  }
  if (bl < 0) {
    th--
    bl += 12
  }
  return { th, bl, hr }
}

function hariKerja(a: string, b: string) {
  let n = 0
  const s = Math.min(utc(a), utc(b))
  const e = Math.max(utc(a), utc(b))
  for (let t = s; t <= e; t += HARI_MS) {
    const d = new Date(t).getUTCDay()
    if (d !== 0 && d !== 6) n++
  }
  return n
}

function Usia() {
  const [lahir, setLahir] = useState('2000-01-01')
  const hariIni = isoHariIni()
  const u = useMemo(() => selisihYMD(lahir, hariIni), [lahir, hariIni])
  const totalHari = Math.round((utc(hariIni) - utc(lahir)) / HARI_MS)
  const [, m, d] = lahir.split('-').map(Number)
  const y = Number(hariIni.slice(0, 4))
  let ultah = Date.UTC(y, m - 1, d)
  if (ultah < utc(hariIni)) ultah = Date.UTC(y + 1, m - 1, d)
  const menuju = Math.round((ultah - utc(hariIni)) / HARI_MS)

  return (
    <Panel judul="Usia & hari lahir" titik="aksen">
      <Input label="Tanggal lahir" type="date" value={lahir} max={hariIni} onChange={(e) => setLahir(e.target.value)} />
      {lahir && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Hasil label="Usia" nilai={`${u.th} th ${u.bl} bln ${u.hr} hr`} aksen />
          <Hasil label="Ulang tahun berikutnya" nilai={menuju === 0 ? 'Hari ini!' : `${angka(menuju)} hari lagi`} />
          <Hasil label="Hari lahir (weton)" nilai={`${new Date(utc(lahir)).toLocaleDateString('id-ID', { weekday: 'long', timeZone: 'UTC' })} ${pasaran(lahir)}`} />
          <Hasil label="Sudah hidup" nilai={`${angka(totalHari)} hari`} sub={`≈ ${angka(totalHari * 24)} jam`} />
          <div className="sm:col-span-2">
            <Hasil label="Tanggal Hijriah saat lahir" nilai={hijriah(lahir)} />
          </div>
        </div>
      )}
    </Panel>
  )
}

function Selisih() {
  const [a, setA] = useState(isoHariIni())
  const [b, setB] = useState(() => {
    const t = new Date()
    t.setMonth(11, 31)
    return new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  })
  const hari = Math.round(Math.abs(utc(b) - utc(a)) / HARI_MS)
  const s = selisihYMD(a, b)
  return (
    <Panel judul="Selisih dua tanggal" titik="aksen">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Dari" type="date" value={a} onChange={(e) => setA(e.target.value)} />
        <Input label="Sampai" type="date" value={b} onChange={(e) => setB(e.target.value)} />
      </div>
      {a && b && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Hasil label="Jarak" nilai={`${angka(hari)} hari`} sub={`${s.th} th ${s.bl} bln ${s.hr} hr · ${angka(Math.floor(hari / 7))} minggu ${hari % 7} hari`} aksen />
          <Hasil label="Hari kerja (Sen–Jum)" nilai={`${angka(hariKerja(a, b))} hari`} sub="Termasuk tanggal awal & akhir, belum dikurangi libur nasional" />
        </div>
      )}
    </Panel>
  )
}

function Tambah() {
  const [a, setA] = useState(isoHariIni())
  const [n, setN] = useState('30')
  const [arah, setArah] = useState<'+' | '-'>('+')
  const N = Math.trunc(bacaAngka(n) || 0)
  const hasil = new Date(utc(a) + (arah === '+' ? N : -N) * HARI_MS).toISOString().slice(0, 10)
  return (
    <Panel judul="Tambah / kurangi hari" titik="aksen">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <Input label="Tanggal" type="date" value={a} onChange={(e) => setA(e.target.value)} />
        <Segmented label="Arah" nilai={arah} onChange={setArah} pilihan={[{ id: '+', label: '+' }, { id: '-', label: '−' }]} />
        <Angka label="Jumlah hari" nilai={n} onChange={setN} akhiran="hari" />
      </div>
      {a && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Hasil label="Hasil" nilai={tanggalPanjang(new Date(utc(hasil) + 12 * 3600000))} sub={`Pasaran ${pasaran(hasil)}`} aksen />
          <Hasil label="Hijriah" nilai={hijriah(hasil)} />
        </div>
      )}
    </Panel>
  )
}

export default function Tanggal() {
  const [mode, setMode] = useState<'usia' | 'selisih' | 'tambah'>('usia')
  return (
    <div className="mx-auto max-w-3xl">
      <Segmented
        className="mb-4"
        label="Jenis hitungan tanggal"
        nilai={mode}
        onChange={setMode}
        pilihan={[
          { id: 'usia', label: 'Usia & weton' },
          { id: 'selisih', label: 'Selisih' },
          { id: 'tambah', label: 'Tambah hari' },
        ]}
      />
      {mode === 'usia' ? <Usia /> : mode === 'selisih' ? <Selisih /> : <Tambah />}
    </div>
  )
}
