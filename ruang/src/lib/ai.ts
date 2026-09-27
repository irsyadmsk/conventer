import { supabase } from './supabase'
import { catat } from './activity'

export type TugasAI = 'apma_modul' | 'apma_blok' | 'apma_audit' | 'laporan' | 'tulis' | 'status'

export type HasilAI = {
  teks?: string
  json?: Record<string, unknown>
  model?: string
  provider?: string
  sisa_hari_ini?: number
  terpotong?: boolean
}

/**
 * Semua AI lewat Edge Function `ruang-ai`: kunci penyedia tidak pernah sampai
 * ke peramban, dan tiap akun punya kuota harian.
 */
export async function panggilAI(tugas: TugasAI, isi: Record<string, unknown> = {}): Promise<HasilAI> {
  const { data, error } = await supabase.functions.invoke('ruang-ai', { body: { tugas, ...isi } })
  if (error) {
    let pesan = error.message
    try {
      const ctx = (error as { context?: Response }).context
      if (ctx && typeof ctx.json === 'function') {
        const j = await ctx.json()
        if (j?.error) pesan = j.error
      }
    } catch {
      /* biarkan pesan bawaan */
    }
    throw new Error(pesan)
  }
  if (tugas !== 'status') catat('ai', tugas)
  return data as HasilAI
}
