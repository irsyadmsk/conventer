import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ARAH, SEMAPHORE, kodeHuruf } from './core'

export function Halaman({ judul, sub, children }: { judul: string; sub: string; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Irsyads Toolkit</p>
        <h1 className="font-display text-3xl sm:text-4xl">{judul}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">{sub}</p>
      </div>
      {children}
    </div>
  )
}
export function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-ink-2" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  )
}
export function Galat({ isi }: { isi: string }) {
  return isi ? (
    <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">
      {isi}
    </p>
  ) : null
}
export function TautanAlat() {
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {[
        ['/semaphore', 'Semaphore'],
        ['/sandi-pramuka', 'Sandi Pramuka'],
        ['/braille', 'Braille'],
        ['/ejaan-radio', 'Ejaan Radio'],
        ['/lembar-latihan', 'Lembar Latihan'],
        ['/undian', 'Undian & Kelompok'],
        ['/klik-chat', 'Klik ke Chat'],
      ].map(([path, nama]) => (
        <Link key={path} to={path} className="rounded-full border border-line px-3 py-2 hover:bg-surface-2">
          {nama}
        </Link>
      ))}
    </div>
  )
}
export function SemaphoreGlyph({ huruf, size = 160, kuis = false }: { huruf: string; size?: number; kuis?: boolean }) {
  const poses = SEMAPHORE[huruf.toUpperCase()]
  const angles = [90, 135, 180, 225, 270, 315, 0, 45]
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className="max-w-full text-ink"
      role="img"
      aria-label={
        poses
          ? `${kuis ? 'Isyarat' : `Semaphore ${huruf}`}: ${ARAH[poses[0]]} dan ${ARAH[poses[1]]}, dilihat penerima`
          : 'Jeda antar kata'
      }
    >
      <circle cx="100" cy="68" r="12" fill="currentColor" />
      <path
        d="M100 85V134M100 134L81 169M100 134L119 169"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {(poses ?? [0, 0]).map((direction, i) => (
        <g key={i} transform={`translate(100 94) rotate(${angles[direction]})`}>
          <path d="M0 0H67" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          <path d="M51 0V-28H77V0Z" fill="#eac454" stroke="currentColor" strokeWidth="1.5" />
          <path d="M51-28H77V0Z" fill="#b4313c" />
        </g>
      ))}
    </svg>
  )
}
export function KotakGlyph({ huruf }: { huruf: string }) {
  const code = kodeHuruf(huruf, 'kotak'),
    i = Math.floor('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(huruf) / 2)
  const paths = [
    'M25 2V25H2',
    'M2 2V25H25V2',
    'M2 2V25H25',
    'M25 2H2V25H25',
    'M2 2H25V25H2Z',
    'M2 2H25V25H2',
    'M2 2H25V25',
    'M2 25V2H25V25',
    'M2 25V2H25',
    'M2 2L14 14L26 2',
    'M26 2L14 14L26 26',
    'M2 26L14 14L26 26',
    'M2 2L14 14L2 26',
  ]
  return (
    <svg viewBox="0 0 28 28" width="32" height="32" role="img" aria-label={`Sandi kotak ${huruf}, ${code}`}>
      <path d={paths[i]} fill="none" stroke="currentColor" strokeWidth="2" />
      {code.endsWith('•') && (
        <circle
          cx={i === 9 ? 14 : i === 10 ? 21 : i === 11 ? 14 : i === 12 ? 7 : 14}
          cy={i === 9 ? 7 : i === 11 ? 21 : 14}
          r="2"
          fill="currentColor"
        />
      )}
    </svg>
  )
}
