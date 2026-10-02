import { sharedAppearance, publishAppearance, mergeAccountAppearance } from './appearance'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { supabase } from './supabase'
import { useAuth } from './auth'
import { setSuaraAktif } from './sound'

export type Palet = 'krem' | 'hutan' | 'samudra' | 'senja' | 'aurora' | 'tanah'
export type Tema = 'system' | 'light' | 'dark'

export type Prefs = {
  theme: Tema
  palette: Palet
  sound: boolean
  motion: 'system' | 'full' | 'reduce'
  /** Simpan otomatis hasil yang disalin ke Koleksi. */
  autoSave: boolean
  /** Buat ringkasan AI untuk laporan mingguan saat dibuka. */
  weeklyAi: boolean
  apma?: { school?: Record<string, string>; design?: Record<string, unknown> }
  recentTools?: string[]
}

export const PALET: { id: Palet; nama: string; warna: string }[] = [
  { id: 'krem', nama: 'Irsyads', warna: '#66d6bf' },
  { id: 'hutan', nama: 'Hutan', warna: '#2c7a52' },
  { id: 'samudra', nama: 'Samudra', warna: '#3d9bd4' },
  { id: 'senja', nama: 'Senja', warna: '#a97fd6' },
  { id: 'aurora', nama: 'Aurora', warna: '#2aa396' },
  { id: 'tanah', nama: 'Tanah', warna: '#c8794a' },
]

const BAWAAN: Prefs = { theme: 'system', palette: 'krem', sound: false, motion: 'system', autoSave: false, weeklyAi: true }
const KUNCI = 'ruang:prefs'

type Nilai = { prefs: Prefs; set: (p: Partial<Prefs>) => void; gelap: boolean }
const Ctx = createContext<Nilai | null>(null)

function bacaLokal(): Prefs {
  try {
    return sharedAppearance({ ...BAWAAN, ...JSON.parse(localStorage.getItem(KUNCI) || '{}') })
  } catch {
    return sharedAppearance(BAWAAN)
  }
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState<Prefs>(bacaLokal)
  const [sistemGelap, setSistemGelap] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  const siapSimpan = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const f = () => setSistemGelap(mq.matches)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])

  // Tarik preferensi dari akun (ikut pindah perangkat).
  useEffect(() => {
    siapSimpan.current = false
    if (!user) return
    supabase
      .from('studio_preferences')
      .select('prefs')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.prefs) setPrefs((p) => mergeAccountAppearance(p, data.prefs as Partial<Prefs>))
        siapSimpan.current = true
      })
  }, [user])

  useEffect(() => {
    const sync = () => setPrefs(p => sharedAppearance(p))
    window.addEventListener('focus', sync)
    window.addEventListener('pageshow', sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener('focus', sync); window.removeEventListener('pageshow', sync); window.removeEventListener('storage', sync) }
  }, [])

  const gelap = prefs.theme === 'dark' || (prefs.theme === 'system' && sistemGelap)

  useEffect(() => {
    const el = document.documentElement
    publishAppearance(prefs)
    if (prefs.motion === 'reduce') el.dataset.motion = 'reduce'
    else delete el.dataset.motion
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', getComputedStyle(el).getPropertyValue('--bg').trim() || (gelap ? '#141414' : '#f7f8fa')))
    setSuaraAktif(prefs.sound)
    try {
      localStorage.setItem(KUNCI, JSON.stringify(prefs))
    } catch {
      /* penyimpanan penuh / diblokir */
    }
  }, [prefs, gelap])

  const set = useCallback(
    (p: Partial<Prefs>) => {
      if (p.theme || p.palette) window.__irsyadsHadAppearance = true
      setPrefs((lama) => {
        const baru = { ...lama, ...p }
        if (user && siapSimpan.current) {
          clearTimeout(timer.current)
          timer.current = setTimeout(() => {
            supabase.from('studio_preferences').upsert({ user_id: user.id, prefs: baru }).then()
          }, 700)
        }
        return baru
      })
    },
    [user],
  )

  const nilai = useMemo(() => ({ prefs, set, gelap }), [prefs, set, gelap])
  const reducedMotion = prefs.motion === 'reduce' ? 'always' : prefs.motion === 'full' ? 'never' : 'user'
  return (
    <Ctx.Provider value={nilai}>
      <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>
    </Ctx.Provider>
  )
}

export function usePrefs() {
  const v = useContext(Ctx)
  if (!v) throw new Error('usePrefs di luar PrefsProvider')
  return v
}
