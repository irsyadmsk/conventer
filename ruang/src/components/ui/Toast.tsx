import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { bunyi } from '@/lib/sound'
import { cn } from '@/lib/utils'

type Nada = 'sukses' | 'galat' | 'info'
type Toast = { id: number; judul: string; isi?: string; nada: Nada; aksi?: { label: string; jalankan: () => void } }

type Nilai = { toast: (judul: string, opsi?: { isi?: string; nada?: Nada; aksi?: Toast['aksi']; lama?: number }) => void }
const Ctx = createContext<Nilai | null>(null)

let seq = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [daftar, setDaftar] = useState<Toast[]>([])

  const tutup = useCallback((id: number) => setDaftar((d) => d.filter((t) => t.id !== id)), [])

  const toast = useCallback<Nilai['toast']>(
    (judul, opsi = {}) => {
      const id = ++seq
      const nada = opsi.nada ?? 'sukses'
      bunyi(nada === 'galat' ? 'galat' : 'sukses')
      setDaftar((d) => [...d.slice(-3), { id, judul, isi: opsi.isi, nada, aksi: opsi.aksi }])
      setTimeout(() => tutup(id), opsi.lama ?? (nada === 'galat' ? 6000 : 3200))
    },
    [tutup],
  )

  const nilai = useMemo(() => ({ toast }), [toast])
  const Ikon = { sukses: CheckCircle2, galat: AlertTriangle, info: Info }

  return (
    <Ctx.Provider value={nilai}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[80] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6"
      >
        <AnimatePresence initial={false}>
          {daftar.map((t) => {
            const I = Ikon[t.nada]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.18 } }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                role={t.nada === 'galat' ? 'alert' : 'status'}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 pr-2 shadow-[var(--shadow-pop)]"
              >
                <I
                  className={cn('mt-0.5 size-5 shrink-0', t.nada === 'sukses' && 'text-success', t.nada === 'galat' && 'text-danger', t.nada === 'info' && 'text-info')}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{t.judul}</p>
                  {t.isi && <p className="mt-0.5 text-[13px] text-ink-2">{t.isi}</p>}
                  {t.aksi && (
                    <button
                      className="mt-1.5 text-[13px] font-bold text-accent-text hover:underline"
                      onClick={() => {
                        t.aksi!.jalankan()
                        tutup(t.id)
                      }}
                    >
                      {t.aksi.label}
                    </button>
                  )}
                </div>
                <button onClick={() => tutup(t.id)} className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink" aria-label="Tutup notifikasi">
                  <X className="size-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useToast di luar ToastProvider')
  return v.toast
}
