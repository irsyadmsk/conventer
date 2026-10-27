import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth'
import { pastikanAkun } from './account-scope'

export type Peran = 'owner' | 'admin' | 'anggota' | 'anak'
export type Keluarga = { id: string; name: string; owner_id: string; invite_code: string; created_at: string }
export type Anggota = { family_id: string; user_id: string; role: Peran; display_name: string; joined_at: string }

export const LABEL_PERAN: Record<Peran, string> = {
  owner: 'Pemilik',
  admin: 'Admin',
  anggota: 'Anggota',
  anak: 'Anak',
}

type Nilai = {
  keluarga: Keluarga | null
  anggota: Anggota[]
  peranSaya: Peran | null
  memuat: boolean
  bisaKelola: boolean
  muatUlang: () => Promise<void>
  buat: (nama: string, namaSaya: string) => Promise<void>
  gabung: (kode: string, namaSaya: string) => Promise<void>
  keluar: () => Promise<void>
  ubahPeran: (userId: string, peran: Exclude<Peran, 'owner'>) => Promise<void>
  keluarkan: (userId: string) => Promise<void>
  kodeBaru: () => Promise<string>
  ubahNama: (nama: string) => Promise<void>
}

const Ctx = createContext<Nilai | null>(null)

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [keluarga, setKeluarga] = useState<Keluarga | null>(null)
  const [anggota, setAnggota] = useState<Anggota[]>([])
  const [memuat, setMemuat] = useState(true)
  const active = useRef(true)
  useEffect(() => { active.current = true; return () => { active.current = false } }, [])

  const muatUlang = useCallback(async () => {
    if (!user) {
      setKeluarga(null)
      setAnggota([])
      setMemuat(false)
      return
    }
    const { data: saya } = await supabase.from('studio_family_members').select('family_id').eq('user_id', user.id).maybeSingle()
    if (!saya) {
      setKeluarga(null)
      setAnggota([])
      setMemuat(false)
      return
    }
    const [{ data: k }, { data: a }] = await Promise.all([
      supabase.from('studio_families').select('*').eq('id', saya.family_id).maybeSingle(),
      supabase.from('studio_family_members').select('*').eq('family_id', saya.family_id).order('joined_at'),
    ])
    setKeluarga((k as Keluarga) ?? null)
    setAnggota((a as Anggota[]) ?? [])
    setMemuat(false)
  }, [user])

  useEffect(() => {
    setMemuat(true)
    muatUlang()
  }, [muatUlang])

  // Anggota bertambah/berubah di perangkat lain → segarkan.
  useEffect(() => {
    if (!user) return
    const ch = supabase
      .channel(`ruang-keluarga-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'studio_family_members' }, () => muatUlang())
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
  }, [user, muatUlang])

  const peranSaya = (anggota.find((a) => a.user_id === user?.id)?.role ?? null) as Peran | null

  const rpc = useCallback(
    async (fn: string, args?: Record<string, unknown>) => {
      await pastikanAkun(supabase.auth, user?.id, () => active.current)
      const { data, error } = await supabase.rpc(fn, args)
      if (error) throw error
      await muatUlang()
      return data
    },
    [muatUlang, user],
  )

  const nilai = useMemo<Nilai>(
    () => ({
      keluarga,
      anggota,
      peranSaya,
      memuat,
      bisaKelola: peranSaya === 'owner' || peranSaya === 'admin',
      muatUlang,
      buat: async (nama, namaSaya) => void (await rpc('studio_create_family', { p_name: nama, p_display: namaSaya })),
      gabung: async (kode, namaSaya) => void (await rpc('studio_join_family', { p_code: kode, p_display: namaSaya })),
      keluar: async () => void (await rpc('studio_leave_family')),
      ubahPeran: async (userId, peran) => void (await rpc('studio_set_member_role', { p_user: userId, p_role: peran })),
      keluarkan: async (userId) => void (await rpc('studio_remove_member', { p_user: userId })),
      kodeBaru: async () => (await rpc('studio_rotate_invite')) as string,
      ubahNama: async (nama) => void (await rpc('studio_update_family', { p_name: nama })),
    }),
    [keluarga, anggota, peranSaya, memuat, muatUlang, rpc],
  )

  return <Ctx.Provider value={nilai}>{children}</Ctx.Provider>
}

export function useFamily() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFamily di luar FamilyProvider')
  return v
}
