import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type Profil = { full_name: string | null; avatar_url: string | null; email: string | null }

type AuthNilai = {
  session: Session | null
  user: User | null
  profil: Profil | null
  memuat: boolean
  namaTampil: string
  masuk: (email: string, sandi: string) => Promise<void>
  daftar: (nama: string, email: string, sandi: string) => Promise<{ perluKonfirmasi: boolean }>
  masukGoogle: () => Promise<void>
  lupaSandi: (email: string) => Promise<void>
  gantiSandi: (sandi: string) => Promise<void>
  perbaruiNama: (nama: string) => Promise<void>
  keluar: () => Promise<void>
}

const AuthCtx = createContext<AuthNilai | null>(null)

const alamatKembali = () => `${window.location.origin}/`

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profil, setProfil] = useState<Profil | null>(null)
  const [memuat, setMemuat] = useState(true)

  const muatProfil = useCallback(async (u: User | null) => {
    if (!u) return setProfil(null)
    const { data } = await supabase.from('profiles').select('full_name, avatar_url, email').eq('id', u.id).maybeSingle()
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
      setProfil({ full_name: 'Pratinjau Desain', avatar_url: null, email: u.email ?? null })
      setMemuat(false)
      return
    }
    let hidup = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!hidup) return
      setSession(data.session)
      await muatProfil(data.session?.user ?? null)
      setMemuat(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'SIGNED_OUT') {
        // Jangan await di dalam callback auth (bisa mengunci klien).
        setTimeout(() => muatProfil(s?.user ?? null), 0)
      }
      if (event === 'PASSWORD_RECOVERY' && !location.pathname.startsWith('/atur-sandi')) {
        location.assign('/atur-sandi')
      }
    })
    return () => {
      hidup = false
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
      async masuk(email, sandi) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: sandi })
        if (error) throw error
      },
      async daftar(nama, email, sandi) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: sandi,
          options: { data: { full_name: nama.trim() }, emailRedirectTo: alamatKembali() },
        })
        if (error) throw error
        // Supabase mengembalikan user tanpa identitas bila email sudah dipakai.
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error('User already registered')
        }
        return { perluKonfirmasi: !data.session }
      },
      async masukGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: alamatKembali() } })
        if (error) throw error
      },
      async lupaSandi(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/atur-sandi` })
        if (error) throw error
      },
      async gantiSandi(sandi) {
        const { error } = await supabase.auth.updateUser({ password: sandi })
        if (error) throw error
      },
      async perbaruiNama(nama) {
        const { error } = await supabase.auth.updateUser({ data: { full_name: nama.trim() } })
        if (error) throw error
        if (user) await supabase.from('profiles').update({ full_name: nama.trim() }).eq('id', user.id)
        await supabase.rpc('studio_update_display_name', { p_display: nama.trim() })
        await muatProfil(user)
      },
      async keluar() {
        await supabase.auth.signOut()
      },
    }),
    [session, user, profil, memuat, namaTampil, muatProfil],
  )

  return <AuthCtx.Provider value={nilai}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const v = useContext(AuthCtx)
  if (!v) throw new Error('useAuth di luar AuthProvider')
  return v
}
