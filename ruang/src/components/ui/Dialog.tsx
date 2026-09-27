import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Dialog modal: Esc menutup, fokus terkunci di dalam, fokus dikembalikan saat tutup. */
export function Dialog({
  buka,
  tutup,
  judul,
  deskripsi,
  children,
  lebar = 'md',
  kaki,
  bahaya,
}: {
  buka: boolean
  tutup: () => void
  judul: ReactNode
  deskripsi?: ReactNode
  children?: ReactNode
  lebar?: 'sm' | 'md' | 'lg' | 'xl'
  kaki?: ReactNode
  /** Konfirmasi tindakan yang tak dapat dibatalkan → role alertdialog. */
  bahaya?: boolean
}) {
  const panel = useRef<HTMLDivElement>(null)
  const sebelum = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!buka) return
    sebelum.current = document.activeElement as HTMLElement
    const t = setTimeout(() => {
      const f = panel.current?.querySelector<HTMLElement>('[autofocus], input, textarea, select, button:not([data-tutup])')
      ;(f ?? panel.current)?.focus()
    }, 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') tutup()
      if (e.key === 'Tab' && panel.current) {
        const el = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])')
        if (!el.length) return
        const awal = el[0]
        const akhir = el[el.length - 1]
        if (e.shiftKey && document.activeElement === awal) {
          e.preventDefault()
          akhir.focus()
        } else if (!e.shiftKey && document.activeElement === akhir) {
          e.preventDefault()
          awal.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    const ov = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ov
      sebelum.current?.focus?.()
    }
  }, [buka, tutup])

  const w = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[lebar]

  return createPortal(
    <AnimatePresence>
      {buka && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-[rgb(10_12_30/0.45)] backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={tutup}
          />
          <motion.div
            ref={panel}
            role={bahaya ? 'alertdialog' : 'dialog'}
            aria-modal="true"
            aria-label={typeof judul === 'string' ? judul : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98, transition: { duration: 0.16 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={cn('relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl border border-line bg-surface shadow-[var(--shadow-pop)] outline-none sm:rounded-3xl', w)}
          >
            <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 sm:px-6">
              <div>
                <h2 className="font-display text-xl font-semibold">{judul}</h2>
                {deskripsi && <p className="mt-1 text-sm text-ink-3">{deskripsi}</p>}
              </div>
              <button data-tutup onClick={tutup} className="grid size-10 shrink-0 place-items-center rounded-xl text-ink-3 hover:bg-surface-2 hover:text-ink" aria-label="Tutup">
                <X className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6">{children}</div>
            {kaki && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">{kaki}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
