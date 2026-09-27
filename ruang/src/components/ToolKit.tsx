import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BookmarkPlus, ClipboardPaste, Download, Eraser } from 'lucide-react'
import { useItemAksi } from '@/lib/items'
import { useFamily } from '@/lib/family'
import { usePrefs } from '@/lib/prefs'
import { catat } from '@/lib/activity'
import { pesanGalat } from '@/lib/supabase'
import { angka, tempelTeks, unduh } from '@/lib/utils'
import { Button } from './ui/Button'
import { Dialog } from './ui/Dialog'
import { Input } from './ui/Field'
import { Switch } from './ui/Controls'
import { useToast } from './ui/Toast'

export function TombolTempel({ onTempel }: { onTempel: (t: string) => void }) {
  const toast = useToast()
  return (
    <Button
      ukuran="sm"
      varian="ghost"
      ikon={<ClipboardPaste />}
      onClick={async () => {
        const t = await tempelTeks()
        if (t == null) toast('Izin papan klip ditolak', { nada: 'galat', isi: 'Tempel manual dengan Ctrl+V.' })
        else onTempel(t)
      }}
    >
      Tempel
    </Button>
  )
}

export function TombolBersih({ onBersih, nonaktif }: { onBersih: () => void; nonaktif?: boolean }) {
  return (
    <Button ukuran="sm" varian="ghost" ikon={<Eraser />} onClick={onBersih} disabled={nonaktif}>
      Bersihkan
    </Button>
  )
}

export function TombolUnduh({ teks, nama, tool }: { teks: string; nama: string; tool: string }) {
  return (
    <Button
      ukuran="sm"
      varian="ghost"
      ikon={<Download />}
      disabled={!teks}
      onClick={() => {
        unduh(nama, teks)
        catat(tool, 'unduh', teks.length)
      }}
    >
      .txt
    </Button>
  )
}

/** Simpan hasil ke Koleksi (opsional dibagikan ke keluarga). */
export function TombolSimpan({
  tool,
  judulAwal,
  konten,
  nonaktif,
  label = 'Simpan',
  kind = 'snippet',
}: {
  tool: string
  judulAwal: string
  konten: Record<string, unknown>
  nonaktif?: boolean
  label?: string
  kind?: 'snippet' | 'calc'
}) {
  const [buka, setBuka] = useState(false)
  const [judul, setJudul] = useState('')
  const [bagikan, setBagikan] = useState(false)
  const [memuat, setMemuat] = useState(false)
  const { simpan } = useItemAksi()
  const { keluarga } = useFamily()
  const toast = useToast()

  return (
    <>
      <Button
        ukuran="sm"
        varian="soft"
        ikon={<BookmarkPlus />}
        disabled={nonaktif}
        onClick={() => {
          setJudul(judulAwal.slice(0, 80))
          setBagikan(Boolean(keluarga))
          setBuka(true)
        }}
      >
        {label}
      </Button>
      <Dialog
        buka={buka}
        tutup={() => setBuka(false)}
        judul="Simpan ke Koleksi"
        deskripsi="Tersinkron ke semua perangkat Anda."
        lebar="sm"
        kaki={
          <>
            <Button varian="ghost" onClick={() => setBuka(false)}>
              Batal
            </Button>
            <Button
              varian="primary"
              memuat={memuat}
              onClick={async () => {
                setMemuat(true)
                try {
                  await simpan({ kind, tool, title: judul || judulAwal, content: konten, bagikan })
                  toast('Tersimpan di Koleksi', { isi: bagikan ? `Dibagikan ke keluarga ${keluarga?.name}.` : 'Hanya Anda yang dapat melihat.' })
                  setBuka(false)
                } catch (e) {
                  toast('Gagal menyimpan', { nada: 'galat', isi: pesanGalat(e) })
                } finally {
                  setMemuat(false)
                }
              }}
            >
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Judul" value={judul} onChange={(e) => setJudul(e.target.value)} maxLength={200} autoFocus />
          {keluarga ? (
            <Switch checked={bagikan} onChange={setBagikan} label={`Bagikan ke keluarga ${keluarga.name}`} keterangan="Semua anggota dapat melihat & memakai." />
          ) : (
            <p className="text-[13px] text-ink-3">Gabung atau buat keluarga untuk berbagi hasil dengan anggota lain.</p>
          )}
        </div>
      </Dialog>
    </>
  )
}

/** Simpan otomatis ke Koleksi bila preferensi aktif (dipanggil setelah salin). */
export function useSimpanOtomatis() {
  const { prefs } = usePrefs()
  const { simpan } = useItemAksi()
  return (tool: string, judul: string, konten: Record<string, unknown>) => {
    if (!prefs.autoSave) return
    simpan({ kind: 'snippet', tool, title: judul.slice(0, 80) || 'Hasil', content: konten }).catch(() => {})
  }
}

export function Statistik({ teks }: { teks: string }) {
  const kata = teks.trim() ? teks.trim().split(/\s+/).length : 0
  return (
    <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11.5px] font-semibold text-ink-3 tabular">
      {angka(teks.length)} karakter · {angka(kata)} kata
    </span>
  )
}

/** Kartu contoh/cepat yang bisa diklik (chip). */
export function Chip({ children, onClick, aktif }: { children: ReactNode; onClick: () => void; aktif?: boolean }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-pressed={aktif}
      className={
        'h-8 rounded-full border px-3 text-[13px] font-semibold transition-colors ' +
        (aktif ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-ink-2 hover:border-line-2 hover:text-ink')
      }
    >
      {children}
    </motion.button>
  )
}
