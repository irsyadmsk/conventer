import { useEffect, useRef, type ReactNode } from 'react'
import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

/** Judul halaman alat. */
export function PageHeader({ judul, deskripsi, aksi, ikon }: { eyebrow?: string; judul: ReactNode; deskripsi?: ReactNode; aksi?: ReactNode; ikon?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-3.5">
        {ikon && (
          <motion.div
            initial={{ rotate: -12, scale: 0.7, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="mt-0.5 hidden size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-text sm:grid [&>svg]:size-6"
          >
            {ikon}
          </motion.div>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-[28px] leading-tight font-semibold tracking-[-0.01em] sm:text-[34px]">{judul}</h1>
          {deskripsi && <p className="mt-1.5 max-w-2xl text-[15px] text-ink-2">{deskripsi}</p>}
        </div>
      </div>
      {aksi && <div className="flex shrink-0 flex-wrap items-center gap-2">{aksi}</div>}
    </header>
  )
}

/** Panel kerja dengan pita judul & aksi. */
export function Panel({
  judul,
  aksi,
  children,
  className,
  isiClassName,
  titik,
}: {
  judul?: ReactNode
  aksi?: ReactNode
  children: ReactNode
  className?: string
  isiClassName?: string
  titik?: 'aksen' | 'sukses' | 'netral'
}) {
  return (
    <section className={cn('card flex min-w-0 flex-col', className)}>
      {(judul || aksi) && (
        <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5 sm:px-5">
          {judul && (
            <h2 className="flex items-center gap-2 text-[13.5px] font-bold text-ink-2">
              {titik && (
                <span
                  aria-hidden
                  className={cn('size-2 rounded-full', titik === 'aksen' && 'bg-accent', titik === 'sukses' && 'bg-success', titik === 'netral' && 'bg-ink-3')}
                />
              )}
              {judul}
            </h2>
          )}
          {aksi && <div className="flex flex-wrap items-center gap-1.5">{aksi}</div>}
        </div>
      )}
      <div className={cn('min-w-0 flex-1 p-4 sm:p-5', isiClassName)}>{children}</div>
    </section>
  )
}

/** Angka yang menghitung naik saat terlihat. */
export function AngkaHidup({ nilai, format = (n: number) => Math.round(n).toLocaleString('id-ID'), className }: { nilai: number; format?: (n: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const terlihat = useInView(ref, { once: true })
  const mv = useMotionValue(0)
  const teks = useTransform(mv, (v) => format(v))
  useEffect(() => {
    if (!terlihat) return
    const c = animate(mv, nilai, { duration: 1.1, ease: [0.22, 1, 0.36, 1] })
    return () => c.stop()
  }, [terlihat, nilai, mv])
  return (
    <motion.span ref={ref} className={cn('tabular', className)}>
      {teks}
    </motion.span>
  )
}

/** Wadah stagger untuk daftar/kisi. */
export const stagger = {
  wadah: { hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } } },
  anak: {
    hidden: { opacity: 0, y: 14, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 320, damping: 28 } },
  },
}
