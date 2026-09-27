import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { angka, angkaDesimal, rupiah } from '@/lib/utils'
import { Panel } from '@/components/ui/Layout'
import { Segmented } from '@/components/ui/Controls'
import { TombolSimpan } from '@/components/ToolKit'
import { Angka, Hasil, bacaAngka, bacaRupiah } from './bagian'

function Cicilan() {
  const [pokok, setPokok] = useState('50.000.000')
  const [bunga, setBunga] = useState('9')
  const [tenor, setTenor] = useState('24')
  const [jenis, setJenis] = useState<'anuitas' | 'flat'>('anuitas')
  const P = bacaRupiah(pokok)
  const r = (bacaAngka(bunga) || 0) / 100 / 12
  const n = Math.max(1, Math.trunc(bacaAngka(tenor) || 1))

  const jadwal = useMemo(() => {
    const rows: { ke: number; angsuran: number; bunga: number; pokok: number; sisa: number }[] = []
    let sisa = P
    if (jenis === 'anuitas') {
      const A = r === 0 ? P / n : (P * r) / (1 - (1 + r) ** -n)
      for (let i = 1; i <= n; i++) {
        const b = sisa * r
        const p = A - b
        sisa = Math.max(0, sisa - p)
        rows.push({ ke: i, angsuran: A, bunga: b, pokok: p, sisa })
      }
    } else {
      const b = P * r
      const p = P / n
      for (let i = 1; i <= n; i++) {
        sisa = Math.max(0, sisa - p)
        rows.push({ ke: i, angsuran: p + b, bunga: b, pokok: p, sisa })
      }
    }
    return rows
  }, [P, r, n, jenis])

  const total = jadwal.reduce((a, x) => a + x.angsuran, 0)
  const totalBunga = total - P
  const porsi = total ? (P / total) * 100 : 100

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
      <Panel judul="Pinjaman" titik="aksen">
        <div className="flex flex-col gap-3">
          <Angka label="Jumlah pinjaman" nilai={pokok} onChange={setPokok} rupiah awalan="Rp" />
          <div className="grid grid-cols-2 gap-3">
            <Angka label="Bunga per tahun" nilai={bunga} onChange={setBunga} akhiran="%" />
            <Angka label="Tenor" nilai={tenor} onChange={setTenor} akhiran="bulan" />
          </div>
          <Segmented
            label="Jenis bunga"
            nilai={jenis}
            onChange={setJenis}
            penuh
            pilihan={[
              { id: 'anuitas', label: 'Anuitas (KPR/bank)' },
              { id: 'flat', label: 'Flat (leasing)' },
            ]}
          />
        </div>
        <div className="mt-5">
          <p className="eyebrow mb-2">Komposisi total pembayaran</p>
          <div className="flex h-3 overflow-hidden rounded-full bg-warning-soft">
            <motion.div className="h-full w-full origin-left bg-accent" animate={{ scaleX: porsi / 100 }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-ink-3">
            <span>Pokok {angkaDesimal(porsi, 0)}%</span>
            <span>Bunga {angkaDesimal(100 - porsi, 0)}%</span>
          </div>
        </div>
      </Panel>
      <Panel judul="Hasil" aksi={<TombolSimpan tool="kalkulator" kind="calc" judulAwal={`Cicilan ${rupiah(P)} / ${n} bln`} konten={{ jenis: 'cicilan', pokok: P, bunga, tenor: n, metode: jenis, angsuran: jadwal[0]?.angsuran }} />}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Hasil label={jenis === 'anuitas' ? 'Angsuran / bulan' : 'Angsuran tetap / bulan'} nilai={rupiah(jadwal[0]?.angsuran ?? 0)} aksen salin={String(Math.round(jadwal[0]?.angsuran ?? 0))} />
          <Hasil label="Total bunga" nilai={rupiah(totalBunga)} />
          <Hasil label="Total bayar" nilai={rupiah(total)} />
        </div>
        {jenis === 'flat' && (
          <p className="mt-3 text-[13px] text-ink-3">Bunga flat {bunga}% setara bunga efektif ± {angkaDesimal(((2 * n) / (n + 1)) * (bacaAngka(bunga) || 0), 1)}% per tahun.</p>
        )}
        <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <caption className="sr-only">Jadwal angsuran</caption>
            <thead className="sticky top-0 bg-surface-2 text-xs text-ink-3">
              <tr>
                <th className="px-3 py-2 text-left">Bln</th>
                <th className="px-3 py-2 text-right">Pokok</th>
                <th className="px-3 py-2 text-right">Bunga</th>
                <th className="px-3 py-2 text-right">Sisa</th>
              </tr>
            </thead>
            <tbody className="tabular">
              {jadwal.map((j) => (
                <tr key={j.ke} className="border-t border-line">
                  <td className="px-3 py-1.5">{j.ke}</td>
                  <td className="px-3 py-1.5 text-right">{angka(j.pokok)}</td>
                  <td className="px-3 py-1.5 text-right text-warning">{angka(j.bunga)}</td>
                  <td className="px-3 py-1.5 text-right">{angka(j.sisa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function Zakat() {
  const [harta, setHarta] = useState('150.000.000')
  const [hutang, setHutang] = useState('')
  const [emas, setEmas] = useState('1.900.000')
  const [gaji, setGaji] = useState('8.000.000')
  const nisab = 85 * bacaRupiah(emas)
  const bersih = Math.max(0, bacaRupiah(harta) - bacaRupiah(hutang))
  const wajib = bersih >= nisab
  const nisabBulanan = nisab / 12
  const G = bacaRupiah(gaji)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel judul="Zakat mal (harta)" titik="aksen">
        <div className="flex flex-col gap-3">
          <Angka label="Total harta (tabungan, emas, investasi) yang sudah 1 tahun" nilai={harta} onChange={setHarta} rupiah awalan="Rp" />
          <Angka label="Utang jatuh tempo" nilai={hutang} onChange={setHutang} rupiah awalan="Rp" />
          <Angka label="Harga emas per gram hari ini" nilai={emas} onChange={setEmas} rupiah awalan="Rp" bantuan="Nisab = 85 gram emas. Cek harga emas terbaru." />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Hasil label="Zakat mal (2,5%)" nilai={wajib ? rupiah(bersih * 0.025) : 'Belum wajib'} sub={`Nisab ${rupiah(nisab)}`} aksen />
          <Hasil label="Harta bersih" nilai={rupiah(bersih)} sub={wajib ? 'Mencapai nisab' : `Kurang ${rupiah(nisab - bersih)} dari nisab`} />
        </div>
      </Panel>
      <Panel judul="Zakat penghasilan (bulanan)">
        <Angka label="Penghasilan bruto per bulan" nilai={gaji} onChange={setGaji} rupiah awalan="Rp" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Hasil label="Zakat per bulan (2,5%)" nilai={G >= nisabBulanan ? rupiah(G * 0.025) : 'Belum wajib'} sub={`Nisab bulanan ${rupiah(nisabBulanan)}`} aksen />
          <Hasil label="Per tahun" nilai={G >= nisabBulanan ? rupiah(G * 0.025 * 12) : '—'} />
        </div>
        <p className="mt-3 text-xs text-ink-3">Perhitungan mengikuti nisab 85 g emas (setara SK BAZNAS). Konsultasikan ke amil zakat untuk kasus khusus.</p>
      </Panel>
    </div>
  )
}

function BagiTagihan() {
  const [total, setTotal] = useState('480.000')
  const [orang, setOrang] = useState('4')
  const [pajak, setPajak] = useState('10')
  const [layanan, setLayanan] = useState('5')
  const [tip, setTip] = useState('0')
  const T = bacaRupiah(total)
  const n = Math.max(1, Math.trunc(bacaAngka(orang) || 1))
  const pj = (T * (bacaAngka(pajak) || 0)) / 100
  const ly = (T * (bacaAngka(layanan) || 0)) / 100
  const tp = (T * (bacaAngka(tip) || 0)) / 100
  const semua = T + pj + ly + tp
  const per = semua / n
  const bulat = Math.ceil(per / 1000) * 1000

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel judul="Tagihan" titik="aksen">
        <div className="flex flex-col gap-3">
          <Angka label="Subtotal" nilai={total} onChange={setTotal} rupiah awalan="Rp" />
          <div className="grid grid-cols-2 gap-3">
            <Angka label="Jumlah orang" nilai={orang} onChange={setOrang} akhiran="org" />
            <Angka label="Pajak resto (PB1)" nilai={pajak} onChange={setPajak} akhiran="%" />
            <Angka label="Biaya layanan" nilai={layanan} onChange={setLayanan} akhiran="%" />
            <Angka label="Tip" nilai={tip} onChange={setTip} akhiran="%" />
          </div>
        </div>
      </Panel>
      <Panel judul="Per orang">
        <div className="grid gap-3 sm:grid-cols-2">
          <Hasil label="Tiap orang bayar" nilai={rupiah(per)} sub={`Dibulatkan: ${rupiah(bulat)}`} aksen salin={String(Math.round(per))} />
          <Hasil label="Total tagihan" nilai={rupiah(semua)} sub={`Pajak ${rupiah(pj)} · layanan ${rupiah(ly)}`} />
        </div>
      </Panel>
    </div>
  )
}

function Tabungan() {
  const [target, setTarget] = useState('100.000.000')
  const [awal, setAwal] = useState('10.000.000')
  const [tahun, setTahun] = useState('5')
  const [imbal, setImbal] = useState('5')
  const FV = bacaRupiah(target)
  const PV = bacaRupiah(awal)
  const n = Math.max(1, Math.round((bacaAngka(tahun) || 1) * 12))
  const r = (bacaAngka(imbal) || 0) / 100 / 12
  const tumbuhAwal = PV * (1 + r) ** n
  const kurang = Math.max(0, FV - tumbuhAwal)
  const perBulan = r === 0 ? kurang / n : (kurang * r) / ((1 + r) ** n - 1)
  const setoran = perBulan * n + PV
  const titik = Array.from({ length: 13 }, (_, i) => {
    const m = Math.round((i / 12) * n)
    return PV * (1 + r) ** m + (r === 0 ? perBulan * m : perBulan * (((1 + r) ** m - 1) / r))
  })
  const maks = Math.max(FV, ...titik)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel judul="Target tabungan" titik="aksen">
        <div className="flex flex-col gap-3">
          <Angka label="Target dana (mis. pendidikan anak, haji)" nilai={target} onChange={setTarget} rupiah awalan="Rp" />
          <Angka label="Dana awal" nilai={awal} onChange={setAwal} rupiah awalan="Rp" />
          <div className="grid grid-cols-2 gap-3">
            <Angka label="Jangka waktu" nilai={tahun} onChange={setTahun} akhiran="tahun" />
            <Angka label="Imbal hasil / tahun" nilai={imbal} onChange={setImbal} akhiran="%" bantuan="Deposito ±4–5%, reksa dana pasar uang ±5–6%" />
          </div>
        </div>
      </Panel>
      <Panel judul="Rencana">
        <div className="grid gap-3 sm:grid-cols-2">
          <Hasil label="Menabung per bulan" nilai={rupiah(perBulan)} aksen salin={String(Math.round(perBulan))} />
          <Hasil label="Total setoran" nilai={rupiah(setoran)} sub={`Hasil investasi ≈ ${rupiah(Math.max(0, FV - setoran))}`} />
        </div>
        <div className="mt-5 flex h-32 items-end gap-1" role="img" aria-label="Pertumbuhan dana menuju target">
          {titik.map((v, i) => (
            <motion.div key={i} className="h-full flex-1 origin-bottom rounded-t-md bg-accent" initial={{ scaleY: 0 }} animate={{ scaleY: v / maks }} transition={{ delay: i * 0.03, type: 'spring', stiffness: 140, damping: 20 }} title={rupiah(v)} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-ink-3">
          <span>Sekarang</span>
          <span>{tahun} tahun</span>
        </div>
      </Panel>
    </div>
  )
}

export default function Keuangan() {
  const [mode, setMode] = useState<'cicilan' | 'zakat' | 'bagi' | 'tabungan'>('cicilan')
  return (
    <div>
      <Segmented
        className="mb-4"
        label="Jenis hitungan keuangan"
        nilai={mode}
        onChange={setMode}
        pilihan={[
          { id: 'cicilan', label: 'Cicilan' },
          { id: 'tabungan', label: 'Target tabungan' },
          { id: 'zakat', label: 'Zakat' },
          { id: 'bagi', label: 'Bagi tagihan' },
        ]}
      />
      {mode === 'cicilan' ? <Cicilan /> : mode === 'zakat' ? <Zakat /> : mode === 'bagi' ? <BagiTagihan /> : <Tabungan />}
    </div>
  )
}
