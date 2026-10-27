import { useMemo, useState } from 'react'
import { Dices, Download, RotateCcw, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/Controls'
import { acak, bagiKelompok, csv, peserta, unduh } from './core'
import { Field, Galat, Halaman, TautanAlat } from './ui'

export default function Undian() {
  const [input, setInput] = useState(''),
    [mode, setMode] = useState('individu'),
    [jumlah, setJumlah] = useState(1),
    [kelompok, setKelompok] = useState(4)
  const [terpilih, setTerpilih] = useState<string[]>([]),
    [putaran, setPutaran] = useState<string[][]>([]),
    [groups, setGroups] = useState<string[][]>([]),
    [error, setError] = useState('')
  const parsed = useMemo(() => {
    try {
      return { names: peserta(input), error: '' }
    } catch (e) {
      return { names: [] as string[], error: (e as Error).message }
    }
  }, [input])
  const sisa = parsed.names.filter((n) => !terpilih.includes(n))
  const hasil =
    mode === 'kelompok'
      ? groups.map((g, i) => `Kelompok ${i + 1}\n${g.map((n, j) => `${j + 1}. ${n}`).join('\n')}`).join('\n\n')
      : putaran.map((g, i) => `Putaran ${i + 1}: ${g.join(', ')}`).join('\n')
  function reset() {
    setTerpilih([])
    setPutaran([])
    setGroups([])
    setError('')
  }
  function jalan() {
    setError('')
    try {
      if (parsed.error) throw Error(parsed.error)
      if (!parsed.names.length) throw Error('Masukkan daftar peserta terlebih dahulu.')
      if (mode === 'kelompok') {
        setGroups(bagiKelompok(parsed.names, kelompok))
        return
      }
      const count = mode === 'urutan' ? sisa.length : jumlah
      if (!Number.isInteger(count) || count < 1 || count > sisa.length)
        throw Error('Jumlah terpilih harus 1 sampai jumlah peserta yang tersisa.')
      const picked = acak(sisa).slice(0, count)
      setTerpilih((old) => [...old, ...picked])
      setPutaran((old) => [...old, picked])
    } catch (e) {
      setError((e as Error).message)
    }
  }
  return (
    <Halaman
      judul="Undian & Kelompok"
      sub="Pilih individu, susun urutan presentasi, atau bagi kelompok secara acak. Nama diproses di perangkat ini dan tidak dikirim ke server."
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <section className="card space-y-5 p-5 sm:p-6">
          <Field id="peserta" label="Daftar peserta — satu nama per baris">
            <textarea
              id="peserta"
              className="field min-h-64"
              maxLength={121000}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                reset()
              }}
              placeholder={'Alya — 01\nBima — 02\nCitra — 03\nDamar — 04'}
              aria-describedby="info-peserta"
            />
          </Field>
          <p id="info-peserta" className="text-sm text-ink-3">
            {parsed.names.length} peserta · Maksimal 1.000. Beri pembeda untuk nama yang sama. Mengubah daftar memulai
            sesi baru.
          </p>
          <Field id="mode-undian" label="Jenis pengacakan">
            <select
              id="mode-undian"
              className="field"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value)
                reset()
              }}
            >
              <option value="individu">Undi individu tanpa pengulangan</option>
              <option value="kelompok">Bagi kelompok seimbang</option>
              <option value="urutan">Acak urutan presentasi</option>
            </select>
          </Field>
          {mode === 'individu' && (
            <Field id="jumlah-pemenang" label="Orang dipilih per putaran">
              <input
                id="jumlah-pemenang"
                className="field"
                type="number"
                min="1"
                max={sisa.length || 1}
                value={jumlah}
                onChange={(e) => setJumlah(Number(e.target.value))}
              />
            </Field>
          )}
          {mode === 'kelompok' && (
            <Field id="jumlah-kelompok" label="Jumlah kelompok">
              <input
                id="jumlah-kelompok"
                className="field"
                type="number"
                min="1"
                max={parsed.names.length || 1}
                value={kelompok}
                onChange={(e) => setKelompok(Number(e.target.value))}
              />
            </Field>
          )}
          <Galat isi={parsed.error || error} />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={jalan}
              disabled={!parsed.names.length || !!parsed.error || (mode !== 'kelompok' && !sisa.length)}
              ikon={mode === 'kelompok' ? <Users /> : <Dices />}
            >
              {mode === 'kelompok' ? 'Bagi kelompok' : mode === 'urutan' ? 'Susun urutan' : 'Undi sekarang'}
            </Button>
            <Button varian="outline" onClick={reset} ikon={<RotateCcw />}>
              Mulai ulang
            </Button>
          </div>
          <p className="text-sm text-ink-3">
            {mode === 'kelompok'
              ? 'Ukuran kelompok berbeda paling banyak satu orang.'
              : 'Peserta yang sudah terpilih tidak diundi lagi sampai Anda memulai ulang.'}
          </p>
        </section>
        <section className="card space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl">{mode === 'kelompok' ? 'Susunan kelompok' : 'Hasil undian'}</h2>
            <span className="text-sm text-ink-3">
              {mode === 'kelompok' ? `${groups.length} kelompok` : `${sisa.length} peserta tersisa`}
            </span>
          </div>
          <div aria-live="polite" aria-atomic="true">
            {mode === 'kelompok' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {groups.map((g, i) => (
                  <div className="inset p-4" key={i}>
                    <h3 className="mb-2 font-bold">
                      Kelompok {i + 1} <span className="text-xs font-normal text-ink-3">({g.length} orang)</span>
                    </h3>
                    <ol className="list-inside list-decimal space-y-1 text-sm break-words">
                      {g.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            ) : (
              putaran.length > 0 && (
                <div className="rounded-2xl bg-accent-soft p-6">
                  <p className="eyebrow">Putaran {putaran.length}</p>
                  <p className="mt-3 font-display text-3xl break-words text-accent-text">
                    {putaran.at(-1)?.join(' · ')}
                  </p>
                </div>
              )
            )}
          </div>
          {!hasil && (
            <div className="inset grid min-h-48 place-items-center p-6 text-center text-sm text-ink-3">
              Hasil akan muncul di sini setelah pengacakan.
            </div>
          )}
          {putaran.length > 0 && mode !== 'kelompok' && (
            <ol className="max-h-64 space-y-3 overflow-y-auto">
              {putaran.map((g, i) => (
                <li key={i} className="border-b border-line pb-3 text-sm">
                  <span className="mr-2 font-semibold text-ink-3">{i + 1}.</span>
                  {g.join(', ')}
                </li>
              ))}
            </ol>
          )}
          <div className="flex flex-wrap gap-2">
            <CopyButton teks={hasil} tool="undian" />
            <Button
              varian="outline"
              disabled={!hasil}
              ikon={<Download />}
              onClick={() =>
                unduh(
                  'hasil-undian.csv',
                  csv([
                    ['Kelompok / putaran', 'Nama'],
                    ...(mode === 'kelompok' ? groups : putaran).flatMap((g, i) => g.map((n) => [i + 1, n])),
                  ]),
                  'text/csv;charset=utf-8',
                )
              }
            >
              Unduh CSV
            </Button>
          </div>
        </section>
      </div>
      <TautanAlat />
    </Halaman>
  )
}
