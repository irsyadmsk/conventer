import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, keluarToolkit } from './supabase'
import { pesanGalatKeluar } from './hasil-keluar'
import { logoutMessages } from './logout-messages'
import { ikutiSesi } from './sso-follow'
import { setAkunAktivitas } from './activity'
import { pastikanAkun } from './account-scope'

export type Profil = { full_name: string | null; avatar_url: string | null; email: string | null }

type AuthNilai = {
  session: Session | null
  user: User | null
  profil: Profil | null
  memuat: boolean
  namaTampil: string
  gantiSandi: (sandi: string) => Promise<void>
  perbaruiNama: (nama: string) => Promise<void>
  keluar: () => Promise<boolean>
  keluarSibuk: boolean
}

const AuthCtx = createContext<AuthNilai | null>(null)


export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profil, setProfil] = useState<Profil | null>(null)
  const [memuat, setMemuat] = useState(true)
  const versiProfil = useRef(0)
  const penggunaAktif = useRef<string | null>(null)
  const logoutBusy = useRef(false), logoutActive = useRef(false), logoutRevision = useRef(0)
  const [keluarSibuk, setKeluarSibuk] = useState(false)
  const [galatKeluar, setGalatKeluar] = useState<string | null>(null)
  const [bahasa, setBahasa] = useState<'en' | 'id' | 'ar' | 'zh'>('id')
  const logoutAlert = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    logoutActive.current = true
    const runtime = window.IrsyadsPreferences
    if (runtime) setBahasa(runtime.get().language)
    const unsubscribe = runtime?.subscribe(values => setBahasa(values.language))
    return () => { logoutActive.current = false; logoutRevision.current++; unsubscribe?.() }
  }, [])
  useEffect(() => { if (galatKeluar) logoutAlert.current?.focus() }, [galatKeluar])

  const muatProfil = useCallback(async (u: User | null, versi = ++versiProfil.current) => {
    if ((u?.id ?? null) !== penggunaAktif.current) return
    if (!u) return setProfil(null)
    const { data } = await supabase.from('profiles').select('full_name, avatar_url, email').eq('id', u.id).maybeSingle()
    if (versi !== versiProfil.current || u.id !== penggunaAktif.current) return
    setProfil(
      data ?? {
        full_name: (u.user_metadata?.full_name as string) ?? null,
        avatar_url: (u.user_metadata?.avatar_url as string) ?? null,
        email: u.email ?? null,
      },
    )
  }, [])

  useEffect(() => {
    // Mode pratinjau desain — HANYA di server dev (dibuang dari build produksi).
    if (import.meta.env.DEV && localStorage.getItem('ruang:pratinjau') === '1') {
      const u = { id: '00000000-0000-4000-8000-000000000000', email: 'pratinjau@contoh.id', user_metadata: { full_name: 'Pratinjau Desain' } } as unknown as User
      setSession({ user: u } as Session)
      penggunaAktif.current = u.id
      setAkunAktivitas(u.id)
      setProfil({ full_name: 'Pratinjau Desain', avatar_url: null, email: u.email ?? null })
      setMemuat(false)
      return
    }
    let hidup = true
    let profilUser: string | null | undefined
    const terapkan = (s: Session | null, force = false) => {
      if (!hidup) return
      setSession(current => !force && current?.user.id === s?.user.id && current?.access_token === s?.access_token && current?.refresh_token === s?.refresh_token ? current : s)
      setMemuat(false)
      const id = s?.user.id ?? null
      if (penggunaAktif.current !== id) { logoutRevision.current++; setGalatKeluar(null) }
      penggunaAktif.current = id
      setAkunAktivitas(id)
      if (!force && id === profilUser) return
      profilUser = id
      const versi = ++versiProfil.current
      setProfil(null)
      // Keep async Supabase work outside onAuthStateChange's lock.
      setTimeout(() => { if (hidup && versi === versiProfil.current) void muatProfil(s?.user ?? null, versi) }, 0)
    }
    const pantau = ikutiSesi(supabase.auth, terapkan, () => { if (hidup) setMemuat(false) })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!hidup) return
      pantau.authChanged(s)
      if (event === 'USER_UPDATED') terapkan(s, true)
      if (event === 'PASSWORD_RECOVERY' && !location.pathname.startsWith('/atur-sandi')) {
        location.assign('/atur-sandi')
      }
    })
    return () => {
      hidup = false
      setAkunAktivitas(null)
      versiProfil.current++
      pantau.stop()
      sub.subscription.unsubscribe()
    }
  }, [muatProfil])

  const user = session?.user ?? null
  const namaTampil =
    profil?.full_name?.trim() || (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Pengguna'

  const nilai = useMemo<AuthNilai>(
    () => ({
      session,
      user,
      profil,
      memuat,
      namaTampil,
      async gantiSandi(sandi) {
        await pastikanAkun(supabase.auth, user?.id, () => penggunaAktif.current === user?.id)
        const { error } = await supabase.auth.updateUser({ password: sandi })
        if (error) throw error
      },
      async perbaruiNama(nama) {
        const target = user?.id
        if (!target || penggunaAktif.current !== target) throw new Error('Akun berubah. Buka kembali pengaturan profil.')
        const { error } = await supabase.auth.updateUser({ data: { full_name: nama.trim() } })
        if (error) throw error
        if (penggunaAktif.current !== target) throw new Error('Akun berubah. Buka kembali pengaturan profil.')
        if (user) await supabase.from('profiles').update({ full_name: nama.trim() }).eq('id', user.id)
        if (penggunaAktif.current !== target) throw new Error('Akun berubah. Buka kembali pengaturan profil.')
        await supabase.rpc('studio_update_display_name', { p_display: nama.trim() })
        await muatProfil(user)
      },
      async keluar() {
        if (logoutBusy.current || !user) return false
        const owner = user.id, revision = logoutRevision.current
        logoutBusy.current = true; setKeluarSibuk(true); setGalatKeluar(null)
        try {
          await keluarToolkit(owner)
          if (!logoutActive.current || penggunaAktif.current !== owner || logoutRevision.current !== revision) return false
          setSession(null); setProfil(null); penggunaAktif.current = null; versiProfil.current++
          setAkunAktivitas(null)
          return true
        } catch (error) {
          if (logoutActive.current && penggunaAktif.current === owner && logoutRevision.current === revision) setGalatKeluar(pesanGalatKeluar(error))
          return false
        } finally { logoutBusy.current = false; if (logoutActive.current) setKeluarSibuk(false) }
      },
      keluarSibuk,
    }),
    [session, user, profil, memuat, namaTampil, muatProfil, keluarSibuk],
  )

  const pesanKeluar = galatKeluar ? (bahasa === 'id' ? galatKeluar : logoutMessages[galatKeluar]?.[bahasa] || galatKeluar) : null
  return <AuthCtx.Provider value={nilai}>{children}{pesanKeluar && <p ref={logoutAlert} role="alert" tabIndex={-1} className="fixed bottom-4 right-4 z-[90] max-w-sm rounded-xl border border-line bg-surface p-4 text-sm text-ink shadow-lg">{pesanKeluar}</p>}</AuthCtx.Provider>
}

export function useAuth() {
  const v = useContext(AuthCtx)
  if (!v) throw new Error('useAuth di luar AuthProvider')
  return v
}
