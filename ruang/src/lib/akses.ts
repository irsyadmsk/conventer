import { useCallback, useEffect, useState } from 'react'
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
  const [akses, setAkses] = useState<StatusAkses | null>(null)

  const muat = useCallback(async () => {
    if (!user) return setAkses(KOSONG)
    const { data, error } = await supabase.rpc('studio_status_akses', { p_fitur: fitur })
    setAkses(error ? KOSONG : { ...KOSONG, ...(data as StatusAkses) })
  }, [user, fitur])

  useEffect(() => {
    muat()
  }, [muat])

  const ajukan = useCallback(
    async (alasan: string) => {
      const { error } = await supabase.rpc('studio_ajukan_akses', { p_fitur: fitur, p_alasan: alasan })
      if (error) throw error
      await muat()
    },
    [fitur, muat],
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
