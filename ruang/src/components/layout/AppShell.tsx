import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useOutlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, LayoutGrid, LogOut, Search, Users } from 'lucide-react'
import { ALAT, GRUP, type Grup } from '@/tools'
import { useAuth } from '@/lib/auth'
import { useFamily } from '@/lib/family'
import { usePrefs } from '@/lib/prefs'
import { catat } from '@/lib/activity'
import { usePermintaanMenunggu } from '@/lib/akses'
import { cn } from '@/lib/utils'
import { bunyi } from '@/lib/sound'
import { Avatar, Kbd } from '@/components/ui/Controls'
import { IconButton } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { CommandPalette } from './CommandPalette'
import { Logo, LogoPena } from './Logo'
import { SharedNavigation } from './SharedNavigation'
import AppearancePreferences from '@/lib/appearance-preferences'

const URUTAN: Grup[] = ['utama', 'aksara', 'sandi', 'hitung', 'teks', 'pendidikan', 'kreasi', 'akun']

function aktifUntuk(path: string, loc: string) {
  if (path === '/') return loc === '/'
  if (path === '/aksara') return loc === '/aksara'
  return loc === path || loc.startsWith(path + '/')
}

function NavDaftar({ onPilih }: { onPilih?: () => void }) {
  const loc = useLocation().pathname
  const menunggu = usePermintaanMenunggu()
  return (
    <nav aria-label="Navigasi utama" className="flex flex-col gap-5">
      {URUTAN.map((g) => (
        <div key={g}>
          <p className="eyebrow mb-1.5 px-3">{GRUP[g]}</p>
          <ul className="flex flex-col gap-0.5">
            {ALAT.filter((a) => a.grup === g).map((a) => {
              const aktif = aktifUntuk(a.path, loc)
              return (
                <li key={a.id}>
                  <NavLink
                    to={a.path}
                    onClick={() => {
                      bunyi('tap')
                      onPilih?.()
                    }}
                    aria-current={aktif ? 'page' : undefined}
                    className={cn(
                      'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-semibold transition-colors',
                      aktif ? 'text-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                    )}
                  >
                    {aktif && (
                      <motion.span
                        layoutId="nav-aktif"
                        className="absolute inset-0 rounded-xl bg-surface shadow-[var(--shadow-soft)] ring-1 ring-line"
                        transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                      />
                    )}
                    <span
                      className={cn(
                        'relative grid size-7 place-items-center rounded-lg transition-[transform,background-color,color] duration-200 group-hover:scale-110',
                        aktif ? 'bg-accent text-accent-ink' : 'text-ink-3 group-hover:text-accent-text',
                      )}
                    >
                      <a.ikon className="size-[17px]" aria-hidden />
                    </span>
                    <span className="relative truncate">{a.nama}</span>
                    {a.id === 'apma' && menunggu > 0 && (
                      <span className="relative ml-auto rounded-full bg-accent px-1.5 py-0.5 text-[11px] leading-none font-bold text-accent-ink tabular" aria-label={`${menunggu} permintaan akses menunggu`}>
                        {menunggu}
                      </span>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function AkunMini() {
  const { namaTampil, profil, user, keluar, keluarSibuk } = useAuth()
  const { keluarga } = useFamily()
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface p-2.5">
      <Avatar nama={namaTampil} url={profil?.avatar_url} ukuran={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-bold">{namaTampil}</p>
        <p className="truncate text-xs text-ink-3">{keluarga ? `Keluarga ${keluarga.name}` : user?.email}</p>
      </div>
      <IconButton label="Keluar" ukuran="sm" disabled={keluarSibuk} onClick={() => keluar()}>
        <LogOut />
      </IconButton>
    </div>
  )
}

export function AppShell() {
  const loc = useLocation()
  const outlet = useOutlet()
  const { prefs, set } = usePrefs()
  const { keluarga, anggota } = useFamily()
  const { namaTampil, profil } = useAuth()
  const [palet, setPalet] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalet((p) => !p)
      }
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [])

  // Catat alat yang dibuka + daftar "terakhir dipakai" untuk Beranda.
  useEffect(() => {
    const a = [...ALAT].sort((x, y) => y.path.length - x.path.length).find((x) => aktifUntuk(x.path, loc.pathname))
    if (!a) return
    document.title = a.id === 'beranda' ? 'Irsyads Toolkit' : `${a.nama} · Irsyads Toolkit`
    if (['beranda', 'pengaturan'].includes(a.id)) return
    catat(a.id, 'buka')
    const r = [a.id, ...(prefs.recentTools ?? []).filter((x) => x !== a.id)].slice(0, 6)
    if (r.join() !== (prefs.recentTools ?? []).join()) set({ recentTools: r })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.pathname])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [loc.pathname])

  const dok = ALAT.filter((a) => a.dok)

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[272px_1fr]">
      <a href="#isi" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[90] focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink">
        Lewati ke konten
      </a>

      {/* Bilah samping (desktop) */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-4 border-r border-line bg-bg-2/60 px-3 py-5 lg:flex">
        <Link to="/" className="px-2" aria-label="Irsyads Toolkit — home">
          <Logo />
        </Link>
        <button
          onClick={() => setPalet(true)}
          className="mx-1 flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-left text-[13.5px] text-ink-3 transition-colors hover:border-line-2 hover:text-ink-2"
        >
          <Search className="size-4" aria-hidden />
          <span className="flex-1">Cari…</span>
          <Kbd>Ctrl K</Kbd>
        </button>
        <div className="-mr-1 min-h-0 flex-1 overflow-y-auto pr-1">
          <NavDaftar />
        </div>
        <a
          href="https://irsyads.com"
          className="group mx-1 flex h-10 items-center gap-2 rounded-xl px-3 text-[13.5px] font-semibold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          <LogoPena height={22} />
          Kembali ke irsyads.com
        </a>
        <AkunMini />
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Bilah atas */}
        <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-2 px-4 sm:px-6 lg:px-10">
            <SharedNavigation />
            <div className="flex-1" />
            {keluarga && (
              <Link
                to="/keluarga"
                className="mr-1 hidden items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1 text-[13px] font-semibold text-ink-2 transition-colors hover:border-line-2 sm:flex"
              >
                <span className="flex -space-x-2">
                  {anggota.slice(0, 3).map((a) => (
                    <Avatar key={a.user_id} nama={a.display_name} ukuran={24} className="ring-2 ring-surface" />
                  ))}
                </span>
                {keluarga.name}
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                <span className="sr-only">tersinkron</span>
              </Link>
            )}
            <IconButton label="Cari (Ctrl K)" onClick={() => setPalet(true)} className="lg:hidden">
              <Search />
            </IconButton>
            <AppearancePreferences compact />
            <Link to="/pengaturan" className="ml-1 rounded-full lg:hidden" aria-label="Pengaturan akun">
              <Avatar nama={namaTampil} url={profil?.avatar_url} ukuran={34} />
            </Link>
          </div>
        </header>

        <main id="isi" className="mx-auto w-full max-w-[1320px] flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-9 lg:pb-16">
          {/* Standar gerak ekosistem Irsyads: muncul 300 ms, naik 10 px
              dalam 360 ms, ease-out kubik. Tanpa animasi keluar dan tanpa
              mode="wait": dulu halaman baru menunggu yang lama selesai
              memudar, jadi ketukan di bilah bawah terasa tertahan. */}
          <motion.div
            key={loc.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              opacity: { duration: 0.3, ease: [0.215, 0.61, 0.355, 1] },
              y: { duration: 0.36, ease: [0.215, 0.61, 0.355, 1] },
            }}
          >
            {outlet}
          </motion.div>
        </main>
      </div>

      {/* Dok bawah (ponsel & tablet) */}
      <nav aria-label="Navigasi cepat" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-xl lg:hidden">
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2">
          {dok.map((a) => {
            const aktif = aktifUntuk(a.path, loc.pathname)
            return (
              <li key={a.id} className="flex-1">
                <NavLink
                  to={a.path}
                  onClick={() => bunyi('tap')}
                  aria-current={aktif ? 'page' : undefined}
                  className={cn('relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold', aktif ? 'text-accent-text' : 'text-ink-3')}
                >
                  {aktif && <motion.span layoutId="dok-aktif" className="absolute top-0 h-[3px] w-8 rounded-b-full bg-accent" />}
                  <motion.span animate={{ y: aktif ? -1 : 0, scale: aktif ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 500, damping: 26 }}>
                    <a.ikon className="size-[21px]" aria-hidden />
                  </motion.span>
                  {a.nama}
                </NavLink>
              </li>
            )
          })}
          <li className="flex-1">
            <button onClick={() => setMenu(true)} className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-bold text-ink-3">
              <LayoutGrid className="size-[21px]" aria-hidden />
              Semua
            </button>
          </li>
        </ul>
      </nav>

      <Dialog buka={menu} tutup={() => setMenu(false)} judul="Semua alat" lebar="md">
        <NavDaftar onPilih={() => setMenu(false)} />
        <div className="mt-5 flex items-center gap-2 rounded-2xl bg-surface-2 p-3 text-[13px] text-ink-2">
          <Users className="size-4 shrink-0" aria-hidden />
          {keluarga ? `Tersinkron dengan keluarga ${keluarga.name} (${anggota.length} anggota)` : 'Belum ada keluarga — buat atau gabung di menu Keluarga.'}
        </div>
      </Dialog>

      <CommandPalette buka={palet} tutup={() => setPalet(false)} />
    </div>
  )
}
