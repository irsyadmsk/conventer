import { createClient } from '@supabase/supabase-js'
import { penyimpananSesi } from './sesi'
import { bindPreferenceAccount } from './preferences-account'
import { keluarTerikat } from './keluar-terikat'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

if (!url || !key) {
  // Gagal keras lebih baik daripada layar kosong yang membingungkan.
  throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY belum diatur di .env')
}

export const supabase = createClient(url, key, {
  auth: {
    storage: penyimpananSesi,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: { params: { eventsPerSecond: 5 } },
})

bindPreferenceAccount(supabase)
export function keluarToolkit(expectedOwner: string) {
  const storageKey = `sb-${new URL(url).hostname.split('.')[0]}-auth-token`
  return keluarTerikat({ url, publicKey: key, storageKey, expectedOwner })
}

/** Pesan galat Supabase/Postgres yang ramah dibaca. */
export function pesanGalat(e: unknown): string {
  if (!e) return 'Terjadi kesalahan.'
  const m = typeof e === 'string' ? e : (e as { message?: string }).message ?? 'Terjadi kesalahan.'
  const peta: Record<string, string> = {
    'Invalid login credentials': 'Email atau kata sandi salah.',
    'Email not confirmed': 'Email belum dikonfirmasi. Cek kotak masuk Anda.',
    'User already registered': 'Email ini sudah terdaftar. Silakan masuk.',
    'Password should be at least 6 characters.': 'Kata sandi minimal 6 karakter.',
    'Failed to fetch': 'Tidak dapat terhubung. Periksa koneksi internet Anda.',
    'Email rate limit exceeded': 'Terlalu banyak permintaan email. Coba lagi beberapa menit lagi.',
  }
  for (const [k, v] of Object.entries(peta)) if (m.includes(k)) return v
  return m
}
