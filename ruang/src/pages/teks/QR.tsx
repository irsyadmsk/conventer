import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import QRCode from 'qrcode'
import { Camera, CameraOff, Download, ImageUp, QrCode, ScanLine } from 'lucide-react'
import { Barcode } from '@/legacy'
import { catat } from '@/lib/activity'
import { cn, unduh, unduhDataUrl } from '@/lib/utils'
import { PageHeader, Panel } from '@/components/ui/Layout'
import { Button } from '@/components/ui/Button'
import { CopyButton, Segmented } from '@/components/ui/Controls'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'

type Jenis = 'teks' | 'url' | 'wifi' | 'wa' | 'kontak' | 'email'

function susun(j: Jenis, d: Record<string, string>) {
  const esc = (s = '') => s.replace(/([\\;,:"])/g, '\\$1')
  switch (j) {
    case 'url':
      return d.url && !/^https?:\/\//i.test(d.url) ? `https://${d.url}` : d.url ?? ''
    case 'wifi':
      return `WIFI:T:${d.enkripsi || 'WPA'};S:${esc(d.ssid)};P:${esc(d.sandi)};${d.tersembunyi === 'ya' ? 'H:true;' : ''};`
    case 'wa': {
      const no = (d.nomor ?? '').replace(/\D/g, '').replace(/^0/, '62')
      return `https://wa.me/${no}${d.pesan ? `?text=${encodeURIComponent(d.pesan)}` : ''}`
    }
    case 'kontak':
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${d.nama ?? ''}\nTEL:${d.telp ?? ''}\nEMAIL:${d.email ?? ''}\nORG:${d.org ?? ''}\nEND:VCARD`
    case 'email':
      return `mailto:${d.ke ?? ''}?subject=${encodeURIComponent(d.subjek ?? '')}&body=${encodeURIComponent(d.isi ?? '')}`
    default:
      return d.teks ?? ''
  }
}

declare global {
  interface Window {
    BarcodeDetector?: new (o?: { formats: string[] }) => { detect: (s: CanvasImageSource | Blob | ImageBitmap) => Promise<{ rawValue: string; format: string }[]> }
  }
}

function Pemindai() {
  const video = useRef<HTMLVideoElement>(null)
  const [aktif, setAktif] = useState(false)
  const [hasil, setHasil] = useState<{ v: string; f: string } | null>(null)
  const toast = useToast()
  const didukung = typeof window !== 'undefined' && 'BarcodeDetector' in window

  useEffect(() => {
    if (!aktif) return
    let stream: MediaStream | null = null
    let raf = 0
    let batal = false
    const det = new window.BarcodeDetector!({ formats: ['qr_code', 'code_128', 'ean_13', 'ean_8', 'code_39', 'upc_a', 'itf', 'pdf417', 'aztec', 'data_matrix', 'codabar'] })
    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
        if (batal) return stream.getTracks().forEach((t) => t.stop())
        video.current!.srcObject = stream
        await video.current!.play()
        const loop = async () => {
          if (batal) return
          try {
            const r = await det.detect(video.current!)
            if (r[0]) {
              setHasil({ v: r[0].rawValue, f: r[0].format })
              setAktif(false)
              catat('qr', 'pindai')
              navigator.vibrate?.(40)
              return
            }
          } catch {
            /* bingkai belum siap */
          }
          raf = requestAnimationFrame(loop)
        }
        loop()
      } catch {
        toast('Kamera tidak dapat dibuka', { nada: 'galat', isi: 'Izinkan akses kamera di peramban.' })
        setAktif(false)
      }
    })()
    return () => {
      batal = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [aktif, toast])

  async function dariGambar(f: File) {
    try {
      const bmp = await createImageBitmap(f)
      const r = await new window.BarcodeDetector!().detect(bmp)
      if (r[0]) {
        setHasil({ v: r[0].rawValue, f: r[0].format })
        catat('qr', 'pindai')
      } else toast('Tidak ada kode terdeteksi', { nada: 'info' })
    } catch {
      toast('Gambar tidak dapat dibaca', { nada: 'galat' })
    }
  }

  if (!didukung)
    return (
      <Panel judul="Pindai kode">
        <p className="text-sm text-ink-2">Peramban ini belum mendukung pemindaian bawaan. Gunakan Chrome/Edge di Android, Windows, atau macOS terbaru.</p>
      </Panel>
    )

  return (
    <Panel judul="Pindai kode" titik="aksen">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink">
        <video ref={video} className={cn('h-full w-full object-cover', !aktif && 'hidden')} muted playsInline />
        {aktif && (
          <motion.div className="absolute inset-x-8 h-0.5 bg-accent shadow-[0_0_16px_var(--accent)]" animate={{ top: ['15%', '85%', '15%'] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
        )}
        {!aktif && (
          <div className="absolute inset-0 grid place-items-center text-bg/70">
            <ScanLine className="size-12" aria-hidden />
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button varian={aktif ? 'outline' : 'primary'} ikon={aktif ? <CameraOff /> : <Camera />} onClick={() => setAktif((a) => !a)}>
          {aktif ? 'Hentikan kamera' : 'Pindai dengan kamera'}
        </Button>
        <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-line-2 bg-surface px-4 text-sm font-semibold hover:bg-surface-2">
          <ImageUp className="size-4" aria-hidden /> Dari gambar
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && dariGambar(e.target.files[0])} />
        </label>
      </div>
      <AnimatePresence>
        {hasil && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-2xl bg-success-soft p-4">
            <p className="text-xs font-bold text-success uppercase">{hasil.f.replace('_', ' ')}</p>
            <p className="mt-1 font-mono text-sm break-all">{hasil.v}</p>
            <div className="mt-2 flex gap-2">
              <CopyButton teks={hasil.v} tool="qr" />
              {/^https?:\/\//.test(hasil.v) && (
                <a href={hasil.v} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-[10px] px-3 text-[13px] font-semibold text-accent-text hover:underline">
                  Buka tautan
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  )
}

export default function QR() {
  const [tab, setTab] = useState<'qr' | 'barcode' | 'pindai'>('qr')
  const [jenis, setJenis] = useState<Jenis>('url')
  const [d, setD] = useState<Record<string, string>>({ url: 'irsyads.com', teks: 'Halo dari Ruang!' })
  const [fg, setFg] = useState('#14183e')
  const [bg, setBg] = useState('#ffffff')
  const [ec, setEc] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [svg, setSvg] = useState('')
  const [bar, setBar] = useState('RUANG-2026')
  const kanvasBar = useRef<HTMLCanvasElement>(null)
  const isi = useMemo(() => susun(jenis, d), [jenis, d])
  const set = (k: string) => (e: { target: { value: string } }) => setD((x) => ({ ...x, [k]: e.target.value }))

  useEffect(() => {
    if (!isi) return setSvg('')
    QRCode.toString(isi, { type: 'svg', errorCorrectionLevel: ec, margin: 2, color: { dark: fg, light: bg } })
      .then(setSvg)
      .catch(() => setSvg(''))
    catat('qr', 'ubah', isi.length, { jenis })
  }, [isi, fg, bg, ec, jenis])

  useEffect(() => {
    if (tab === 'barcode' && kanvasBar.current) {
      const c = kanvasBar.current
      c.width = 600
      c.height = 200
      Barcode.drawBarcode128(c, bar.replace(/[^\x20-\x7e]/g, ''))
    }
  }, [bar, tab])

  async function unduhPng() {
    const url = await QRCode.toDataURL(isi, { errorCorrectionLevel: ec, margin: 2, width: 1024, color: { dark: fg, light: bg } })
    unduhDataUrl(`qr-${jenis}.png`, url)
    catat('qr', 'unduh')
  }

  return (
    <div>
      <PageHeader
        eyebrow="Teks & Visual"
        judul="QR & Barcode"
        deskripsi="Buat kode QR untuk tautan, Wi-Fi rumah, WhatsApp, atau kartu kontak — dan pindai kode langsung dari kamera."
        ikon={<QrCode />}
        aksi={
          <Segmented
            label="Mode"
            nilai={tab}
            onChange={setTab}
            pilihan={[
              { id: 'qr', label: 'Buat QR' },
              { id: 'barcode', label: 'Barcode' },
              { id: 'pindai', label: 'Pindai' },
            ]}
          />
        }
      />

      {tab === 'pindai' && <Pemindai />}

      {tab === 'barcode' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel judul="Isi barcode (Code 128)" titik="aksen">
            <Input label="Teks / nomor" value={bar} onChange={(e) => setBar(e.target.value)} maxLength={40} bantuan="Huruf, angka, dan simbol ASCII. Maks. 40 karakter." />
          </Panel>
          <Panel
            judul="Pratinjau"
            aksi={
              <Button ukuran="sm" varian="soft" ikon={<Download />} onClick={() => kanvasBar.current && unduhDataUrl('barcode.png', kanvasBar.current.toDataURL('image/png'))}>
                PNG
              </Button>
            }
          >
            <div className="rounded-xl bg-white p-4">
              <canvas ref={kanvasBar} className="h-auto w-full" aria-label={`Barcode untuk ${bar}`} />
            </div>
          </Panel>
        </div>
      )}

      {tab === 'qr' && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Panel judul="Isi kode" titik="aksen">
            <Segmented
              className="mb-4"
              label="Jenis isi"
              nilai={jenis}
              onChange={setJenis}
              ukuran="sm"
              pilihan={[
                { id: 'url', label: 'Tautan' },
                { id: 'teks', label: 'Teks' },
                { id: 'wifi', label: 'Wi-Fi' },
                { id: 'wa', label: 'WhatsApp' },
                { id: 'kontak', label: 'Kontak' },
                { id: 'email', label: 'Email' },
              ]}
            />
            <div className="flex flex-col gap-3">
              {jenis === 'url' && <Input label="Alamat web" value={d.url ?? ''} onChange={set('url')} placeholder="contoh.com" inputMode="url" />}
              {jenis === 'teks' && <Textarea label="Teks" value={d.teks ?? ''} onChange={set('teks')} maxLength={1200} />}
              {jenis === 'wifi' && (
                <>
                  <Input label="Nama Wi-Fi (SSID)" value={d.ssid ?? ''} onChange={set('ssid')} />
                  <Input label="Kata sandi" value={d.sandi ?? ''} onChange={set('sandi')} bantuan="Tamu cukup memindai tanpa mengetik sandi." />
                  <Select label="Keamanan" value={d.enkripsi ?? 'WPA'} onChange={set('enkripsi')}>
                    <option value="WPA">WPA/WPA2/WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Tanpa sandi</option>
                  </Select>
                </>
              )}
              {jenis === 'wa' && (
                <>
                  <Input label="Nomor WhatsApp" value={d.nomor ?? ''} onChange={set('nomor')} placeholder="0812…" inputMode="tel" />
                  <Textarea label="Pesan awal (opsional)" value={d.pesan ?? ''} onChange={set('pesan')} />
                </>
              )}
              {jenis === 'kontak' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Nama" value={d.nama ?? ''} onChange={set('nama')} />
                  <Input label="Telepon" value={d.telp ?? ''} onChange={set('telp')} inputMode="tel" />
                  <Input label="Email" value={d.email ?? ''} onChange={set('email')} inputMode="email" />
                  <Input label="Organisasi" value={d.org ?? ''} onChange={set('org')} />
                </div>
              )}
              {jenis === 'email' && (
                <>
                  <Input label="Kepada" value={d.ke ?? ''} onChange={set('ke')} inputMode="email" />
                  <Input label="Subjek" value={d.subjek ?? ''} onChange={set('subjek')} />
                  <Textarea label="Isi" value={d.isi ?? ''} onChange={set('isi')} />
                </>
              )}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-2">
                Warna kode
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-11 w-full rounded-xl border border-line" />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-2">
                Latar
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-11 w-full rounded-xl border border-line" />
              </label>
              <Select label="Koreksi galat" value={ec} onChange={(e) => setEc(e.target.value as typeof ec)}>
                <option value="L">Rendah</option>
                <option value="M">Sedang</option>
                <option value="Q">Tinggi</option>
                <option value="H">Maksimal</option>
              </Select>
            </div>
          </Panel>
          <Panel judul="Pratinjau" aksi={<CopyButton teks={isi} tool="qr" label="Salin isi" varian="ghost" />}>
            <motion.div
              key={svg.length + fg + bg}
              initial={{ scale: 0.96, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-[var(--shadow-soft)]"
            >
              {svg && <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt={`Kode QR berisi: ${isi.slice(0, 80)}`} width={320} height={320} className="h-full w-full" />}
            </motion.div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button varian="primary" ikon={<Download />} onClick={unduhPng} disabled={!isi}>
                PNG
              </Button>
              <Button
                varian="outline"
                ikon={<Download />}
                disabled={!svg}
                onClick={() => {
                  unduh(`qr-${jenis}.svg`, svg, 'image/svg+xml')
                  catat('qr', 'unduh')
                }}
              >
                SVG
              </Button>
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}
