import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { cn, salinTeks } from '@/lib/utils'
import { bunyi } from '@/lib/sound'
import { catat } from '@/lib/activity'
import { useToast } from './Toast'

/* ---------------- Segmented: pilihan dengan penanda meluncur ---------------- */
export function Segmented<T extends string>({
  pilihan,
  nilai,
  onChange,
  label,
  ukuran = 'md',
  className,
  penuh,
}: {
  pilihan: { id: T; label: ReactNode; ikon?: ReactNode }[]
  nilai: T
  onChange: (v: T) => void
  label: string
  ukuran?: 'sm' | 'md'
  className?: string
  penuh?: boolean
}) {
  const grup = useId()
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex max-w-full gap-1 overflow-x-auto rounded-[14px] bg-surface-2 p-1 no-scrollbar', penuh && 'flex w-full', className)}>
      {pilihan.map((p) => {
        const aktif = p.id === nilai
        return (
          <button
            key={p.id}
            role="radio"
            aria-checked={aktif}
            onClick={() => {
              bunyi('toggle')
              onChange(p.id)
            }}
            className={cn(
              'relative flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] font-semibold whitespace-nowrap transition-colors',
              ukuran === 'sm' ? 'h-8 px-2.5 text-[12.5px]' : 'h-9 px-3.5 text-[13.5px]',
              penuh && 'flex-1',
              aktif ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
            )}
          >
            {aktif && (
              <motion.span
                layoutId={`seg-${grup}`}
                className="absolute inset-0 rounded-[10px] bg-surface shadow-[var(--shadow-soft)] ring-1 ring-line"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative flex items-center gap-1.5 [&>svg]:size-4">
              {p.ikon}
              {p.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------------- Switch ---------------- */
export function Switch({ checked, onChange, label, keterangan }: { checked: boolean; onChange: (v: boolean) => void; label: string; keterangan?: string }) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        {keterangan && <span className="block text-[13px] text-ink-3">{keterangan}</span>}
      </label>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => {
          bunyi('toggle')
          onChange(!checked)
        }}
        className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200', checked ? 'bg-accent' : 'bg-line-2')}
      >
        <motion.span
          className="absolute top-1 left-1 block size-5 rounded-full bg-white shadow"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 600, damping: 34 }}
        />
      </button>
    </div>
  )
}

/* ---------------- Slider berlabel ---------------- */
export function Slider({
  label,
  nilai,
  min,
  max,
  step = 1,
  onChange,
  satuan,
}: {
  label: string
  nilai: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  satuan?: string
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-2">
          {label}
        </label>
        <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs tabular">
          {nilai}
          {satuan}
        </span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={nilai} onChange={(e) => onChange(Number(e.target.value))} className="h-6 w-full" />
    </div>
  )
}

/* ---------------- Badge ---------------- */
export function Badge({ children, nada = 'netral', className }: { children: ReactNode; nada?: 'netral' | 'aksen' | 'sukses' | 'peringatan' | 'bahaya' | 'info'; className?: string }) {
  const warna = {
    netral: 'bg-surface-2 text-ink-2',
    aksen: 'bg-accent-soft text-accent-text',
    sukses: 'bg-success-soft text-success',
    peringatan: 'bg-warning-soft text-warning',
    bahaya: 'bg-danger-soft text-danger',
    info: 'bg-info-soft text-info',
  }[nada]
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-bold whitespace-nowrap', warna, className)}>{children}</span>
}

/* ---------------- Kbd ---------------- */
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded-md border border-line-2 bg-surface px-1.5 py-0.5 font-mono text-[11px] font-medium text-ink-3">{children}</kbd>
}

/* ---------------- Tombol salin dengan morph ikon ---------------- */
export function CopyButton({
  teks,
  tool,
  label = 'Salin',
  className,
  varian = 'soft',
  onSalin,
}: {
  teks: string
  tool: string
  label?: string
  className?: string
  varian?: 'soft' | 'ghost' | 'primary'
  onSalin?: () => void
}) {
  const [ok, setOk] = useState(false)
  const toast = useToast()
  const kosong = !teks
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      disabled={kosong}
      onClick={async () => {
        if (await salinTeks(teks)) {
          bunyi('sukses')
          setOk(true)
          catat(tool, 'salin', teks.length)
          onSalin?.()
          setTimeout(() => setOk(false), 1400)
        } else toast('Gagal menyalin', { nada: 'galat' })
      }}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-semibold transition-colors disabled:opacity-40',
        varian === 'soft' && 'bg-accent-soft text-accent-text hover:brightness-95 dark:hover:brightness-110',
        varian === 'ghost' && 'text-ink-2 hover:bg-surface-2',
        varian === 'primary' && 'bg-accent text-accent-ink hover:bg-accent-hover',
        className,
      )}
      aria-label={ok ? 'Tersalin' : label}
    >
      <span className="relative size-4">
        <AnimatePresence initial={false} mode="popLayout">
          {ok ? (
            <motion.span key="c" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} className="absolute inset-0">
              <Check className="size-4" />
            </motion.span>
          ) : (
            <motion.span key="s" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0">
              <Copy className="size-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span>{ok ? 'Tersalin' : label}</span>
    </motion.button>
  )
}

/* ---------------- Kosong ---------------- */
export function EmptyState({ ikon, judul, isi, aksi }: { ikon: ReactNode; judul: string; isi?: ReactNode; aksi?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-2 px-6 py-12 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="mb-4 grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent-text [&>svg]:size-6"
      >
        {ikon}
      </motion.div>
      <h3 className="font-display text-lg font-semibold">{judul}</h3>
      {isi && <p className="mt-1 max-w-sm text-sm text-ink-3">{isi}</p>}
      {aksi && <div className="mt-5">{aksi}</div>}
    </div>
  )
}

/* ---------------- Avatar ---------------- */
export function Avatar({ nama, url, ukuran = 36, className }: { nama: string; url?: string | null; ukuran?: number; className?: string }) {
  const [gagal, setGagal] = useState(false)
  const inisial = nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')
  // Warna stabil dari nama.
  let h = 0
  for (const c of nama) h = (h * 31 + c.charCodeAt(0)) % 360
  return url && !gagal ? (
    <img src={url} alt="" width={ukuran} height={ukuran} onError={() => setGagal(true)} className={cn('shrink-0 rounded-full object-cover', className)} style={{ width: ukuran, height: ukuran }} />
  ) : (
    <span
      aria-hidden
      className={cn('grid shrink-0 place-items-center rounded-full font-bold text-white', className)}
      style={{ width: ukuran, height: ukuran, fontSize: ukuran * 0.38, background: `oklch(0.58 0.12 ${h})` }}
    >
      {inisial || '?'}
    </span>
  )
}
