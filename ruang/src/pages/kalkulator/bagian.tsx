import { useId, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CopyButton } from '@/components/ui/Controls'

/** Angka dengan koma desimal (gaya Indonesia). */
export const bacaAngka = (s: string) => {
  const t = s.trim()
  if (!t) return NaN
  // "1.234.567,5" → 1234567.5 ; "12,5" → 12.5 ; "12.5" → 12.5
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) return Number(t.replace(/\./g, '').replace(',', '.'))
  return Number(t.replace(',', '.'))
}

/** Rupiah: hanya digit, ditampilkan dengan pemisah ribuan. */
export const bacaRupiah = (s: string) => Number(s.replace(/[^\d]/g, '')) || 0
export const tampilRibuan = (n: number) => (n ? n.toLocaleString('id-ID') : '')

export function Angka({
  label,
  nilai,
  onChange,
  akhiran,
  awalan,
  rupiah,
  bantuan,
  className,
}: {
  label: string
  nilai: string
  onChange: (v: string) => void
  akhiran?: string
  awalan?: string
  rupiah?: boolean
  bantuan?: string
  className?: string
}) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-semibold text-ink-2">
        {label}
      </label>
      <div className="relative">
        {awalan && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-ink-3">{awalan}</span>}
        <input
          id={id}
          inputMode="decimal"
          value={nilai}
          onChange={(e) => onChange(rupiah ? tampilRibuan(bacaRupiah(e.target.value)) : e.target.value)}
          className={cn('field h-11 font-semibold tabular', awalan && 'pl-10', akhiran && 'pr-14')}
        />
        {akhiran && <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-semibold text-ink-3">{akhiran}</span>}
      </div>
      {bantuan && <p className="text-xs text-ink-3">{bantuan}</p>}
    </div>
  )
}

/** Kartu hasil besar dengan animasi masuk saat nilai berubah. */
export function Hasil({ label, nilai, sub, aksen, salin }: { label: string; nilai: ReactNode; sub?: ReactNode; aksen?: boolean; salin?: string }) {
  return (
    <div className={cn('rounded-2xl p-4', aksen ? 'bg-accent text-accent-ink' : 'bg-surface-2')}>
      <div className="flex items-start justify-between gap-2">
        <p className={cn('text-[12.5px] font-semibold', aksen ? 'opacity-85' : 'text-ink-3')}>{label}</p>
        {salin && <CopyButton teks={salin} tool="kalkulator" varian="ghost" label="" className={aksen ? 'text-accent-ink hover:bg-white/15' : ''} />}
      </div>
      <motion.p
        key={String(nilai)}
        initial={{ opacity: 0.4, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1 font-display text-[26px] leading-tight font-semibold break-words tabular"
      >
        {nilai}
      </motion.p>
      {sub && <p className={cn('mt-1 text-[12.5px]', aksen ? 'opacity-85' : 'text-ink-3')}>{sub}</p>}
    </div>
  )
}
