import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { namaAlat } from '@/tools'

export type Ringkasan = {
  total: number
  chars: number
  active_days: number
  by_tool: { tool: string; n: number; chars: number }[]
  by_action: { tool: string; action: string; n: number }[]
  by_day: { day: string; n: number }[]
  by_hour: { hour: number; n: number }[]
  by_member: { user_id: string; name: string; n: number }[]
  items_created: number
}

export const KOSONG: Ringkasan = { total: 0, chars: 0, active_days: 0, by_tool: [], by_action: [], by_day: [], by_hour: [], by_member: [], items_created: 0 }

export type Cakupan = 'pribadi' | 'keluarga'

export function useRingkasan(dari: Date, sampai: Date, cakupan: Cakupan, aktif = true) {
  const [data, setData] = useState<Ringkasan | null>(null)
  const [galat, setGalat] = useState<string | null>(null)
  const kunci = `${dari.toISOString()}|${sampai.toISOString()}|${cakupan}|${aktif}`
  useEffect(() => {
    if (!aktif) return
    let batal = false
    setData(null)
    supabase.rpc('studio_report_summary', { p_from: dari.toISOString(), p_to: sampai.toISOString(), p_scope: cakupan }).then(({ data, error }) => {
      if (batal) return
      // Galat (mis. luring) tidak boleh membuat kerangka memuat berputar selamanya.
      if (error) {
        setGalat(error.message)
        setData(KOSONG)
      } else setData({ ...KOSONG, ...(data as Ringkasan) })
    })
    return () => {
      batal = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kunci])
  return { data, galat }
}

/** Awal hari lokal. */
export const awalHari = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const tambahHari = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

/** Isi hari kosong agar grafik tidak melompat. */
export function deretHarian(r: Ringkasan | null, dari: Date, jumlahHari: number) {
  const peta = new Map((r?.by_day ?? []).map((d) => [d.day, d.n]))
  return Array.from({ length: jumlahHari }, (_, i) => {
    const t = tambahHari(dari, i)
    const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
    return {
      label: jumlahHari <= 14 ? t.toLocaleDateString('id-ID', { weekday: 'short' }) : t.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      sub: t.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }),
      nilai: peta.get(iso) ?? 0,
      iso,
    }
  })
}

/** Rangkaian hari aktif berturut-turut hingga hari ini (atau kemarin). */
export function hitungBeruntun(r: Ringkasan | null) {
  const set = new Set((r?.by_day ?? []).filter((d) => d.n > 0).map((d) => d.day))
  const iso = (t: Date) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  let t = awalHari()
  if (!set.has(iso(t))) t = tambahHari(t, -1)
  let n = 0
  while (set.has(iso(t))) {
    n++
    t = tambahHari(t, -1)
  }
  return n
}

// Perkiraan detik yang dihemat per aksi (dibanding mengerjakan manual).
const HEMAT: Record<string, number> = { hitung: 20, salin: 25, simpan: 15, ubah: 30, putar: 20, pindai: 20, unduh: 15, pecahkan: 300, lafal: 10, kuis: 5, satuan: 30, berkas: 60, apma_modul: 5400, apma_blok: 900, apma_audit: 1200, laporan: 600, resep: 120 }

export function menitDihemat(r: Ringkasan | null) {
  if (!r) return 0
  return Math.round(r.by_action.reduce((a, x) => a + (HEMAT[x.action] ?? 5) * x.n, 0) / 60)
}

export type Wawasan = { ikon: 'naik' | 'turun' | 'bintang' | 'jam' | 'api' | 'saran' | 'keluarga' | 'dokumen'; teks: string; nada: 'baik' | 'netral' | 'perhatian' }

export function buatWawasan(r: Ringkasan | null, lalu: Ringkasan | null, cakupan: Cakupan, punyaKeluarga: boolean): Wawasan[] {
  if (!r) return []
  const w: Wawasan[] = []
  if (r.total === 0) {
    w.push({ ikon: 'saran', teks: 'Belum ada aktivitas pada periode ini. Mulai dari Pangalihtulis atau Kalkulator — laporan akan terisi otomatis.', nada: 'netral' })
    return w
  }
  if (lalu && lalu.total > 0) {
    const p = Math.round(((r.total - lalu.total) / lalu.total) * 100)
    if (Math.abs(p) >= 5)
      w.push(
        p > 0
          ? { ikon: 'naik', teks: `Aktivitas naik ${p}% dibanding periode sebelumnya (${lalu.total} → ${r.total}).`, nada: 'baik' }
          : { ikon: 'turun', teks: `Aktivitas turun ${Math.abs(p)}% dibanding periode sebelumnya. Mungkin sedang sibuk di luar layar — tidak apa-apa.`, nada: 'perhatian' },
      )
  } else if (lalu) {
    w.push({ ikon: 'naik', teks: `Periode pertama dengan aktivitas: ${r.total} aksi tercatat.`, nada: 'baik' })
  }
  const fav = r.by_tool.filter((t) => t.tool !== 'ai')[0]
  if (fav) w.push({ ikon: 'bintang', teks: `${namaAlat(fav.tool)} paling sering dipakai (${fav.n}× · ${Math.round((fav.n / r.total) * 100)}% aktivitas).`, nada: 'netral' })
  const jam = [...r.by_hour].sort((a, b) => b.n - a.n)[0]
  if (jam) w.push({ ikon: 'jam', teks: `${cakupan === 'keluarga' ? 'Keluarga' : 'Anda'} paling aktif sekitar pukul ${String(jam.hour).padStart(2, '0')}.00–${String((jam.hour + 1) % 24).padStart(2, '0')}.00.`, nada: 'netral' })
  const beruntun = hitungBeruntun(r)
  if (beruntun >= 2) w.push({ ikon: 'api', teks: `Rangkaian ${beruntun} hari aktif berturut-turut. Pertahankan!`, nada: 'baik' })
  if (r.chars > 3000) w.push({ ikon: 'dokumen', teks: `${r.chars.toLocaleString('id-ID')} karakter diproses — setara ± ${Math.max(1, Math.round(r.chars / 3000))} halaman A4.`, nada: 'netral' })
  if (cakupan === 'keluarga' && r.by_member.length) {
    const top = r.by_member[0]
    w.push({ ikon: 'keluarga', teks: `${top.name} paling aktif di keluarga (${top.n} aksi). ${r.by_member.length} anggota berkontribusi.`, nada: 'baik' })
  }
  // Saran
  const aksiSalin = r.by_action.filter((a) => a.action === 'salin').reduce((a, x) => a + x.n, 0)
  if (aksiSalin >= 10) w.push({ ikon: 'saran', teks: `Anda menyalin hasil ${aksiSalin}× — aktifkan “Simpan otomatis” di Pengaturan atau buat Resep Otomatisasi untuk langkah berulang.`, nada: 'netral' })
  if (!punyaKeluarga && cakupan === 'pribadi') w.push({ ikon: 'saran', teks: 'Buat akun keluarga agar koleksi, modul ajar, dan laporan bisa dibagikan antaranggota.', nada: 'netral' })
  const dipakai = new Set(r.by_tool.map((t) => t.tool))
  const belum = ['kalkulator', 'aksara', 'apma', 'otomatisasi', 'qr'].filter((t) => !dipakai.has(t))
  if (belum.length && w.length < 7) w.push({ ikon: 'saran', teks: `Belum mencoba ${belum.slice(0, 2).map(namaAlat).join(' dan ')}? Buka lewat Ctrl K.`, nada: 'netral' })
  return w
}
