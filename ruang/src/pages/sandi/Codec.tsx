import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownUp, Binary, Lightbulb } from 'lucide-react'
import { TRANSFORMASI, paramBawaan, tebakFormat, transformasiById } from '@/lib/transforms'
import { catat } from '@/lib/activity'
import { cn } from '@/lib/utils'
import { PageHeader, Panel } from '@/components/ui/Layout'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/Controls'
import { Select } from '@/components/ui/Field'
import { Statistik, TombolBersih, TombolSimpan, TombolTempel, TombolUnduh, useSimpanOtomatis } from '@/components/ToolKit'

const GRUP_CODEC = ['Pengodean', 'Aksara', 'Sandi', 'Huruf', 'Rapikan'] as const
const FAVORIT = ['base64:enc', 'base64:dec', 'binary:enc', 'hex:enc', 'url:enc', 'morse:enc', 'l2s', 'rot13']

export default function Codec() {
  const [id, setId] = useState('base64:enc')
  const [teks, setTeks] = useState('')
  const [param, setParam] = useState<Record<string, string | number>>({})
  const [hasil, setHasil] = useState('')
  const [galat, setGalat] = useState<string | null>(null)
  const t = transformasiById(id)!
  const simpanOto = useSimpanOtomatis()

  useEffect(() => setParam(paramBawaan(t)), [t])

  useEffect(() => {
    let batal = false
    ;(async () => {
      try {
        const h = teks ? await t.jalankan(teks, { ...paramBawaan(t), ...param }) : ''
        if (!batal) {
          setHasil(h)
          setGalat(h.startsWith('Error') || h.startsWith('Invalid') ? h : null)
        }
      } catch (e) {
        if (!batal) setGalat(e instanceof Error ? e.message : 'Masukan tidak valid untuk format ini.')
      }
    })()
    if (teks) catat('codec', 'ubah', teks.length, { codec: id })
    return () => {
      batal = true
    }
  }, [teks, t, param, id])

  const saran = useMemo(() => {
    const s = tebakFormat(teks)
    return s && s !== id ? transformasiById(s) : null
  }, [teks, id])

  function tukar() {
    if (!t.balik) return
    setTeks(hasil)
    setId(t.balik)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Kode & Sandi"
        judul="Codec"
        deskripsi="Encode dan decode teks secara langsung — Base64, biner, heksadesimal, URL, Unicode, Morse, NATO, dan banyak lagi."
        ikon={<Binary />}
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Select label="Format" value={id} onChange={(e) => setId(e.target.value)} className="w-full sm:w-72">
          {GRUP_CODEC.map((g) => (
            <optgroup key={g} label={g}>
              {TRANSFORMASI.filter((x) => x.grup === g).map((x) => (
                <option key={x.id} value={x.id}>
                  {x.label}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
        {t.param?.map((p) => (
          <div key={p.kunci} className="w-full sm:w-44">
            {p.jenis === 'pilihan' ? (
              <Select label={p.label} value={String(param[p.kunci] ?? p.bawaan)} onChange={(e) => setParam((x) => ({ ...x, [p.kunci]: e.target.value }))}>
                {p.pilihan!.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </Select>
            ) : (
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-ink-2">{p.label}</span>
                <input
                  className="field h-11"
                  type={p.jenis === 'angka' ? 'number' : 'text'}
                  value={param[p.kunci] ?? p.bawaan}
                  onChange={(e) => setParam((x) => ({ ...x, [p.kunci]: p.jenis === 'angka' ? Number(e.target.value) : e.target.value }))}
                />
              </label>
            )}
          </div>
        ))}
        <div className="flex flex-wrap gap-1.5 pb-0.5">
          {FAVORIT.map((f) => (
            <button
              key={f}
              onClick={() => setId(f)}
              className={cn(
                'h-9 rounded-full px-3 text-[12.5px] font-semibold transition-colors',
                f === id ? 'bg-ink text-bg' : 'bg-surface-2 text-ink-2 hover:bg-surface-3',
              )}
            >
              {transformasiById(f)!.label.replace(' · encode', '').replace(' · decode', ' ↩')}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {saran && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-info/30 bg-info-soft px-4 py-3 text-sm">
              <Lightbulb className="size-4 text-info" aria-hidden />
              <span className="flex-1">
                Masukan ini tampak seperti <strong>{saran.label.replace(' · decode', '')}</strong>.
              </span>
              <Button ukuran="sm" varian="outline" onClick={() => setId(saran.id)}>
                Pakai {saran.label}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <Panel
          judul="Masukan"
          titik="aksen"
          isiClassName="p-0 sm:p-0"
          aksi={
            <>
              <TombolTempel onTempel={setTeks} />
              <TombolBersih onBersih={() => setTeks('')} nonaktif={!teks} />
            </>
          }
        >
          <label htmlFor="codec-in" className="sr-only">
            Teks masukan
          </label>
          <textarea
            id="codec-in"
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            placeholder="Ketik atau tempel teks…"
            spellCheck={false}
            className="min-h-72 w-full resize-y bg-transparent p-4 font-mono text-[14.5px] leading-relaxed outline-none placeholder:text-ink-3 sm:p-5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40"
          />
          <div className="border-t border-line px-4 py-2.5 sm:px-5">
            <Statistik teks={teks} />
          </div>
        </Panel>

        <div className="flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.08, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16 }}
            disabled={!t.balik}
            onClick={tukar}
            className="grid size-12 place-items-center rounded-full bg-ink text-bg shadow-[var(--shadow-lift)] disabled:opacity-30 lg:rotate-90"
            aria-label="Tukar: pakai hasil sebagai masukan dan balik arah"
            title="Tukar arah"
          >
            <ArrowDownUp className="size-5" />
          </motion.button>
        </div>

        <Panel
          judul={`Hasil · ${t.label}`}
          titik="sukses"
          isiClassName="p-0 sm:p-0"
          aksi={
            <>
              <TombolUnduh teks={hasil} nama={`codec-${id.replace(':', '-')}.txt`} tool="codec" />
              <CopyButton teks={hasil} tool="codec" onSalin={() => simpanOto('codec', `${t.label}: ${teks}`, { masukan: teks, hasil, format: id })} />
            </>
          }
        >
          <output aria-live="polite" className={cn('block min-h-72 p-4 font-mono text-[14.5px] leading-relaxed break-all whitespace-pre-wrap sm:p-5', galat && 'text-danger')}>
            {galat ?? (hasil || <span className="text-ink-3 [font-family:var(--font-sans)]">Hasil muncul otomatis saat Anda mengetik.</span>)}
          </output>
          <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-2.5 sm:px-5">
            <Statistik teks={hasil} />
            <TombolSimpan tool="codec" judulAwal={`${t.label}: ${teks.slice(0, 40)}`} konten={{ masukan: teks, hasil, format: id }} nonaktif={!hasil || !!galat} />
          </div>
        </Panel>
      </div>
    </div>
  )
}
