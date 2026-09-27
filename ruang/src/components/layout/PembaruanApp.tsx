import { useEffect, useRef } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useToast } from '@/components/ui/Toast'

const SEJAM = 60 * 60 * 1000
/** Selama jendela ini sejak halaman dibuka, belum ada pekerjaan yang bisa hilang. */
const JENDELA_AWAL = 12_000

/**
 * Menerapkan versi baru Ruang.
 *
 * Dulu hanya memberi tahu lewat toast. Masalahnya, versi yang menunggu baru
 * aktif setelah tombol "Muat ulang sekarang" ditekan — memuat ulang biasa
 * atau membuka ulang PWA tetap menyajikan bundel lama, jadi perbaikan tidak
 * pernah sampai ke ponsel yang toast-nya terlewat.
 *
 * Sekarang:
 * - versi baru yang terdeteksi saat aplikasi baru dibuka langsung dipakai
 *   (pengguna belum sempat mengetik apa pun);
 * - pemeriksaan pembaruan berjalan setiap aplikasi kembali ke depan, bukan
 *   hanya sejam sekali (ponsel jarang membiarkan interval berjalan);
 * - di tengah pemakaian tetap toast, TIDAK muat ulang paksa: pengguna
 *   mungkin sedang menyunting modul yang belum tersimpan.
 */
export function PembaruanApp() {
  const toast = useToast()
  const dimuat = useRef(performance.now())
  const {
    needRefresh: [perluMuatUlang],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      if (!reg) return
      const periksa = () => reg.update().catch(() => {})
      setInterval(periksa, SEJAM)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') periksa()
      })
    },
  })

  useEffect(() => {
    if (!perluMuatUlang) return
    if (performance.now() - dimuat.current < JENDELA_AWAL) {
      updateServiceWorker(true)
      return
    }
    toast('Versi baru Ruang tersedia', {
      nada: 'info',
      isi: 'Simpan pekerjaan Anda, lalu muat ulang untuk memakai versi terbaru.',
      lama: 60_000,
      aksi: { label: 'Muat ulang sekarang', jalankan: () => updateServiceWorker(true) },
    })
  }, [perluMuatUlang, toast, updateServiceWorker])

  return null
}
