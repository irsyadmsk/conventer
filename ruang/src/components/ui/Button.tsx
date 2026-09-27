import { forwardRef, useRef, type ButtonHTMLAttributes, type PointerEvent, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { bunyi } from '@/lib/sound'

type Varian = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger' | 'outline'
type Ukuran = 'sm' | 'md' | 'lg'

export type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  varian?: Varian
  ukuran?: Ukuran
  ikon?: ReactNode
  ikonKanan?: ReactNode
  memuat?: boolean
  penuh?: boolean
  children?: ReactNode
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
}

const VARIAN: Record<Varian, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover shadow-[0_1px_0_rgb(255_255_255/0.18)_inset,0_6px_16px_-8px_var(--accent)] btn-shine',
  secondary: 'bg-ink text-bg hover:opacity-90 btn-shine',
  soft: 'bg-accent-soft text-accent-text hover:brightness-[0.97] dark:hover:brightness-110',
  outline: 'border border-line-2 bg-surface text-ink hover:border-ink-3 hover:bg-surface-2',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
  danger: 'bg-danger-soft text-danger hover:bg-danger hover:text-white',
}

const UKURAN: Record<Ukuran, string> = {
  sm: 'h-9 px-3 text-[13px] gap-1.5 rounded-[10px]',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[15px] gap-2.5 rounded-2xl',
}

/** Tombol dinamis: pegas saat ditekan, riak dari titik sentuh, kilau saat hover. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { varian = 'outline', ukuran = 'md', ikon, ikonKanan, memuat, penuh, className, children, disabled, onPointerDown, onClick, type = 'button', ...rest },
  ref,
) {
  const lokal = useRef<HTMLButtonElement | null>(null)

  function riak(e: PointerEvent<HTMLButtonElement>) {
    const el = lokal.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const d = Math.max(r.width, r.height) * 2.2
    const s = document.createElement('span')
    s.className = 'ripple'
    s.style.width = s.style.height = `${d}px`
    s.style.left = `${e.clientX - r.left - d / 2}px`
    s.style.top = `${e.clientY - r.top - d / 2}px`
    el.appendChild(s)
    setTimeout(() => s.remove(), 600)
  }

  return (
    <motion.button
      ref={(n) => {
        lokal.current = n
        if (typeof ref === 'function') ref(n)
        else if (ref) ref.current = n
      }}
      type={type}
      disabled={disabled || memuat}
      aria-busy={memuat || undefined}
      whileHover={disabled || memuat ? undefined : { y: -1 }}
      whileTap={disabled || memuat ? undefined : { scale: 0.985, opacity: 0.86, y: 0 }}
      transition={{ type: 'spring', stiffness: 520, damping: 30, mass: 0.6 }}
      onPointerDown={(e) => {
        if (!disabled && !memuat) riak(e)
        onPointerDown?.(e)
      }}
      onClick={(e) => {
        bunyi('tap')
        onClick?.(e)
      }}
      className={cn(
        'relative inline-flex select-none items-center justify-center overflow-hidden font-semibold whitespace-nowrap transition-[background-color,color,border-color,opacity,box-shadow] duration-200',
        'disabled:opacity-50 disabled:saturate-50',
        VARIAN[varian],
        UKURAN[ukuran],
        penuh && 'w-full',
        className,
      )}
      {...rest}
    >
      {memuat ? <Loader2 className="size-4 animate-spin" aria-hidden /> : ikon && <span className="-ml-0.5 flex shrink-0 [&>svg]:size-[1.1em]" aria-hidden>{ikon}</span>}
      {children && <span className="truncate">{children}</span>}
      {ikonKanan && <span className="-mr-0.5 flex shrink-0 [&>svg]:size-[1.1em]" aria-hidden>{ikonKanan}</span>}
    </motion.button>
  )
})

type IkonProps = Omit<ButtonProps, 'ikon' | 'ikonKanan' | 'children'> & { label: string; children: ReactNode }

/** Tombol ikon persegi; `label` wajib untuk pembaca layar & tooltip. */
export const IconButton = forwardRef<HTMLButtonElement, IkonProps>(function IconButton(
  { label, children, ukuran = 'md', varian = 'ghost', className, ...rest },
  ref,
) {
  const kotak = ukuran === 'sm' ? 'size-9 !px-0' : ukuran === 'lg' ? 'size-12 !px-0' : 'size-11 !px-0'
  return (
    <Button ref={ref} varian={varian} ukuran={ukuran} aria-label={label} title={label} className={cn(kotak, className)} {...rest}>
      <span className="flex [&>svg]:size-[18px]">{children}</span>
    </Button>
  )
})
