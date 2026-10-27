# Irsyads Toolkit

Aplikasi utama untuk **app.irsyads.com** berada di **`ruang/`**. Gunakan direktori ini untuk pengembangan, pengujian, dan build. Frontend `web/` dan aplikasi Android lama dipensiunkan agar tidak menjadi sasaran pengembangan yang keliru.

## Menjalankan aplikasi utama

```sh
cd ruang
npm ci
npm run dev
```

Ikuti alamat yang dicetak Vite (bawaan `http://localhost:5173`). Konfigurasi akun menggunakan `.env` lokal sesuai `ruang/.env.example` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, proyek Supabase irsyads); jangan memasukkan rahasia ke Git.

## Build dan pengujian

```sh
cd ruang
npm run build
node --experimental-strip-types --test tests/*.test.mjs
```

Hasil build berada di `ruang/dist/`. Konfigurasi Worker dan domain produksi tetap di `ruang/wrangler.jsonc`. Build lokal bukan deployment; publikasi produksi dilakukan terpisah dengan persetujuan pemilik.

## Struktur utama

- `ruang/src/components/`: shell, navigasi, dan komponen UI Toolkit.
- `ruang/src/pages/`: dashboard dan perkakas yang sudah ada.
- `ruang/src/features/`: fitur aplikasi, termasuk LessonCraft dan Studio Kreasi.
- `ruang/src/legacy/`: mesin konversi yang **masih digunakan** oleh aplikasi utama; bukan frontend lama.
- `ruang/public/`: aset aplikasi dan runtime identitas bersama.
- `ruang/supabase/`: backend dan migrasi yang sudah ada.
- `ruang/tests/`: pengujian aplikasi.

Panduan aplikasi utama: [ruang/README.md](ruang/README.md). Lisensi proyek tetap dipertahankan dalam `LICENSE`; lisensi dependensi font disertakan bersama vendornya.

## Untuk AI dan pengembang

- Nama repo dan folder `conventer` dipakai apa adanya oleh remote dan rujukan dokumen; jangan diganti.
- Semua kerja di `ruang/`. Folder `web/` sudah dipindah ke `../_AMAN-HAPUS`; jangan dibuat ulang.
- Akun dibagi dengan irsyads.com (Supabase proyek irsyads). Login lewat id.irsyads.com. Perubahan skema Ruang tetap migrasi di `ruang/supabase/migrations/` dan butuh persetujuan pemilik sebelum diterapkan.
- Salinan dari monorepo irsyads yang tidak boleh disunting di sini: `ruang/src/features/apma/lesson-template.ts`, `ruang/src/irsyads-v1/`, `ruang/public/irsyads-v1/`.
- AI cloud (`ruang-ai`) dijeda; hanya kuota gratis yang boleh dipakai.
- `policy.md` adalah kebijakan privasi aplikasi Android lama (kamera untuk barcode, penyimpanan untuk berbagi gambar).
- `PERAPIAN-2026-10-09.md` dan berkas `ruang/*_HANDOFF.md` adalah riwayat; cocokkan dengan kode.
- Branch saat ini `codex/approved-service-brand-20261010` dengan banyak perubahan lokal belum di-commit (termasuk penghapusan `.idea/`). Jangan dibersihkan tanpa izin.
