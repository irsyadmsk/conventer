import { motion } from 'framer-motion'
import lightMark from '@/assets/sublogo/ruang_light.svg'
import darkMark from '@/assets/sublogo/ruang_dark.svg'

/** Toolkit symbol from the approved Irsyads service identity. */
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
