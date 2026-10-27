import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth'

export type StatusAkses = {
  admin: boolean
  boleh: boolean
  status: 'menunggu' | 'disetujui' | 'ditolak' | 'dicabut' | null
  diminta_at?: string | null
  alasan?: string | null
}

const KOSONG: StatusAkses = { admin: false, boleh: false, status: null }

/**
 * Akses fitur privat (saat ini: Modul Ajar). Keputusan akhirnya ditegakkan
 * di basis data dan Edge Function — hook ini hanya untuk tampilan.
 */
export function useAkses(fitur: 'apma' = 'apma') {
  const { user } = useAuth()
  const uid = user?.id ?? null
  const owner = useRef(uid)
  owner.current = uid
  const generation = useRef(0)
  const [hasil, setHasil] = useState<{ owner: string | null; akses: StatusAkses } | null>(null)
  const akses = hasil?.owner === uid ? hasil.akses : null

  const muat = useCallback(async () => {
    const request = ++generation.current
    if (!uid) { setHasil({ owner: null, akses: KOSONG }); return }
    try {
      const { data, error } = await supabase.rpc('studio_status_akses', { p_fitur: fitur })
      if (request !== generation.current || owner.current !== uid) return
      // A failed refresh must close the UI, never retain an earlier approval.
      const valid = !error && data && typeof data.boleh === 'boolean' && typeof data.admin === 'boolean'
      setHasil({ owner: uid, akses: valid ? { ...KOSONG, ...(data as StatusAkses) } : KOSONG })
    } catch {
      if (request === generation.current && owner.current === uid) setHasil({ owner: uid, akses: KOSONG })
    }
  }, [uid, fitur])

  useEffect(() => {
    void muat()
    const refresh = () => { if (!document.hidden) void muat() }
    addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      generation.current++
      removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [muat])

  const ajukan = useCallback(
    async (alasan: string) => {
      if (!uid || owner.current !== uid) throw new Error('Sesi berubah. Masuk kembali.')
      const { error } = await supabase.rpc('studio_ajukan_akses', { p_fitur: fitur, p_alasan: alasan })
      if (error) throw error
      if (owner.current === uid) await muat()
    },
    [fitur, muat, uid],
  )

  return { akses, memuat: akses === null, muatUlang: muat, ajukan }
}

/** Jumlah permintaan akses yang menunggu — hanya terisi untuk admin (RLS). */
export function usePermintaanMenunggu() {
  const { akses } = useAkses('apma')
  const [jumlah, setJumlah] = useState(0)

  useEffect(() => {
    if (!akses?.admin) return
    const muat = () =>
      supabase
        .from('studio_izin_fitur')
        .select('user_id', { count: 'exact', head: true })
        .eq('status', 'menunggu')
        .then(({ count }) => setJumlah(count ?? 0))
    muat()
    addEventListener('focus', muat)
    return () => removeEventListener('focus', muat)
  }, [akses?.admin])

  return jumlah
}
