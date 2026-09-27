import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CornerDownLeft, LogOut, Moon, Palette, Search, Sun } from 'lucide-react'
import { ALAT, GRUP } from '@/tools'
import { usePrefs, PALET } from '@/lib/prefs'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { bunyi } from '@/lib/sound'
import { Kbd } from '@/components/ui/Controls'

type Entri = { id: string; judul: string; sub: string; ikon: React.ReactNode; jalankan: () => void; kata: string }

function skor(q: string, teks: string) {
  if (!q) return 1
  const t = teks.toLowerCase()
  if (t.startsWith(q)) return 3
  if (t.includes(q)) return 2
  // subsequence ringan
  let i = 0
  for (const c of t) if (c === q[i]) i++
  return i === q.length ? 1 : 0
}

export function CommandPalette({ buka, tutup }: { buka: boolean; tutup: () => void }) {
  const nav = useNavigate()
  const { prefs, set, gelap } = usePrefs()
  const { keluar } = useAuth()
  const [q, setQ] = useState('')
  const [aktif, setAktif] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const daftarRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (buka) {
      setQ('')
      setAktif(0)
      setTimeout(() => input.current?.focus(), 20)
    }
  }, [buka])

  const entri = useMemo<Entri[]>(() => {
    const alat: Entri[] = ALAT.map((a) => ({
      id: a.id,
      judul: a.nama,
      sub: GRUP[a.grup],
      ikon: <a.ikon className="size-4" />,
      kata: `${a.nama} ${a.ringkas} ${a.kata ?? ''} ${GRUP[a.grup]}`,
      jalankan: () => nav(a.path),
    }))
    const idx = PALET.findIndex((p) => p.id === prefs.palette)
    const aksi: Entri[] = [
      {
        id: 'tema',
        judul: gelap ? 'Mode terang' : 'Mode gelap',
        sub: 'Tampilan',
        ikon: gelap ? <Sun className="size-4" /> : <Moon className="size-4" />,
        kata: 'tema gelap terang dark light',
        jalankan: () => set({ theme: gelap ? 'light' : 'dark' }),
      },
      {
        id: 'palet',
        judul: `Ganti palet → ${PALET[(idx + 1) % PALET.length].nama}`,
        sub: 'Tampilan',
        ikon: <Palette className="size-4" />,
        kata: 'palet warna aksen',
        jalankan: () => set({ palette: PALET[(idx + 1) % PALET.length].id }),
      },
      { id: 'keluar', judul: 'Keluar dari akun', sub: 'Akun', ikon: <LogOut className="size-4" />, kata: 'logout keluar sign out', jalankan: () => keluar() },
    ]
    return [...alat, ...aksi]
  }, [nav, prefs.palette, set, gelap, keluar])

  const hasil = useMemo(() => {
    const k = q.trim().toLowerCase()
    return entri
      .map((e) => ({ e, s: Math.max(skor(k, e.judul) * 2, skor(k, e.kata)) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.e)
  }, [q, entri])

  useEffect(() => setAktif(0), [q])
  useEffect(() => {
    daftarRef.current?.querySelector(`[data-i="${aktif}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [aktif])

  function pilih(e: Entri) {
    bunyi('tap')
    tutup()
    e.jalankan()
  }

  return (
    <AnimatePresence>
      {buka && (
        <div className="fixed inset-0 z-[75] flex items-start justify-center px-3 pt-[12vh]">
          <motion.div className="absolute inset-0 bg-[rgb(10_12_30/0.4)] backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={tutup} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Cari alat & perintah"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.14 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-surface shadow-[var(--shadow-pop)]"
            onKeyDown={(e) => {
              if (e.key === 'Escape') tutup()
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setAktif((a) => Math.min(a + 1, hasil.length - 1))
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                setAktif((a) => Math.max(a - 1, 0))
              }
              if (e.key === 'Enter' && hasil[aktif]) pilih(hasil[aktif])
            }}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-5 text-ink-3" aria-hidden />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari alat, fitur, atau perintah…"
                aria-label="Kata kunci"
                role="combobox"
                aria-expanded="true"
                aria-controls="palet-hasil"
                aria-activedescendant={hasil[aktif] ? `palet-${hasil[aktif].id}` : undefined}
                className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3"
              />
              <Kbd>Esc</Kbd>
            </div>
            <ul id="palet-hasil" ref={daftarRef} role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
              {hasil.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-3">Tidak ada yang cocok dengan “{q}”.</li>}
              {hasil.map((e, i) => (
                <li key={e.id} id={`palet-${e.id}`} role="option" aria-selected={i === aktif} data-i={i}>
                  <button
                    onMouseMove={() => setAktif(i)}
                    onClick={() => pilih(e)}
                    className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors', i === aktif ? 'bg-accent-soft' : 'hover:bg-surface-2')}
                  >
                    <span className={cn('grid size-9 place-items-center rounded-lg', i === aktif ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-2')}>{e.ikon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{e.judul}</span>
                      <span className="block truncate text-xs text-ink-3">{e.sub}</span>
                    </span>
                    {i === aktif && <CornerDownLeft className="size-4 text-accent-text" aria-hidden />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
