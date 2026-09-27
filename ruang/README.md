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
| Modul Ajar (APMA) | Wizard 2 langkah → AI menyusun modul lengkap; editor blok (seret urut), Copilot, Audit AI + perbaikan istilah regulasi, desain dokumen, kop sekolah, riwayat versi, ekspor PDF/Word/HTML/Markdown, bisa dibagikan ke keluarga |
| Koleksi | Semua hasil tersimpan, sematkan, bagikan ke keluarga, ekspor JSON |
| Otomatisasi | Resep berantai (seret urut, pratinjau tiap langkah), proses massal per baris + CSV, templat, simpan otomatis |
| Laporan | KPI vs periode lalu, grafik harian, alat terpakai, peta jam, kontribusi anggota, wawasan otomatis, ringkasan AI, arsip mingguan otomatis (cron Senin 00.10 WIB), cetak/CSV |

## Backend (proyek Supabase `irsyads`)

- Migrasi: `supabase/migrations/20260924000001_ruang_core.sql` (tabel `studio_*`, RLS, RPC keluarga, ringkasan laporan, cron).
- Edge Function: `supabase/functions/ruang-ai` — memakai secret yang sama dengan `ai-bantu` (`GEMINI_API_KEY`, `AI_API_KEY`), kuota harian per akun `RUANG_KUOTA_HARIAN` (bawaan 30). Kunci AI tidak pernah sampai ke peramban.
- Pelacakan aktivitas hanya menyimpan nama alat, aksi, dan jumlah karakter — **bukan isi teks**.

## Menjalankan

```bash
npm install
npm run dev
```

`.env` (lihat `.env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.

Mode pratinjau desain (hanya `npm run dev`, dibuang dari build): jalankan `localStorage.setItem('ruang:pratinjau','1')` di konsol untuk melihat halaman tanpa masuk.

## Rilis ke app.irsyads.com

1. `npm run build` → unggah `dist/` ke hosting statis (Cloudflare Pages / Netlify / Vercel). `public/_redirects` sudah menangani rute SPA.
2. Arahkan DNS `app.irsyads.com` ke hosting tersebut.
3. Supabase → Authentication → URL Configuration: tambahkan `https://app.irsyads.com/**` ke **Redirect URLs** (untuk konfirmasi email, reset sandi, dan Google).
4. (Opsional) Aktifkan provider Google di Supabase Auth bila tombol Google ingin dipakai.
5. (Disarankan) Aktifkan *Leaked password protection* di Supabase Auth.
