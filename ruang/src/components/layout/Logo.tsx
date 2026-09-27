import { motion } from 'framer-motion'

/** Tanda Ruang: sebuah pintu dengan gagang — ruang yang bisa dimasuki bersama. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      whileHover="buka"
      initial="tutup"
      className="shrink-0"
    >
      <rect width="64" height="64" rx="18" fill="var(--ink)" />
      <path d="M18 46V22a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v24" fill="none" stroke="var(--bg)" strokeWidth="4.5" strokeLinecap="round" />
      <motion.path
        d="M22 46V22h20v24"
        fill="var(--accent)"
        style={{ originX: '22px', originY: '32px' }}
        variants={{ tutup: { scaleX: 0 }, buka: { scaleX: 1 } }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        opacity={0.35}
      />
      <path d="M14 46h36" stroke="var(--bg)" strokeWidth="4.5" strokeLinecap="round" />
      <motion.circle cx="38" cy="33" r="3.4" fill="var(--accent)" variants={{ tutup: { x: 0 }, buka: { x: -3 } }} />
    </motion.svg>
  )
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-none">
        <span translate="no" className="block font-display text-[19px] font-semibold tracking-tight">Ruang</span>
        <span className="block text-[11px] font-semibold tracking-wide text-ink-3">oleh irsyads</span>
      </span>
    </span>
  )
}
