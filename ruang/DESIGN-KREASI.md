# Acuan desain Studio Kreasi di Toolkit

## Sumber kebenaran

- Aplikasi utama: `ruang/`, domain produksi `app.irsyads.com`.
- Acuan visual: screenshot dashboard dari pemilik, `AppShell`, komponen UI bersama, dan token Irsyads yang sudah ada.
- Referensi tambahan atas permintaan pemilik: [elayadesign/ai-design-skills](https://github.com/elayadesign/ai-design-skills), khususnya prinsip hierarki, kejelasan tindakan, konsistensi jarak, serta state interaktif pada `landing-page-design`.
- `design-to-motion` digunakan hanya sebagai pengingat fidelitas terhadap desain asal dan reduced motion. Skill tersebut membedakan showcase animasi dari interaksi produk yang digunakan sehari-hari.

Referensi eksternal adalah pedoman UX, bukan izin mengganti identitas Toolkit dan bukan sumber kebenaran algoritma.

## Yang dipertahankan

- Sidebar, header, dashboard, akun, navigasi mobile, serta alur masuk yang sudah ada.
- Warna mengikuti token tema aktif; tidak mengunci mint, menambah palet sendiri, atau membawa CSS frontend lama.
- Komponen `PageHeader`, `Panel`, `Button`, field, dialog, dan ikon yang konsisten dengan aplikasi.
- Tidak menambah hero pemasaran, testimoni, angka buatan, reveal teks, atau animasi showcase berulang ke editor.
- Tidak menulis ulang halaman Beranda hanya untuk menambahkan fitur kreasi.

## Kenyamanan editor

- Proyek bersama, tiga tab kerja yang jelas: Sandi Lab, Aksara Lab, dan Font Lab.
- Satu aksi utama yang menonjol pada tiap konteks kerja; tindakan tambahan tidak bersaing secara visual.
- Label dekat input; hasil dan tombol salin/unduh berada dalam konteks yang sama.
- Empty state memberi petunjuk langkah pertama, bukan panel kosong tanpa penjelasan.
- State memuat, gagal, tersimpan, belum tersimpan, nonaktif, serta konflik dibedakan secara jelas.
- Pesan error menyebut apa yang salah dan cara memperbaikinya. Tidak memakai `window.alert` untuk alur utama.
- Fokus keyboard terlihat, kontrol berlabel, tab dapat dioperasikan tanpa mouse, dan kontrol sentuh cukup besar.
- Tata letak satu kolom di ponsel, anak grid dapat menyusut, dan kode panjang tidak melebarkan halaman.
- Hindari animasi yang mengganggu kanvas; reduced motion tidak boleh menyembunyikan hasil atau menghalangi tindakan.

## Logika dan perlindungan pekerjaan

- Validasi aturan sebelum konversi, tampilkan bentrok, dan sediakan uji encode/decode bolak-balik.
- Proyek lokal dipisahkan menurut akun; jangan mengklaim tersinkron ke cloud.
- Status tersimpan baru muncul setelah penulisan berhasil. Kegagalan dan konflik tetap menyediakan ekspor draf.
- Penulisan antar-tab menggunakan kunci eksklusif; pergantian akun/unmount membatalkan penulisan tertunda.
- Konfirmasi sebelum menghapus proyek atau simbol; undo/redo tersedia untuk goresan.
- Batas ukuran JSON dan titik gambar diperiksa sebelum pekerjaan menjadi tidak dapat disimpan.
- SVG hanya berasal dari geometri numerik dan teks yang di-escape, bukan HTML/SVG unggahan tak tepercaya.
- Font harus berupa berkas OpenType nyata yang dapat diparse dan dimuat browser, bukan teks stylish berlabel font.

## Pemeriksaan penerimaan

1. Build TypeScript/Vite aplikasi utama dan pengujian mesin/store lulus.
2. Halaman `/kreasi` tetap berada di dalam shell Toolkit.
3. Dashboard asli, tema, dan alur akun tidak diganti.
4. Buat proyek, konversi, menggambar, undo/redo, keyboard, impor/ekspor, serta font dicoba melalui UI.
5. Uji lebar desktop/ponsel, tema terang/gelap, input tidak valid, konflik simpanan, dan status belum tersimpan.
6. Backend produksi dan deployment tidak disentuh selama pengujian lokal.
