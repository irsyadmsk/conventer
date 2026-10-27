import { supabase } from './supabase'

/**
 * Jejak pemakaian untuk Laporan. Hanya nama alat, aksi, dan jumlah karakter —
 * isi teks pengguna TIDAK pernah dikirim.
 */
type Jejak = { user_id: string; tool: string; action: string; chars: number; meta: Record<string, unknown> }

let antrean: Jejak[] = []
let timer: ReturnType<typeof setTimeout> | undefined
const terakhir = new Map<string, number>()
let akun: string | null = null
let revision = 0

export function setAkunAktivitas(id: string | null) {
  if (akun === id) return
  akun = id; revision++
  clearTimeout(timer); antrean = []; terakhir.clear()
}

async function kirim() {
  if (!antrean.length) return
  const kiriman = antrean
  const captured = revision
  antrean = []
  const { data } = await supabase.auth.getSession()
  if (captured !== revision || !akun || data.session?.user.id !== akun) return
  const { error } = await supabase.from('studio_activity').insert(kiriman)
  if (error && captured === revision) {
    // Gagal (mis. luring): simpan kembali sekali agar tidak hilang.
    antrean = kiriman.concat(antrean).slice(-200)
  }
}

export function catat(tool: string, action: string, chars = 0, meta: Record<string, unknown> = {}) {
  if (!akun) return
  // Aksi berulang yang sama dalam 4 detik dihitung sekali (mis. mengetik).
  const k = `${tool}:${action}`
  const now = Date.now()
  if (action === 'ubah' && now - (terakhir.get(k) ?? 0) < 4000) return
  terakhir.set(k, now)
  antrean.push({ user_id: akun, tool, action, chars: Math.max(0, Math.min(chars, 1_000_000)), meta })
  clearTimeout(timer)
  timer = setTimeout(kirim, 3000)
}

if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void kirim()
  })
}
