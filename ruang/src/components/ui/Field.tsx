import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Bungkus = { label?: ReactNode; bantuan?: ReactNode; galat?: string | null; className?: string; kanan?: ReactNode }

export function FieldWrap({ id, label, bantuan, galat, className, kanan, children }: Bungkus & { id: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || kanan) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <label htmlFor={id} className="text-[13px] font-semibold text-ink-2">
              {label}
            </label>
          )}
          {kanan}
        </div>
      )}
      {children}
      {galat ? (
        <p id={`${id}-galat`} role="alert" className="text-[12.5px] font-medium text-danger">
          {galat}
        </p>
      ) : (
        bantuan && (
          <p id={`${id}-bantuan`} className="text-[12.5px] text-ink-3">
            {bantuan}
          </p>
        )
      )}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & Bungkus & { ikon?: ReactNode; inputClassName?: string }>(function Input(
  { label, bantuan, galat, className, kanan, ikon, id, inputClassName, ...rest },
  ref,
) {
  const auto = useId()
  const i = id ?? auto
  return (
    <FieldWrap id={i} label={label} bantuan={bantuan} galat={galat} className={className} kanan={kanan}>
      <div className="relative">
        {ikon && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3 [&>svg]:size-4">{ikon}</span>}
        <input
          ref={ref}
          id={i}
          aria-invalid={galat ? true : undefined}
          aria-describedby={galat ? `${i}-galat` : bantuan ? `${i}-bantuan` : undefined}
          className={cn('field h-11', ikon && 'pl-9', inputClassName)}
          {...rest}
        />
      </div>
    </FieldWrap>
  )
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & Bungkus>(function Textarea(
  { label, bantuan, galat, className, kanan, id, ...rest },
  ref,
) {
  const auto = useId()
  const i = id ?? auto
  return (
    <FieldWrap id={i} label={label} bantuan={bantuan} galat={galat} className={className} kanan={kanan}>
      <textarea ref={ref} id={i} aria-invalid={galat ? true : undefined} className="field min-h-28 leading-relaxed" {...rest} />
    </FieldWrap>
  )
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & Bungkus>(function Select(
  { label, bantuan, galat, className, kanan, id, children, ...rest },
  ref,
) {
  const auto = useId()
  const i = id ?? auto
  return (
    <FieldWrap id={i} label={label} bantuan={bantuan} galat={galat} className={className} kanan={kanan}>
      <div className="relative">
        <select ref={ref} id={i} aria-invalid={galat ? true : undefined} className="field h-11 appearance-none pr-9" {...rest}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
      </div>
    </FieldWrap>
  )
})
