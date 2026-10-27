import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { PrefsProvider } from '@/lib/prefs'
import { FamilyProvider } from '@/lib/family'
import { ToastProvider } from '@/components/ui/Toast'
import { AppShell } from '@/components/layout/AppShell'
import { LogoPena } from '@/components/layout/Logo'
import { PembaruanApp } from '@/components/layout/PembaruanApp'
import { tujuanToolkit } from '@/lib/sso'
import { ALAT } from '@/tools'

const Masuk = lazy(() => import('@/pages/auth/Masuk'))
const Daftar = lazy(() => import('@/pages/auth/Daftar'))
const LupaSandi = lazy(() => import('@/pages/auth/LupaSandi'))
const AturSandi = lazy(() => import('@/pages/auth/AturSandi'))

const Beranda = lazy(() => import('@/pages/Beranda'))
const Laporan = lazy(() => import('@/pages/Laporan'))
const Koleksi = lazy(() => import('@/pages/Koleksi'))
const Otomatisasi = lazy(() => import('@/pages/Otomatisasi'))
const Aksara = lazy(() => import('@/pages/aksara/Aksara'))
const Kamus = lazy(() => import('@/pages/aksara/Kamus'))
const Pedoman = lazy(() => import('@/pages/aksara/Pedoman'))
const Morse = lazy(() => import('@/pages/sandi/Morse'))
const Codec = lazy(() => import('@/pages/sandi/Codec'))
const Sandi = lazy(() => import('@/pages/sandi/Sandi'))
const HashPage = lazy(() => import('@/pages/sandi/Hash'))
const Kalkulator = lazy(() => import('@/pages/kalkulator/Kalkulator'))
const GayaTeks = lazy(() => import('@/pages/teks/GayaTeks'))
const Teks = lazy(() => import('@/pages/teks/Teks'))
const QR = lazy(() => import('@/pages/teks/QR'))
const Apma = lazy(() => import('@/features/apma/Apma'))
const Kreasi = lazy(() => import('@/features/kreasi/Kreasi'))
const Keluarga = lazy(() => import('@/pages/Keluarga'))
const Pengaturan = lazy(() => import('@/pages/Pengaturan'))
const TidakAda = lazy(() => import('@/pages/TidakAda'))
const Undian = lazy(() => import('@/features/perkakas/Undian'))
const KlikChat = lazy(() => import('@/features/perkakas/KlikChat'))
const Semaphore = lazy(() => import('@/features/perkakas/Belajar').then((m) => ({ default: m.Semaphore })))
const SandiPramuka = lazy(() =>
  import('@/features/perkakas/Belajar').then((m) => ({
    default: m.SandiPramuka,
  })),
)
const BrailleLab = lazy(() =>
  import('@/features/perkakas/Belajar').then((m) => ({
    default: m.BrailleLab,
  })),
)
const EjaanRadio = lazy(() =>
  import('@/features/perkakas/Belajar').then((m) => ({
    default: m.EjaanRadio,
  })),
)
const LembarLatihan = lazy(() =>
  import('@/features/perkakas/Belajar').then((m) => ({
    default: m.LembarLatihan,
  })),
)

function Memuat() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-label="Memuat">
      <LogoPena height={96} className="text-ink" />
    </div>
  )
}

/** Halaman pribadi wajib masuk; alat publik terdaftar dapat dipakai tamu. */
function WajibMasuk({ children }: { children: ReactNode }) {
  const { user, memuat } = useAuth()
  const loc = useLocation()
  if (memuat) return <Memuat />
  if (!user && !ALAT.some((a) => a.publik && a.path === loc.pathname))
    return <Navigate to="/masuk" replace state={{ dari: loc.pathname + loc.search + loc.hash }} />
  return <>{children}</>
}

function HanyaTamu({ children }: { children: ReactNode }) {
  const { user, memuat } = useAuth()
  const loc = useLocation()
  if (memuat) return <Memuat />
  if (user)
    return (
      <Navigate to={tujuanToolkit((loc.state as { dari?: string } | null)?.dari, window.location.origin)} replace />
    )
  return <>{children}</>
}

/** Discard account caches, editors and pending autosave timers when identity changes. */
function LingkupAkun({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return <PrefsProvider key={user?.id ?? 'tamu'}>{children}</PrefsProvider>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LingkupAkun>
          <FamilyProvider>
            <ToastProvider>
              <PembaruanApp />
              <Suspense fallback={<Memuat />}>
                <Routes>
                  <Route
                    path="/masuk"
                    element={
                      <HanyaTamu>
                        <Masuk />
                      </HanyaTamu>
                    }
                  />
                  <Route
                    path="/daftar"
                    element={
                      <HanyaTamu>
                        <Daftar />
                      </HanyaTamu>
                    }
                  />
                  <Route
                    path="/lupa-sandi"
                    element={
                      <HanyaTamu>
                        <LupaSandi />
                      </HanyaTamu>
                    }
                  />
                  <Route path="/atur-sandi" element={<AturSandi />} />
                  <Route
                    element={
                      <WajibMasuk>
                        <AppShell />
                      </WajibMasuk>
                    }
                  >
                    <Route
                      path="undian"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Undian />
                        </Suspense>
                      }
                    />
                    <Route
                      path="klik-chat"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <KlikChat />
                        </Suspense>
                      }
                    />
                    <Route
                      path="semaphore"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Semaphore />
                        </Suspense>
                      }
                    />
                    <Route
                      path="sandi-pramuka"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <SandiPramuka />
                        </Suspense>
                      }
                    />
                    <Route
                      path="braille"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <BrailleLab />
                        </Suspense>
                      }
                    />
                    <Route
                      path="ejaan-radio"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <EjaanRadio />
                        </Suspense>
                      }
                    />
                    <Route
                      path="lembar-latihan"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <LembarLatihan />
                        </Suspense>
                      }
                    />
                    <Route
                      index
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Beranda />
                        </Suspense>
                      }
                    />
                    <Route
                      path="laporan"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Laporan />
                        </Suspense>
                      }
                    />
                    <Route
                      path="koleksi"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Koleksi />
                        </Suspense>
                      }
                    />
                    <Route
                      path="otomatisasi"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Otomatisasi />
                        </Suspense>
                      }
                    />
                    <Route
                      path="aksara"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Aksara />
                        </Suspense>
                      }
                    />
                    <Route
                      path="aksara/kamus"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Kamus />
                        </Suspense>
                      }
                    />
                    <Route
                      path="aksara/pedoman"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Pedoman />
                        </Suspense>
                      }
                    />
                    <Route
                      path="morse"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Morse />
                        </Suspense>
                      }
                    />
                    <Route
                      path="codec"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Codec />
                        </Suspense>
                      }
                    />
                    <Route
                      path="sandi"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Sandi />
                        </Suspense>
                      }
                    />
                    <Route
                      path="hash"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <HashPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="kalkulator"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Kalkulator />
                        </Suspense>
                      }
                    />
                    <Route
                      path="gaya-teks"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <GayaTeks />
                        </Suspense>
                      }
                    />
                    <Route
                      path="teks"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Teks />
                        </Suspense>
                      }
                    />
                    <Route
                      path="qr"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <QR />
                        </Suspense>
                      }
                    />
                    <Route
                      path="kreasi"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Kreasi />
                        </Suspense>
                      }
                    />
                    <Route
                      path="modul-ajar/*"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Apma />
                        </Suspense>
                      }
                    />
                    <Route
                      path="keluarga"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Keluarga />
                        </Suspense>
                      }
                    />
                    <Route
                      path="pengaturan"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <Pengaturan />
                        </Suspense>
                      }
                    />
                    <Route
                      path="*"
                      element={
                        <Suspense fallback={<Memuat />}>
                          <TidakAda />
                        </Suspense>
                      }
                    />
                  </Route>
                </Routes>
              </Suspense>
            </ToastProvider>
          </FamilyProvider>
        </LingkupAkun>
      </AuthProvider>
    </BrowserRouter>
  )
}
