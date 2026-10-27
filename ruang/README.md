# Ruang — ruang kerja keluarga (app.irsyads.com)

Penerus web **Text Converter** (`../web`) dan **APMA**, dibangun ulang dengan React 19 + Vite + Tailwind 4 + framer-motion, memakai akun Supabase yang sama dengan irsyads.com.

## Fitur

| Area | Isi |
|---|---|
| Akun | Wajib masuk/daftar (email & sandi, opsional Google), lupa/atur ulang sandi, satu akun dengan irsyads.com |
| Keluarga | Buat/gabung via kode 6 karakter, tautan, atau QR; peran Pemilik/Admin/Anggota/Anak; maks. 12 anggota; sinkron realtime |
| Aksara Sunda | Pangalihtulis dua arah, papan ketik aksara, pemenggalan suku kata, lafal audio, Kamus + kuis kilat, Pedoman |
| Kode & Sandi | Morse Studio (audio, osiloskop, senter kamera, strobo, kunci telegraf), Codec (deteksi format otomatis), Caesar/Vigenère + pemecah otomatis, Hash teks & berkas |
| Kalkulator | Ilmiah (pengurai aman tanpa `eval`), Programmer (bit, BigInt), Satuan (termasuk tumbak/bata/ons/kuintal), Persen & diskon bertingkat, Tanggal (usia, weton, Hijriah), Nilai rapor & statistik kelas, Keuangan (cicilan anuitas/flat, zakat, bagi tagihan, target tabungan) |
| Teks | Gaya teks Unicode, Analisis naskah + durasi bicara + teleprompter, QR/Barcode (buat & pindai) |
| Modul Ajar (APMA) | Wizard 2 langkah → modul disusun dari templat lokal (`src/features/apma/lesson-template.ts`); akses diatur admin lewat Studio; editor blok (seret urut), Copilot, Audit AI + perbaikan istilah regulasi, desain dokumen, kop sekolah, riwayat versi, ekspor PDF/Word/HTML/Markdown, bisa dibagikan ke keluarga |
| Koleksi | Semua hasil tersimpan, sematkan, bagikan ke keluarga, ekspor JSON |
| Otomatisasi | Resep berantai (seret urut, pratinjau tiap langkah), proses massal per baris + CSV, templat, simpan otomatis |
| Laporan | KPI vs periode lalu, grafik harian, alat terpakai, peta jam, kontribusi anggota, wawasan otomatis, ringkasan AI, arsip mingguan otomatis (cron Senin 00.10 WIB), cetak/CSV |

## Backend (proyek Supabase `irsyads`)

- Migrasi: `supabase/migrations/20260924000001_ruang_core.sql` (tabel `studio_*`, RLS, RPC keluarga, ringkasan laporan, cron).
- Migrasi akses APMA: `supabase/migrations/20260924000002_ruang_akses_apma.sql`. Hak akses dibaca `src/lib/akses.ts` (terikat UID akun, gagal tertutup saat galat baca).
- Edge Function: `supabase/functions/ruang-ai` — memakai secret yang sama dengan `ai-bantu` (`GEMINI_API_KEY`, `AI_API_KEY`), kuota harian per akun `RUANG_KUOTA_HARIAN` (bawaan 30). Kunci AI tidak pernah sampai ke peramban. **Saat ini dijeda:** `src/lib/ai.ts` (`panggilAI`) tidak memanggil cloud karena kuota gratis/tagihan belum terverifikasi. Jangan mengaktifkannya tanpa persetujuan pemilik.
- Pelacakan aktivitas hanya menyimpan nama alat, aksi, dan jumlah karakter — **bukan isi teks**.

## Menjalankan

```bash
npm install
npm run dev
```

`.env` (lihat `.env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.

Mode pratinjau desain (hanya `npm run dev`, dibuang dari build): jalankan `localStorage.setItem('ruang:pratinjau','1')` di konsol untuk melihat halaman tanpa masuk.

## Rilis ke app.irsyads.com

Ruang ditayangkan sebagai Cloudflare Worker `ruang` dengan Static Assets (`wrangler.jsonc`: aset `./dist`, `not_found_handling: single-page-application`, custom domain `app.irsyads.com`). Tidak ada workflow GitHub Actions; rilis = `npm run build` lalu `npx wrangler deploy`, **hanya setelah pemilik menyetujui rilis itu**. (Petunjuk lama tentang Pages/Netlify dan `public/_redirects` sudah tidak berlaku.)

Pengaturan Supabase Auth yang dibutuhkan: `https://app.irsyads.com/**` di Redirect URLs. Masuk dilakukan lewat id.irsyads.com (`src/lib/sso.ts`, `sso-follow.ts`).

## Peta kode (untuk AI/pengembang)

| Lokasi | Isi |
|---|---|
| `src/App.tsx`, `src/tools.tsx` | Rute dan daftar alat |
| `src/pages/` | Halaman: `Beranda`, `Keluarga`, `Koleksi`, `Laporan`, `Otomatisasi`, `Pengaturan`; subfolder `aksara/`, `kalkulator/`, `sandi/`, `teks/`, `auth/` |
| `src/features/apma/` | LessonCraft/APMA: `Wizard`, `Editor`, `KelolaAkses`, `Terkunci`, `lesson-template.ts` (**salinan identik** `irsyads/packages/isi/src/lesson-template.ts`; jangan disunting di sini) |
| `src/features/kreasi/` | Studio Kreasi (desain di `../DESIGN-KREASI.md`), font & glyph di `vendor/` |
| `src/legacy/` | Mesin konversi yang masih dipakai (Sunda, Morse, codec, cipher, hash, barcode, gaya teks) |
| `src/lib/` | `supabase.ts`, `auth.tsx`, `sesi.ts`, `keluar-terikat.ts`, `akses.ts`, `family.tsx`, `activity.ts`, `prefs.tsx`, `appearance*.ts`, `ai.ts` |
| `src/irsyads-v1/`, `public/irsyads-v1/` | Hasil ekspor design-tokens irsyads; jangan disunting manual |
| `supabase/` | Migrasi `studio_*` dan fungsi `ruang-ai` (proyek Supabase irsyads yang sama) |
| `tests/` | `node --experimental-strip-types --test tests/*.test.mjs` |

Berkas `*_HANDOFF.md` di folder ini adalah riwayat bertanggal.

## Fondasi Irsyads v1 — kandidat lokal 2 Oktober 2026

Token berasal dari `irsyads/packages/design-tokens/standalone/v1`. Salin ulang setelah `npm run design:export` di repo pusat; jangan menyunting hasil CSS/JSON terpisah. CSS bernamespace menghindari siklus alias Tailwind. Runtime publik ada di `public/irsyads-v1`; CSS dan registry build ada di `src/irsyads-v1`.

Tema/palet berbagi preferensi nonrahasia lintas subdomain; Supabase `studio_preferences` dan pengaturan keluarga/APMA tetap memakai alur lama. Pilihan bersama eksplisit menang terhadap respons akun, sementara akun tetap fallback tanpa pilihan bersama. Bahasa isi Ruang masih Indonesia; tautan kembali mengikuti bahasa pusat. Tidak ada perubahan schema/auth dan belum deploy.

Verifikasi: `npm run build`; `node --experimental-strip-types --test tests/appearance.test.mjs`. Build dan delapan uji adapter lulus; halaman masuk diperiksa pada 24 kombinasi tema/palet/lebar. Login akun nyata/APMA/perangkat belum diuji.
