import { useId, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { angka, cn } from '@/lib/utils'

export type Titik = { label: string; nilai: number; sub?: string }

/** Grafik area satu seri dengan garis bidik & tooltip. */
export function AreaChart({ data, tinggi = 200, judul }: { data: Titik[]; tinggi?: number; judul: string }) {
  const id = useId()
  const [hover, setHover] = useState<number | null>(null)
  const W = 640
  const H = tinggi
  const pad = { t: 16, r: 8, b: 26, l: 8 }
  const maks = Math.max(1, ...data.map((d) => d.nilai))
  const x = (i: number) => pad.l + (data.length <= 1 ? (W - pad.l - pad.r) / 2 : (i / (data.length - 1)) * (W - pad.l - pad.r))
  const y = (v: number) => pad.t + (1 - v / maks) * (H - pad.t - pad.b)
  const garis = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.nilai).toFixed(1)}`).join(' ')
  const area = `${garis} L${x(data.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`
  const langkahLabel = Math.max(1, Math.ceil(data.length / 7))

  return (
    <figure className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`${judul}: puncak ${angka(maks)}`}
        onPointerLeave={() => setHover(null)}
        onPointerMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
          const px = ((e.clientX - r.left) / r.width) * W
          const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (data.length - 1))
          setHover(Math.max(0, Math.min(data.length - 1, i)))
        }}
      >
        <defs>
          <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad.l} x2={W - pad.r} y1={y(maks * f)} y2={y(maks * f)} stroke="var(--line)" strokeDasharray="3 5" />
        ))}
        <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="var(--line-2)" />
        {data.length > 0 && (
          <>
            <motion.path d={area} fill={`url(#g${id})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
            <motion.path
              d={garis}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2.2}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        )}
        {data.map((d, i) =>
          i % langkahLabel === 0 || i === data.length - 1 ? (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--ink-3)">
              {d.label}
            </text>
          ) : null,
        )}
        {hover !== null && data[hover] && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="var(--ink-3)" strokeDasharray="2 3" />
            <circle cx={x(hover)} cy={y(data[hover].nilai)} r={5} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />
          </g>
        )}
      </svg>
      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-[var(--shadow-lift)]"
          style={{ left: `${(x(hover) / W) * 100}%` }}
        >
          <p className="font-semibold text-ink-3">{data[hover].sub ?? data[hover].label}</p>
          <p className="font-display text-base font-semibold tabular">{angka(data[hover].nilai)} aktivitas</p>
        </div>
      )}
      <table className="sr-only">
        <caption>{judul}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label + d.sub}>
              <th>{d.sub ?? d.label}</th>
              <td>{d.nilai}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

/** Daftar batang horizontal berlabel langsung (tanpa legenda). */
export function BarList({ data, format = angka, kosong = 'Belum ada data.' }: { data: (Titik & { ikon?: React.ReactNode })[]; format?: (n: number) => string; kosong?: string }) {
  const maks = Math.max(1, ...data.map((d) => d.nilai))
  if (!data.length) return <p className="py-6 text-center text-sm text-ink-3">{kosong}</p>
  return (
    <ul className="flex flex-col gap-2">
      {data.map((d, i) => (
        <li key={d.label} className="group relative flex h-9 items-center gap-3" title={`${d.label}: ${format(d.nilai)}`}>
          <div className="relative h-full flex-1 overflow-hidden rounded-lg">
            <motion.div
              className="absolute inset-0 origin-left rounded-lg bg-accent-soft transition-colors group-hover:bg-accent/25"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: Math.max(0.03, d.nilai / maks) }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 90, damping: 18, delay: i * 0.05 }}
            />
            <span className="relative flex h-full items-center gap-2 px-3 text-[13.5px] font-semibold">
              {d.ikon && <span className="text-accent-text [&>svg]:size-4">{d.ikon}</span>}
              <span className="truncate">{d.label}</span>
            </span>
          </div>
          <span className="w-14 shrink-0 text-right text-[13.5px] font-bold tabular">{format(d.nilai)}</span>
        </li>
      ))}
    </ul>
  )
}

/** Peta panas 24 jam (satu hue, terang→gelap). */
export function PetaJam({ data }: { data: { hour: number; n: number }[] }) {
  const peta = useMemo(() => {
    const a = Array(24).fill(0) as number[]
    data.forEach((d) => (a[d.hour] = d.n))
    return a
  }, [data])
  const maks = Math.max(1, ...peta)
  return (
    <div>
      <div className="grid grid-cols-12 gap-1 sm:grid-cols-24" role="img" aria-label="Sebaran aktivitas per jam">
        {peta.map((n, h) => (
          <div key={h} className="group relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: h * 0.015 }}
              className={cn('aspect-square rounded-md ring-1 ring-line', n === 0 && 'bg-surface-2')}
              style={n ? { background: `color-mix(in oklab, var(--accent) ${Math.round(18 + (n / maks) * 82)}%, var(--surface))` } : undefined}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-[11px] whitespace-nowrap text-bg group-hover:block">
              {String(h).padStart(2, '0')}.00 · {n}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-ink-3">
        <span>00.00</span>
        <span>06.00</span>
        <span>12.00</span>
        <span>18.00</span>
        <span>23.00</span>
      </div>
    </div>
  )
}

/** Cincin progres kecil. */
export function Cincin({ nilai, maks, ukuran = 64, label }: { nilai: number; maks: number; ukuran?: number; label: string }) {
  const r = (ukuran - 8) / 2
  const k = 2 * Math.PI * r
  const f = Math.min(1, maks ? nilai / maks : 0)
  return (
    <svg width={ukuran} height={ukuran} viewBox={`0 0 ${ukuran} ${ukuran}`} role="img" aria-label={`${label}: ${Math.round(f * 100)}%`}>
      <circle cx={ukuran / 2} cy={ukuran / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={6} />
      <motion.circle
        cx={ukuran / 2}
        cy={ukuran / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={k}
        initial={{ strokeDashoffset: k }}
        animate={{ strokeDashoffset: k * (1 - f) }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        transform={`rotate(-90 ${ukuran / 2} ${ukuran / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize={ukuran * 0.24} fontWeight={700} fill="var(--ink)">
        {Math.round(f * 100)}%
      </text>
    </svg>
  )
}
