import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, FileUp, Hash as HashIcon, ShieldAlert } from 'lucide-react'
import { Hashes } from '@/legacy'
import { catat } from '@/lib/activity'
import { angka, cn } from '@/lib/utils'
import { PageHeader, Panel } from '@/components/ui/Layout'
import { CopyButton, Segmented } from '@/components/ui/Controls'
import { Input } from '@/components/ui/Field'
import { TombolBersih, TombolTempel } from '@/components/ToolKit'

const ALGO = [
  { id: 'md5', nama: 'MD5', bit: 128 },
  { id: 'sha1', nama: 'SHA-1', bit: 160 },
  { id: 'sha256', nama: 'SHA-256', bit: 256 },
  { id: 'sha384', nama: 'SHA-384', bit: 384 },
  { id: 'sha512', nama: 'SHA-512', bit: 512 },
] as const

type Id = (typeof ALGO)[number]['id']

async function hashBuffer(buf: ArrayBuffer, algo: string) {
  const d = await crypto.subtle.digest(algo, buf)
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function Hash() {
  const [sumber, setSumber] = useState<'teks' | 'berkas'>('teks')
  const [teks, setTeks] = useState('')
  const [berkas, setBerkas] = useState<File | null>(null)
  const [hasil, setHasil] = useState<Partial<Record<Id, string>>>({})
  const [banding, setBanding] = useState('')
  const [huruf, setHuruf] = useState<'kecil' | 'besar'>('kecil')

  useEffect(() => {
    let batal = false
    ;(async () => {
      if (sumber === 'teks') {
        if (!teks) return setHasil({})
        const r: Partial<Record<Id, string>> = { md5: Hashes.md5(teks) }
        const [a, b, c, d] = await Promise.all([Hashes.sha1(teks), Hashes.sha256(teks), Hashes.sha384(teks), Hashes.sha512(teks)])
        Object.assign(r, { sha1: a, sha256: b, sha384: c, sha512: d })
        if (!batal) setHasil(r)
        catat('hash', 'ubah', teks.length)
      } else if (berkas) {
        const buf = await berkas.arrayBuffer()
        const [a, b, c, d] = await Promise.all(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].map((x) => hashBuffer(buf, x)))
        if (!batal) setHasil({ sha1: a, sha256: b, sha384: c, sha512: d })
        catat('hash', 'berkas', berkas.size)
      } else setHasil({})
    })()
    return () => {
      batal = true
    }
  }, [teks, berkas, sumber])

  const tampil = (h?: string) => (h ? (huruf === 'besar' ? h.toUpperCase() : h) : '')
  const b = banding.trim().toLowerCase()
  const cocok = b ? ALGO.find((a) => hasil[a.id] === b) : undefined

  return (
    <div>
      <PageHeader
        eyebrow="Kode & Sandi"
        judul="Hash"
        deskripsi="Sidik jari kriptografis untuk teks atau berkas — cocok untuk memverifikasi unduhan dan integritas dokumen. Berkas diproses di perangkat, tidak diunggah."
        ikon={<HashIcon />}
        aksi={
          <Segmented
            label="Sumber"
            nilai={sumber}
            onChange={setSumber}
            pilihan={[
              { id: 'teks', label: 'Teks' },
              { id: 'berkas', label: 'Berkas' },
            ]}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <Panel
          judul={sumber === 'teks' ? 'Teks masukan' : 'Berkas'}
          titik="aksen"
          aksi={
            sumber === 'teks' && (
              <>
                <TombolTempel onTempel={setTeks} />
                <TombolBersih onBersih={() => setTeks('')} nonaktif={!teks} />
              </>
            )
          }
        >
          {sumber === 'teks' ? (
            <>
              <label htmlFor="hash-in" className="sr-only">
                Teks
              </label>
              <textarea id="hash-in" value={teks} onChange={(e) => setTeks(e.target.value)} placeholder="Ketik teks untuk dihitung hash-nya…" className="field min-h-48 font-mono" />
            </>
          ) : (
            <label
              className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-2 p-6 text-center transition-colors hover:border-accent hover:bg-accent-soft/40"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const f = e.dataTransfer.files[0]
                if (f) setBerkas(f)
              }}
            >
              <FileUp className="size-8 text-ink-3" aria-hidden />
              <span className="font-semibold">{berkas ? berkas.name : 'Pilih atau seret berkas ke sini'}</span>
              <span className="text-xs text-ink-3">{berkas ? `${angka(berkas.size / 1024)} KB` : 'Semua jenis berkas, diproses lokal.'}</span>
              <input type="file" className="sr-only" onChange={(e) => setBerkas(e.target.files?.[0] ?? null)} />
            </label>
          )}

          <div className="mt-5">
            <Input label="Bandingkan dengan hash" value={banding} onChange={(e) => setBanding(e.target.value)} placeholder="Tempel hash yang diharapkan…" inputClassName="font-mono" spellCheck={false} />
            <AnimatePresence mode="wait">
              {b && (
                <motion.div
                  key={cocok ? 'y' : 'n'}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn('mt-3 flex items-center gap-2 rounded-xl px-3.5 py-3 text-sm font-semibold', cocok ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger')}
                  role="status"
                >
                  {cocok ? <CheckCircle2 className="size-5" /> : <ShieldAlert className="size-5" />}
                  {cocok ? `Cocok dengan ${cocok.nama}. Isi terverifikasi.` : 'Tidak cocok dengan hash mana pun.'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Panel>

        <Panel
          judul="Hasil"
          titik="sukses"
          aksi={
            <Segmented
              ukuran="sm"
              label="Format huruf"
              nilai={huruf}
              onChange={setHuruf}
              pilihan={[
                { id: 'kecil', label: 'abc' },
                { id: 'besar', label: 'ABC' },
              ]}
            />
          }
        >
          <ul className="flex flex-col gap-3">
            {ALGO.filter((a) => sumber === 'teks' || a.id !== 'md5').map((a) => (
              <li key={a.id} className={cn('rounded-xl border p-3 transition-colors', cocok?.id === a.id ? 'border-success bg-success-soft/50' : 'border-line')}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold">
                    {a.nama} <span className="font-medium text-ink-3">· {a.bit}-bit</span>
                  </span>
                  <CopyButton teks={tampil(hasil[a.id])} tool="hash" varian="ghost" />
                </div>
                <code className="block min-h-5 font-mono text-[12.5px] break-all text-ink-2">{tampil(hasil[a.id]) || '—'}</code>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-3">MD5 dan SHA-1 hanya untuk pengecekan cepat, bukan keamanan. Gunakan SHA-256 ke atas untuk verifikasi penting.</p>
        </Panel>
      </div>
    </div>
  )
}
