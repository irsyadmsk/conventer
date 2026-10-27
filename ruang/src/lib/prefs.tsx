import { sharedAppearance, SHARED_PALETTE, mergeAccountAppearance } from './appearance'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { supabase } from './supabase'
import { useAuth } from './auth'
import { kunciDrafAkun, pastikanAkun } from './account-scope'
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

function bacaLokal(key: string): Prefs {
  try {
    return sharedAppearance({ ...BAWAAN, ...JSON.parse(localStorage.getItem(key) || '{}') })
  } catch {
    return sharedAppearance(BAWAAN)
  }
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const localKey = user ? kunciDrafAkun(KUNCI, user.id) : KUNCI + ':tamu'
  const [prefs, setPrefs] = useState<Prefs>(() => bacaLokal(localKey))
  const [sistemGelap, setSistemGelap] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  const siapSimpan = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const active = useRef(true)
  useEffect(() => {
    active.current = true
    return () => { active.current = false; clearTimeout(timer.current) }
  }, [])

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
        if (!active.current) return
        if (data?.prefs) setPrefs((p) => mergeAccountAppearance(p, data.prefs as Partial<Prefs>))
        siapSimpan.current = true
      })
  }, [user])

  useEffect(() => {
    const sync = () => setPrefs(p => sharedAppearance(p))
    const unsubscribe = window.IrsyadsPreferences?.subscribe(sync)
    window.addEventListener('focus', sync)
    window.addEventListener('pageshow', sync)
    window.addEventListener('storage', sync)
    return () => { unsubscribe?.(); window.removeEventListener('focus', sync); window.removeEventListener('pageshow', sync); window.removeEventListener('storage', sync) }
  }, [])

  const gelap = prefs.theme === 'dark' || (prefs.theme === 'system' && sistemGelap)

  useEffect(() => {
    const el = document.documentElement
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', getComputedStyle(el).getPropertyValue('--bg').trim() || (gelap ? '#141414' : '#f7f8fa')))
    setSuaraAktif(prefs.sound)
    try {
      const text = JSON.stringify(prefs)
      if (localStorage.getItem(localKey) !== text) localStorage.setItem(localKey, text)
    } catch {
      /* penyimpanan penuh / diblokir */
    }
  }, [prefs, gelap, localKey])

  const set = useCallback(
    (p: Partial<Prefs>) => {
      if (p.theme || p.palette) window.__irsyadsHadAppearance = true
      if (p.theme || p.palette || p.motion) window.dispatchEvent(new CustomEvent('irsyads-appearance-change', { detail: {
        ...(p.theme ? {theme:p.theme} : {}), ...(p.palette ? {palette:SHARED_PALETTE[p.palette]} : {}), ...(p.motion ? {motion:p.motion} : {}),
      } }))
      setPrefs((lama) => {
        const baru = { ...lama, ...p }
        if (JSON.stringify(baru) === JSON.stringify(lama)) return lama
        if (user && siapSimpan.current) {
          clearTimeout(timer.current)
          timer.current = setTimeout(async () => {
            try {
              await pastikanAkun(supabase.auth, user.id, () => active.current)
              await supabase.from('studio_preferences').upsert({ user_id: user.id, prefs: baru })
            } catch { /* Preserve the local account preferences if the session changed. */ }
          }, 700)
        }
        return baru
      })
    },
    [user],
  )

  const nilai = useMemo(() => ({ prefs, set, gelap }), [prefs, set, gelap])
  const reducedMotion = prefs.motion === 'reduce' ? 'always' : 'user'
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
