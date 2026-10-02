import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Ruang bisa dipasang seperti aplikasi (HP/laptop). Alat yang tidak butuh
    // server (aksara, kalkulator, codec, sandi, dsb.) tetap jalan saat luring;
    // data akun (Supabase) tidak pernah di-cache oleh service worker.
    VitePWA({
      // 'prompt': versi baru menunggu persetujuan pengguna (lihat PembaruanApp).
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'fonts/noto-sundanese.woff2', 'ikon/apple-touch-icon.png'],
      manifest: {
        name: 'Ruang · Irsyads',
        short_name: 'Ruang',
        description: 'Ruang kerja keluarga: aksara Sunda, kode & sandi, kalkulator lengkap, modul ajar, koleksi tersinkron, dan laporan otomatis.',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#192a40',
        background_color: '#f7f8fa',
        icons: [
          { src: '/ikon/ikon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/ikon/ikon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/ikon/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Kalkulator', url: '/kalkulator', icons: [{ src: '/ikon/ikon-192.png', sizes: '192x192' }] },
          { name: 'Pangalihtulis', url: '/aksara', icons: [{ src: '/ikon/ikon-192.png', sizes: '192x192' }] },
          { name: 'Laporan', url: '/laporan', icons: [{ src: '/ikon/ikon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: { cacheName: 'font-google', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // Cap waktu build — ditampilkan di Pengaturan agar mudah memastikan versi terbaru sudah terpasang.
  define: { __VERSI_BUILD__: JSON.stringify(new Date().toISOString()) },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/@supabase')) return 'supabase'
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) return 'motion'
          if (id.includes('node_modules/gsap')) return 'gsap'
        },
      },
    },
  },
  server: { port: 5173 },
  preview: { port: 4173 },
})
