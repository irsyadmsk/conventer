import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { angkaDesimal, rupiah } from '@/lib/utils'
import { Panel } from '@/components/ui/Layout'
import { Segmented } from '@/components/ui/Controls'
import { Button, IconButton } from '@/components/ui/Button'
import { Angka, Hasil, bacaAngka, bacaRupiah } from './bagian'

function PersenDasar() {
  const [a, setA] = useState('15')
  const [b, setB] = useState('200')
  const [c, setC] = useState('30')
  const [d, setD] = useState('120')
  const [lama, setLama] = useState('80')
  const [baru, setBaru] = useState('100')
  const A = bacaAngka(a)
  const B = bacaAngka(b)
  const C = bacaAngka(c)
  const D = bacaAngka(d)
  const L = bacaAngka(lama)
  const N = bacaAngka(baru)
  const f = (x: number) => (Number.isFinite(x) ? angkaDesimal(x, 4) : '—')
  const ubah = ((N - L) / Math.abs(L)) * 100

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel judul="Berapa x% dari y?">
        <div className="grid grid-cols-2 gap-3">
          <Angka label="Persen" nilai={a} onChange={setA} akhiran="%" />
          <Angka label="Dari" nilai={b} onChange={setB} />
        </div>
        <div className="mt-4">
          <Hasil label={`${f(A)}% dari ${f(B)}`} nilai={f((A * B) / 100)} salin={String((A * B) / 100)} aksen />
        </div>
      </Panel>
      <Panel judul="x adalah berapa persen dari y?">
        <div className="grid grid-cols-2 gap-3">
          <Angka label="Nilai" nilai={c} onChange={setC} />
          <Angka label="Total" nilai={d} onChange={setD} />
        </div>
        <div className="mt-4">
          <Hasil label={`${f(C)} dari ${f(D)}`} nilai={`${f((C / D) * 100)}%`} aksen />
        </div>
      </Panel>
      <Panel judul="Perubahan persen">
        <div className="grid grid-cols-2 gap-3">
          <Angka label="Nilai lama" nilai={lama} onChange={setLama} />
          <Angka label="Nilai baru" nilai={baru} onChange={setBaru} />
        </div>
        <div className="mt-4">
          <Hasil label={ubah >= 0 ? 'Naik' : 'Turun'} nilai={`${ubah >= 0 ? '+' : ''}${f(ubah)}%`} sub={`Selisih ${f(N - L)}`} aksen />
        </div>
      </Panel>
    </div>
  )
}

function Diskon() {
  const [harga, setHarga] = useState('250.000')
  const [diskon, setDiskon] = useState<string[]>(['50', '20'])
  const [pajak, setPajak] = useState('11')
  const [ongkir, setOngkir] = useState('')
  const H = bacaRupiah(harga)
  let setelah = H
  const tahap = diskon.map((d) => {
    const p = bacaAngka(d) || 0
    const pot = (setelah * p) / 100
    setelah -= pot
    return { p, pot, sisa: setelah }
  })
  const P = bacaAngka(pajak) || 0
  const nilaiPajak = (setelah * P) / 100
  const O = bacaRupiah(ongkir)
  const total = setelah + nilaiPajak + O
  const hemat = H - setelah
  const efektif = H ? (hemat / H) * 100 : 0

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Panel judul="Harga & diskon bertingkat" titik="aksen">
        <div className="flex flex-col gap-3">
          <Angka label="Harga awal" nilai={harga} onChange={setHarga} rupiah awalan="Rp" />
          {diskon.map((d, i) => (
            <div key={i} className="flex items-end gap-2">
              <Angka className="flex-1" label={`Diskon ${i + 1}`} nilai={d} onChange={(v) => setDiskon((x) => x.map((y, j) => (j === i ? v : y)))} akhiran="%" />
              <IconButton label={`Hapus diskon ${i + 1}`} onClick={() => setDiskon((x) => x.filter((_, j) => j !== i))} disabled={diskon.length === 1}>
                <X />
              </IconButton>
            </div>
          ))}
          <Button ukuran="sm" varian="ghost" ikon={<Plus />} onClick={() => setDiskon((x) => [...x, '10'])} className="self-start">
            Tambah diskon (mis. 50% + 20%)
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Angka label="PPN / pajak" nilai={pajak} onChange={setPajak} akhiran="%" bantuan="PPN umum 11–12%" />
            <Angka label="Ongkir / biaya lain" nilai={ongkir} onChange={setOngkir} rupiah awalan="Rp" />
          </div>
        </div>
      </Panel>
      <Panel judul="Rincian">
        <div className="grid gap-3 sm:grid-cols-2">
          <Hasil label="Total bayar" nilai={rupiah(total)} aksen salin={String(Math.round(total))} />
          <Hasil label="Anda hemat" nilai={rupiah(hemat)} sub={`Diskon efektif ${angkaDesimal(efektif, 2)}% (bukan ${diskon.reduce((a, d) => a + (bacaAngka(d) || 0), 0)}%)`} />
        </div>
        <ol className="mt-4 flex flex-col gap-1.5 text-sm">
          <li className="flex justify-between">
            <span className="text-ink-3">Harga awal</span>
            <span className="font-semibold tabular">{rupiah(H)}</span>
          </li>
          {tahap.map((t, i) => (
            <li key={i} className="flex justify-between">
              <span className="text-ink-3">
                Diskon {angkaDesimal(t.p)}% → sisa {rupiah(t.sisa)}
              </span>
              <span className="font-semibold text-success tabular">−{rupiah(t.pot)}</span>
            </li>
          ))}
          <li className="flex justify-between">
            <span className="text-ink-3">Pajak {angkaDesimal(P)}%</span>
            <span className="font-semibold tabular">+{rupiah(nilaiPajak)}</span>
          </li>
          {O > 0 && (
            <li className="flex justify-between">
              <span className="text-ink-3">Biaya lain</span>
              <span className="font-semibold tabular">+{rupiah(O)}</span>
            </li>
          )}
        </ol>
      </Panel>
    </div>
  )
}

export default function Persen() {
  const [mode, setMode] = useState<'dasar' | 'diskon'>('diskon')
  return (
    <div>
      <Segmented
        className="mb-4"
        label="Jenis hitungan persen"
        nilai={mode}
        onChange={setMode}
        pilihan={[
          { id: 'diskon', label: 'Diskon & belanja' },
          { id: 'dasar', label: 'Persen dasar' },
        ]}
      />
      {mode === 'diskon' ? <Diskon /> : <PersenDasar />}
    </div>
  )
}
