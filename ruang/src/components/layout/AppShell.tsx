import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useOutlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, LayoutGrid, LogIn, LogOut, PanelLeftClose, PanelLeftOpen, Search, Users } from 'lucide-react'
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
import { LogoPena } from './Logo'
import { SharedNavigation } from './SharedNavigation'
import AppearancePreferences from '@/lib/appearance-preferences'

const URUTAN: Grup[] = ['utama', 'aksara', 'sandi', 'hitung', 'teks', 'pendidikan', 'kreasi', 'akun']

function aktifUntuk(path: string, loc: string) {
  if (path === '/') return loc === '/'
  if (path === '/aksara') return loc === '/aksara'
  return loc === path || loc.startsWith(path + '/')
}

function NavDaftar({ onPilih, compact = false }: { onPilih?: () => void; compact?: boolean }) {
  const loc = useLocation().pathname
  const menunggu = usePermintaanMenunggu()
  return (
    <nav aria-label="Navigasi utama" className="flex flex-col gap-5">
      {URUTAN.map((g) => (
        <div key={g}>
          <p className={cn('eyebrow mb-1.5 px-3', compact && 'sr-only')}>{GRUP[g]}</p>
          <ul className="flex flex-col gap-0.5">
            {ALAT.filter((a) => a.grup === g).map((a) => {
              const aktif = aktifUntuk(a.path, loc)
              return (
                <li key={a.id}>
                  <NavLink
                    to={a.path}
                    title={compact ? a.nama : undefined}
                    aria-label={compact ? a.nama : undefined}
                    onClick={() => {
                      bunyi('tap')
                      onPilih?.()
                    }}
                    aria-current={aktif ? 'page' : undefined}
                    className={cn(
                      'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-semibold transition-colors',
                      compact && 'justify-center px-0',
                      aktif ? 'text-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                    )}
                  >
                    {aktif && (
                      <motion.span
                        layoutId="nav-aktif"
                        className="absolute inset-0 rounded-xl bg-surface shadow-[var(--shadow-soft)] ring-1 ring-line"
                        transition={{
                          type: 'spring',
                          stiffness: 480,
                          damping: 38,
                        }}
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
                    <span className={cn('relative truncate', compact && 'sr-only')}>{a.nama}</span>
                    {a.id === 'apma' && menunggu > 0 && (
                      <span
                        className="relative ml-auto rounded-full bg-accent px-1.5 py-0.5 text-[11px] leading-none font-bold text-accent-ink tabular"
                        aria-label={`${menunggu} permintaan akses menunggu`}
                      >
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
  const loc = useLocation()
  if (!user)
    return (
      <Link
        to="/masuk"
        state={{ dari: loc.pathname }}
        className="flex min-h-12 items-center gap-3 rounded-xl border border-line bg-surface px-3 text-sm font-semibold"
      >
        <LogIn className="size-5" aria-hidden />
        Masuk / daftar
      </Link>
    )
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
  const { namaTampil, profil, user } = useAuth()
  const [palet, setPalet] = useState(false)
  const [menu, setMenu] = useState(false)
  const [compact, setCompact] = useState(() => {
    try {
      return localStorage.getItem('ruang:sidebar-compact') === '1'
    } catch {
      return false
    }
  })
  const alatAktif = [...ALAT]
    .sort((a, b) => b.path.length - a.path.length)
    .find((a) => aktifUntuk(a.path, loc.pathname))
  function toggleSidebar() {
    setCompact((v) => {
      try {
        localStorage.setItem('ruang:sidebar-compact', v ? '0' : '1')
      } catch {
        /* preferensi sesi tetap bekerja */
      }
      return !v
    })
  }

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
    <div className="toolkit-shell min-h-dvh" data-sidebar={compact ? 'compact' : 'full'}>
      <a
        href="#isi"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[90] focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
      >
        Lewati ke konten
      </a>

      {/* Satu identitas dan pemilih layanan, sejajar dengan bilah samping. */}
      <header className="toolkit-header sticky top-0 z-50 h-16 border-b border-line/70 bg-bg/95 backdrop-blur-xl">
        <div className="flex h-full items-center">
          <div
            className={cn(
              'toolkit-brand flex h-full shrink-0 items-center pl-4 lg:border-r lg:border-line lg:px-5',
              compact ? 'lg:w-20 lg:px-3' : 'lg:w-[272px]',
            )}
          >
            <SharedNavigation />
          </div>
          <div className="mx-auto flex h-full min-w-0 max-w-[1320px] flex-1 items-center justify-end gap-2 pr-4 sm:px-6 lg:px-10">
            <div className="hidden shrink-0 lg:block">
              <IconButton
                label={compact ? 'Perluas sidebar' : 'Lipat sidebar'}
                onClick={toggleSidebar}
                aria-expanded={!compact}
                aria-controls="sidebar-toolkit"
              >
                {compact ? <PanelLeftOpen /> : <PanelLeftClose />}
              </IconButton>
            </div>
            <nav aria-label="Lokasi halaman" className="mr-auto hidden min-w-0 items-center gap-2 text-sm sm:flex">
              <Link to="/" className="shrink-0 text-ink-3 hover:text-ink">
                Beranda
              </Link>
              {alatAktif && alatAktif.id !== 'beranda' && (
                <>
                  <span className="text-ink-3" aria-hidden>
                    /
                  </span>
                  <span aria-current="page" className="truncate font-semibold">
                    {alatAktif.nama}
                  </span>
                </>
              )}
            </nav>
            {keluarga && (
              <Link
                to="/keluarga"
                className="mr-1 hidden min-w-0 items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1 text-[13px] font-semibold text-ink-2 transition-colors hover:border-line-2 sm:flex"
              >
                <span className="flex shrink-0 -space-x-2">
                  {anggota.slice(0, 3).map((a) => (
                    <Avatar key={a.user_id} nama={a.display_name} ukuran={24} className="ring-2 ring-surface" />
                  ))}
                </span>
                <span className="truncate">{keluarga.name}</span>
                <span className="relative flex size-2 shrink-0">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                <span className="sr-only">tersinkron</span>
              </Link>
            )}
            <IconButton label="Cari (Ctrl K)" onClick={() => setPalet(true)} className="shrink-0 lg:hidden">
              <Search />
            </IconButton>
            <AppearancePreferences compact />
            <Link
              to={user ? '/pengaturan' : '/masuk'}
              state={user ? undefined : { dari: loc.pathname }}
              className="ml-1 grid size-11 shrink-0 place-items-center rounded-full lg:hidden"
              aria-label={user ? 'Pengaturan akun' : 'Masuk ke akun'}
            >
              {user ? (
                <Avatar nama={namaTampil} url={profil?.avatar_url} ukuran={34} />
              ) : (
                <LogIn className="size-5" aria-hidden />
              )}
            </Link>
          </div>
        </div>
      </header>

      <div
        className={cn('lg:grid', compact ? 'lg:grid-cols-[80px_minmax(0,1fr)]' : 'lg:grid-cols-[272px_minmax(0,1fr)]')}
      >
        {/* Bilah samping (desktop), tetap terjangkau di bawah header. */}
        <aside
          id="sidebar-toolkit"
          className="sticky top-16 hidden h-[calc(100dvh-4rem)] flex-col gap-4 border-r border-line bg-bg-2/60 px-3 py-4 lg:flex"
        >
          <button
            onClick={() => setPalet(true)}
            aria-label="Cari alat (Ctrl K)"
            className={cn(
              'mx-1 flex h-10 shrink-0 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-left text-[13.5px] text-ink-3 transition-colors hover:border-line-2 hover:text-ink-2',
              compact && 'justify-center px-0',
            )}
          >
            <Search className="size-4" aria-hidden />
            {!compact && (
              <>
                <span className="flex-1">Cari…</span>
                <Kbd>Ctrl K</Kbd>
              </>
            )}
          </button>
          <div className="-mr-1 min-h-0 flex-1 overflow-y-auto pr-1">
            <NavDaftar compact={compact} />
          </div>
          <a
            href="https://irsyads.com"
            aria-label="Kembali ke irsyads.com"
            title={compact ? 'Kembali ke irsyads.com' : undefined}
            className="group mx-1 flex h-10 items-center gap-2 rounded-xl px-3 text-[13.5px] font-semibold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            {!compact && (
              <>
                <LogoPena height={22} />
                Kembali ke irsyads.com
              </>
            )}
          </a>
          {compact ? (
            <Link
              to={user ? '/pengaturan' : '/masuk'}
              state={user ? undefined : { dari: loc.pathname }}
              className="grid min-h-11 place-items-center rounded-xl hover:bg-surface-2"
              aria-label={user ? 'Pengaturan akun' : 'Masuk ke akun'}
            >
              {user ? (
                <Avatar nama={namaTampil} url={profil?.avatar_url} ukuran={34} />
              ) : (
                <LogIn className="size-5" aria-hidden />
              )}
            </Link>
          ) : (
            <AkunMini />
          )}
        </aside>

        <div className="flex min-w-0 flex-col">
          <main
            id="isi"
            className="mx-auto w-full max-w-[1320px] flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-9 lg:pb-16"
          >
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
      </div>

      {/* Dok bawah (ponsel & tablet) */}
      <nav
        aria-label="Navigasi cepat"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2">
          {dok.map((a) => {
            const aktif = aktifUntuk(a.path, loc.pathname)
            return (
              <li key={a.id} className="flex-1">
                <NavLink
                  to={a.path}
                  onClick={() => bunyi('tap')}
                  aria-current={aktif ? 'page' : undefined}
                  className={cn(
                    'relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold',
                    aktif ? 'text-accent-text' : 'text-ink-3',
                  )}
                >
                  {aktif && (
                    <motion.span layoutId="dok-aktif" className="absolute top-0 h-[3px] w-8 rounded-b-full bg-accent" />
                  )}
                  <motion.span
                    animate={{ y: aktif ? -1 : 0, scale: aktif ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                  >
                    <a.ikon className="size-[21px]" aria-hidden />
                  </motion.span>
                  {a.nama}
                </NavLink>
              </li>
            )
          })}
          <li className="flex-1">
            <button
              onClick={() => setMenu(true)}
              className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-bold text-ink-3"
            >
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
          {keluarga
            ? `Tersinkron dengan keluarga ${keluarga.name} (${anggota.length} anggota)`
            : 'Belum ada keluarga — buat atau gabung di menu Keluarga.'}
        </div>
      </Dialog>

      <CommandPalette buka={palet} tutup={() => setPalet(false)} />
    </div>
  )
}
