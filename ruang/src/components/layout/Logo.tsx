import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import lightMark from '@/assets/sublogo/ruang_light.svg'
import darkMark from '@/assets/sublogo/ruang_dark.svg'
import { LOGO_PENA_PATHS, LOGO_PENA_VIEWBOX } from './logo-pena'
import './logo-pena.css'

/**
 * Logo utama Irsyads (pena) yang dirakit: tetes jatuh, badan tumbuh, mata pena naik.
 * Diputar ulang saat penunjuk masuk ke logo atau tautan pembungkusnya.
 */
export function LogoPena({ height = 48, label, className = '' }: { height?: number; label?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const rakit = (e: Event) => {
      if ((e as PointerEvent).pointerType === 'touch') return
      el.classList.remove('lp-rakit')
      void el.getBoundingClientRect()
      el.classList.add('lp-rakit')
    }
    const host = el.closest('a,button') ?? el
    host.addEventListener('pointerenter', rakit)
    return () => host.removeEventListener('pointerenter', rakit)
  }, [])
  return (
    <span ref={ref} className={`logo-pena lp-rakit shrink-0 ${className}`} style={{ height, width: (height * 202) / 600 }}>
      <svg viewBox={LOGO_PENA_VIEWBOX} fill="currentColor" fillRule="evenodd" focusable="false" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
        {LOGO_PENA_PATHS.map(p => <path key={p.name} className={`lp-${p.name}`} d={p.d} />)}
      </svg>
    </span>
  )
}

/** Toolkit symbol from the Irsyads service icon family (drop + pen body). */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <motion.span aria-hidden className="inline-flex shrink-0" style={{ width: size, height: size }} whileHover={{ scale: 1.03 }}>
      <img src={lightMark} alt="" width={size} height={size} className="size-full dark:hidden" />
      <img src={darkMark} alt="" width={size} height={size} className="hidden size-full dark:block" />
    </motion.span>
  )
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-none">
        <span translate="no" className="block font-display text-[19px] font-semibold tracking-tight">Toolkit</span>
        <span className="block text-[11px] font-semibold tracking-wide text-ink-3">by Irsyads</span>
      </span>
    </span>
  )
}
