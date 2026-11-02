var IrsyadsLauncher = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/design-tokens/src/launcher.ts
  var launcher_exports = {};
  __export(launcher_exports, {
    DEFAULT_LAUNCHER: () => DEFAULT_LAUNCHER,
    LAUNCHER_KEY: () => LAUNCHER_KEY,
    LAUNCHER_URL: () => LAUNCHER_URL,
    normalizeLauncher: () => normalizeLauncher,
    readLauncher: () => readLauncher
  });

  // packages/design-tokens/src/ruang.ts
  var DAFTAR_RUANG = [
    {
      id: "site",
      grup: "karya",
      huruf: "i",
      kategori: "utama",
      nama: "Irsyads",
      deskripsi: {
        id: "Karya, riset sosiologi, pemikiran, dan agenda",
        en: "Research, writing, ideas and events",
        ar: "\u0623\u0639\u0645\u0627\u0644 \u0648\u0628\u062D\u0648\u062B \u0633\u0648\u0633\u064A\u0648\u0644\u0648\u062C\u064A\u0629 \u0648\u0623\u0641\u0643\u0627\u0631 \u0648\u0623\u062C\u0646\u062F\u0629",
        zh: "\u7814\u7A76\u3001\u5199\u4F5C\u3001\u601D\u60F3\u4E0E\u6D3B\u52A8"
      },
      labelKategori: {
        id: "Pusat & Belajar",
        en: "Core & Learning",
        ar: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645",
        zh: "\u4F5C\u54C1\u4E0E\u5B66\u4E60"
      },
      urlProduksi: "https://irsyads.com",
      urlLokal: "http://localhost:4321",
      warnaAksen: "var(--color-accent, #376A9B)"
    },
    {
      id: "id",
      grup: "akun",
      huruf: "id",
      kategori: "layanan",
      nama: "Irsyads ID",
      deskripsi: {
        id: "Pusat identitas, akses universal (SSO) & keamanan akun",
        en: "One account for Irsyads apps",
        ar: "\u0627\u0644\u0647\u0648\u064A\u0629 \u0627\u0644\u0645\u0648\u062D\u062F\u0629\u060C \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u062D\u062F \u0648\u0623\u0645\u0627\u0646 \u0627\u0644\u062D\u0633\u0627\u0628",
        zh: "\u4E00\u4E2A\u8D26\u6237\uFF0C\u4F7F\u7528 Irsyads \u5E94\u7528"
      },
      labelKategori: {
        id: "Identitas & Akses",
        en: "Identity & Access",
        ar: "\u0627\u0644\u0647\u0648\u064A\u0629 \u0648\u0627\u0644\u0648\u0635\u0648\u0644",
        zh: "\u8EAB\u4EFD\u4E0E\u8BBF\u95EE"
      },
      urlProduksi: "https://id.irsyads.com",
      urlLokal: "http://localhost:4323",
      warnaAksen: "#0B1D35",
      katalog: {
        urutan: 70,
        nama: "Irsyads ID (Universal SSO)",
        subjudul: "Pusat Identitas Tunggal & Autentikasi Ekosistem",
        uraian: "Portal otentikasi tunggal (Single Sign-On) aman yang menghubungkan seluruh aplikasi dan ekosistem Irsyads dalam satu sesi terpadu lintas-subdomain, lengkap dengan daftar perangkat, riwayat masuk, dan peringatan login dari perangkat baru.",
        kelompok: "dokumen",
        label: "Identitas & Akses",
        platform: ["Identity Service", "Web SSO", "OAuth"],
        distribusi: "Layanan Inti Ekosistem",
        rilis: "Live Produksi",
        teknologi: ["Astro", "React", "Supabase Auth"]
      }
    },
    {
      id: "academy",
      grup: "karya",
      huruf: "a",
      kategori: "utama",
      nama: "Academy",
      deskripsi: {
        id: "Kelas interaktif, modul Kurikulum Merdeka, dan CBT",
        en: "Courses, learning resources and assessments",
        ar: "\u0627\u0644\u062F\u0631\u0648\u0633 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0648\u0645\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0639\u0644\u0645 \u0648\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A",
        zh: "\u8BFE\u7A0B\u3001\u5B66\u4E60\u8D44\u6E90\u4E0E\u6D4B\u8BC4"
      },
      labelKategori: {
        id: "Pusat & Belajar",
        en: "Core & Learning",
        ar: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645",
        zh: "\u4F5C\u54C1\u4E0E\u5B66\u4E60"
      },
      urlProduksi: "https://academy.irsyads.com",
      urlLokal: "http://localhost:4322",
      warnaAksen: "#0B1D35",
      katalog: {
        urutan: 30,
        nama: "Irsyads Academy",
        subjudul: "Portal Pembelajaran, KBM Digital & Asesmen CBT",
        uraian: "Platform KBM digital interaktif, sistem asesmen Computer Based Test (CBT) real-time dengan proteksi kecurangan, presensi berbasis QR-code dinamis, forum diskusi kelas, dan bahan ajar digital.",
        kelompok: "belajar",
        label: "Platform Belajar",
        platform: ["Web App", "PWA", "Siap Mobile App"],
        distribusi: "Dalam Rencana Porting Mobile Native",
        rilis: "Live Produksi",
        teknologi: ["Astro 7", "React", "Supabase RLS", "Tailwind CSS", "Cloudflare"]
      }
    },
    {
      id: "studio",
      grup: "pengelola",
      huruf: "s",
      kategori: "utama",
      nama: "Studio HQ",
      deskripsi: {
        id: "Pusat komando ekosistem, manajemen KBM, dan analitik",
        en: "Manage site content, courses and learning reports",
        ar: "\u0645\u0631\u0643\u0632 \u0642\u064A\u0627\u062F\u0629 \u0627\u0644\u0645\u0646\u0638\u0648\u0645\u0629\u060C \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A",
        zh: "\u7BA1\u7406\u7F51\u7AD9\u5185\u5BB9\u3001\u8BFE\u7A0B\u4E0E\u5B66\u4E60\u62A5\u544A"
      },
      labelKategori: {
        id: "Pusat & Belajar",
        en: "Core & Learning",
        ar: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645",
        zh: "\u4F5C\u54C1\u4E0E\u5B66\u4E60"
      },
      urlProduksi: "https://studio.irsyads.com",
      urlLokal: "http://localhost:4324",
      warnaAksen: "#0B1D35",
      katalog: {
        urutan: 42,
        nama: "Irsyads Studio",
        subjudul: "Meja Kerja Guru & Pengelola Ekosistem",
        uraian: "Satu meja kerja untuk guru dan pengelola: absensi, nilai, rapor, surat, bank soal dan pengawasan CBT, kelas Academy, iklan aplikasi, serta isi situs irsyads.com.",
        kelompok: "sekolah",
        label: "Pengelola & Guru",
        platform: ["Web App"],
        distribusi: "Masuk dengan akun guru/pengelola",
        rilis: "Akses Terbatas",
        teknologi: ["Astro", "React", "Supabase RLS", "Cloudflare Workers"],
        aksiLabel: "Masuk Studio"
      }
    },
    {
      id: "ruang",
      grup: "aplikasi",
      huruf: "r",
      kategori: "aplikasi",
      nama: "Irsyads Toolkit",
      deskripsi: {
        id: "Aksara Sunda, kamus, sandi, konverter, dan perangkat ajar",
        en: "Sundanese script, dictionaries, ciphers and teaching tools",
        ar: "\u0627\u0644\u062E\u0637 \u0627\u0644\u0633\u0648\u0646\u062F\u0627\u0646\u064A \u0648\u0627\u0644\u0642\u0648\u0627\u0645\u064A\u0633 \u0648\u0627\u0644\u0634\u064A\u0641\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u062D\u0648\u0644\u0627\u062A \u0648\u0623\u062F\u0648\u0627\u062A \u0625\u0639\u062F\u0627\u062F \u0627\u0644\u062F\u0631\u0648\u0633",
        zh: "\u5DFD\u4ED6\u6587\u5B57\u3001\u8BCD\u5178\u3001\u5BC6\u7801\u4E0E\u6559\u5B66\u5DE5\u5177"
      },
      labelKategori: {
        id: "Aplikasi Mandiri",
        en: "Standalone Apps",
        ar: "\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0645\u0633\u062A\u0642\u0644\u0629",
        zh: "\u72EC\u7ACB\u5E94\u7528"
      },
      urlProduksi: "https://app.irsyads.com",
      urlLokal: "http://localhost:5173",
      warnaAksen: "var(--color-ink, #0B1D35)",
      katalog: {
        urutan: 10,
        nama: "Irsyads Toolkit",
        subjudul: "Alat bahasa, teks, konversi, dan perangkat ajar",
        uraian: "Alih aksara dan kamus Sunda, Morse, sandi, konverter, kalkulator, serta draf perangkat ajar melalui template lokal yang dapat disunting.",
        kelompok: "harian",
        label: "Produktivitas & Budaya",
        platform: ["Web App", "PWA", "Mobile Ready"],
        distribusi: "PWA Siap Pasang di Ponsel",
        rilis: "Live Produksi",
        teknologi: ["React 19", "Vite", "Tailwind CSS", "Cloudflare Workers", "PWA"]
      }
    },
    {
      id: "wallet",
      grup: "aplikasi",
      huruf: "w",
      kategori: "aplikasi",
      nama: "Wallet",
      deskripsi: {
        id: "Manajemen finansial pribadi, arus kas & tabungan",
        en: "Personal finance, cashflow & savings manager",
        ar: "\u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u0634\u062E\u0635\u064A\u0629 \u0648\u062A\u062F\u0641\u0642 \u0627\u0644\u0633\u064A\u0648\u0644\u0629 \u0648\u0627\u0644\u0645\u062F\u062E\u0631\u0627\u062A",
        zh: "\u4E2A\u4EBA\u8D22\u52A1\u3001\u73B0\u91D1\u6D41\u4E0E\u50A8\u84C4\u7BA1\u7406"
      },
      labelKategori: {
        id: "Aplikasi Mandiri",
        en: "Standalone Apps",
        ar: "\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0645\u0633\u062A\u0642\u0644\u0629",
        zh: "\u72EC\u7ACB\u5E94\u7528"
      },
      urlProduksi: "https://wallet.irsyads.com",
      urlLokal: "http://localhost:5174",
      warnaAksen: "#0B1D35",
      katalog: {
        urutan: 20,
        nama: "Irsyads Wallet",
        subjudul: "Buku Kas Pribadi & Arus Finansial Keluarga",
        uraian: "Aplikasi manajemen finansial pribadi dan pembukuan kas keluarga berarsitektur offline-first dengan sinkronisasi awan, pelacakan pemasukan/pengeluaran otomatis, dan analitik anggaran terperinci.",
        kelompok: "harian",
        label: "Finansial & Kas",
        platform: ["Android (Flutter)", "Web App", "Cross-Platform"],
        distribusi: "Siap Rilis Play Store / Internal Testing",
        rilis: "Live Produksi",
        teknologi: ["Flutter", "Dart", "Supabase", "Cloudflare Workers"]
      },
      badge: {
        id: "Aplikasi",
        en: "App",
        ar: "\u062A\u0637\u0628\u064A\u0642",
        zh: "\u5E94\u7528"
      }
    },
    {
      id: "verify",
      grup: "akun",
      huruf: "v",
      kategori: "layanan",
      nama: "Verify",
      deskripsi: {
        id: "Validasi keaslian dokumen, ijazah digital & stempel TTD",
        en: "Check documents and electronic signatures",
        ar: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0635\u062D\u0629 \u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0648\u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0648\u0627\u0644\u0623\u062E\u062A\u0627\u0645",
        zh: "\u9A8C\u8BC1\u6587\u6863\u4E0E\u7535\u5B50\u7B7E\u540D"
      },
      labelKategori: {
        id: "Keaslian & Dokumen",
        en: "Integrity & Trust",
        ar: "\u0627\u0644\u0645\u0648\u062B\u0648\u0642\u064A\u0629 \u0648\u0627\u0644\u0648\u062B\u0627\u0626\u0642",
        zh: "\u9A8C\u8BC1\u4E0E\u4FE1\u4EFB"
      },
      urlProduksi: "https://verify.irsyads.com",
      urlLokal: "http://localhost:4326",
      warnaAksen: "#376A9B",
      katalog: {
        urutan: 60,
        nama: "Irsyads Verify",
        subjudul: "Mesin Validasi Sertifikat & Tanda Tangan Kriptografis",
        uraian: "Infrastruktur verifikasi keabsahan dokumen dan sertifikat digital dengan QR code dan sidik SHA-256 di tepi jaringan (Cloudflare Edge Worker), mencegah pemalsuan dokumen resmi dan ijazah.",
        kelompok: "dokumen",
        label: "Integritas & Keamanan",
        platform: ["Web Service", "API Engine", "Edge Worker"],
        distribusi: "Layanan Web & Edge API",
        rilis: "Live Produksi",
        teknologi: ["Astro", "Cloudflare Workers", "Web Crypto API", "PDF-Lib"]
      }
    },
    {
      id: "letters",
      grup: "akun",
      huruf: "l",
      kategori: "layanan",
      nama: "Letters",
      deskripsi: {
        id: "Ajukan surat resmi bertanda tangan elektronik, tanpa akun",
        en: "Request electronically signed letters without an account",
        ar: "\u0627\u0637\u0644\u0628 \u062E\u0637\u0627\u0628\u0627\u062A \u0631\u0633\u0645\u064A\u0629 \u0645\u0648\u0642\u0651\u0639\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u064B\u0627 \u062F\u0648\u0646 \u062D\u0633\u0627\u0628",
        zh: "\u65E0\u9700\u8D26\u6237\u5373\u53EF\u7533\u8BF7\u7535\u5B50\u7B7E\u540D\u4FE1\u51FD"
      },
      labelKategori: {
        id: "Keaslian & Dokumen",
        en: "Integrity & Trust",
        ar: "\u0627\u0644\u0645\u0648\u062B\u0648\u0642\u064A\u0629 \u0648\u0627\u0644\u0648\u062B\u0627\u0626\u0642",
        zh: "\u9A8C\u8BC1\u4E0E\u4FE1\u4EFB"
      },
      urlProduksi: "https://letters.irsyads.com",
      urlLokal: "http://localhost:4328",
      warnaAksen: "#376A9B",
      katalog: {
        urutan: 65,
        nama: "Irsyads Letters",
        subjudul: "Surat Resmi Bertanda Tangan Elektronik, Tanpa Akun",
        uraian: "Pengajuan surat keterangan, rekomendasi, dan narasumber tanpa perlu akun: formulir dengan pratinjau A4 langsung, pelacakan lewat kode, persetujuan isi akhir oleh pemohon, lalu PDF bertanda tangan elektronik ber-QR yang tercatat di Irsyads Verify.",
        kelompok: "dokumen",
        label: "Dokumen & Tanda Tangan",
        platform: ["Web App", "Dwibahasa ID/EN"],
        distribusi: "Layanan Web Publik",
        rilis: "Live Produksi",
        teknologi: ["Astro", "React", "Supabase Edge Functions", "PDF-Lib", "Resend"]
      }
    },
    {
      // Ujian resmi (laptop + Safe Exam Browser), SEB ditegakkan server sejak C4
      // (vault 13_RENCANA_SCHOLAR_LOGIN_CBT). Sejak 30 Sep 2026 tidak di peluncur:
      // peserta masuk lewat kode ujian dari pengawas, jadi pintunya tombol
      // "Latihan & ujian" di Studio dan Academy, plus kartu di /apps.
      id: "cbt",
      grup: "aplikasi",
      huruf: "t",
      kategori: "aplikasi",
      nama: "CBT",
      status: "beta",
      peluncur: false,
      deskripsi: {
        id: "Ujian resmi berbasis komputer dengan kartu ujian",
        en: "Scheduled computer-based exams with admission cards",
        ar: "\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0631\u0633\u0645\u064A\u0629 \u062D\u0627\u0633\u0648\u0628\u064A\u0629 \u0628\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631",
        zh: "\u6309\u8BA1\u5212\u5F00\u5C55\u8BA1\u7B97\u673A\u8003\u8BD5\u5E76\u63D0\u4F9B\u51C6\u8003\u8BC1"
      },
      labelKategori: {
        id: "Aplikasi Mandiri",
        en: "Standalone Apps",
        ar: "\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0645\u0633\u062A\u0642\u0644\u0629",
        zh: "\u72EC\u7ACB\u5E94\u7528"
      },
      urlProduksi: "https://cbt.irsyads.com",
      urlLokal: "http://localhost:4330",
      warnaAksen: "#0B1D35",
      katalog: {
        urutan: 35,
        nama: "Irsyads CBT",
        subjudul: "Ujian Resmi Berbasis Komputer dengan Kartu Ujian",
        uraian: "Ujian resmi di laptop: peserta masuk dengan kode ujian, Nomor Induk, dan token kartu; Safe Exam Browser diperiksa server; pengawas memantau langsung, menambah waktu, dan mengumpulkan paksa dari Studio. Soal mendukung rumus, aksara Arab, dan Sunda.",
        kelompok: "belajar",
        label: "Asesmen & Ujian",
        platform: ["Web App", "Safe Exam Browser"],
        distribusi: "Dibuka dari Studio & Academy",
        rilis: "Live Produksi",
        teknologi: ["Astro", "React", "Supabase Edge Functions", "Safe Exam Browser"]
      }
    },
    {
      id: "smart",
      grup: "aplikasi",
      huruf: "s",
      kategori: "layanan",
      nama: "SMART",
      status: "segera",
      peluncur: false,
      deskripsi: {
        id: "Formulir untuk pendaftaran, daftar hadir, survei & kebutuhan umum \u2014 dalam persiapan",
        en: "Forms for registrations, attendance, surveys & general use \u2014 coming soon",
        ar: "\u0646\u0645\u0627\u0630\u062C \u0644\u0644\u062A\u0633\u062C\u064A\u0644 \u0648\u0627\u0644\u062D\u0636\u0648\u0631 \u0648\u0627\u0644\u0627\u0633\u062A\u0628\u064A\u0627\u0646\u0627\u062A \u0648\u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0639\u0627\u0645 \u2014 \u0642\u0631\u064A\u0628\u064B\u0627",
        zh: "\u7528\u4E8E\u62A5\u540D\u3001\u7B7E\u5230\u3001\u8C03\u67E5\u7B49\u7684\u8868\u5355\uFF0C\u5373\u5C06\u63A8\u51FA"
      },
      labelKategori: {
        id: "Pusat & Belajar",
        en: "Core & Learning",
        ar: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645",
        zh: "\u4F5C\u54C1\u4E0E\u5B66\u4E60"
      },
      urlProduksi: "https://smart.irsyads.com",
      urlLokal: "http://localhost:4332",
      warnaAksen: "#376A9B",
      katalog: {
        urutan: 44,
        nama: "SMART \xB7 Formulir",
        subjudul: "Pembuat Formulir: Pendaftaran, Daftar Hadir & Survei",
        uraian: "Susun formulir dari template pendaftaran, survei, atau daftar hadir, atur pertanyaan dan tampilan, lalu lihat pratinjau ponsel. Versi perangkat: draf dan jawaban tersimpan di peramban ini; pengumpulan jawaban lintas perangkat belum tersambung.",
        kelompok: "sekolah",
        label: "Formulir & Pendataan",
        platform: ["Web App"],
        distribusi: "Versi perangkat \xB7 tersimpan di peramban",
        rilis: "Beta",
        teknologi: ["React", "Form.io", "Cloudflare Workers"],
        aksiLabel: "Coba SMART"
      }
    },
    {
      id: "gate",
      grup: "aplikasi",
      huruf: "g",
      kategori: "layanan",
      nama: "Gate",
      status: "aktif",
      peluncur: false,
      internal: true,
      deskripsi: {
        id: "Pos satpam: catat tamu masuk-keluar dan cetak kartu tamu",
        en: "Security post: log visitors in and out and print visitor passes",
        ar: "\u0646\u0642\u0637\u0629 \u0627\u0644\u0623\u0645\u0646: \u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644 \u0627\u0644\u0632\u0648\u0627\u0631 \u0648\u062E\u0631\u0648\u062C\u0647\u0645 \u0648\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A",
        zh: "\u95E8\u536B\u5C97\uFF1A\u767B\u8BB0\u8BBF\u5BA2\u8FDB\u51FA\u5E76\u6253\u5370\u8BBF\u5BA2\u5361"
      },
      labelKategori: {
        id: "Pusat & Belajar",
        en: "Core & Learning",
        ar: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645",
        zh: "\u4F5C\u54C1\u4E0E\u5B66\u4E60"
      },
      urlProduksi: "https://gate.irsyads.com",
      urlLokal: "http://localhost:4341",
      warnaAksen: "#376A9B",
      katalog: {
        urutan: 46,
        nama: "Irsyads Gate",
        subjudul: "Konsol Pos Satpam Sekolah",
        uraian: "Catat tamu masuk dan keluar (tamu mendaftar sendiri tanpa akun), jalur cepat GTK lewat pindai QR, kartu tamu, shift dan serah terima, buku jaga, serta laporan CSV/XLSX/DOCX.",
        kelompok: "sekolah",
        label: "Keamanan Sekolah",
        platform: ["Web App", "Pemindai QR"],
        distribusi: "Alat internal petugas",
        rilis: "Akses Terbatas",
        teknologi: ["Astro", "React", "Supabase"],
        aksiLabel: "Masuk Gate"
      }
    },
    {
      id: "nota",
      grup: "aplikasi",
      huruf: "n",
      kategori: "layanan",
      nama: "Nota",
      status: "aktif",
      peluncur: false,
      internal: true,
      deskripsi: {
        id: "Kuitansi dan struk: terbitkan, daftarkan ke Verify, cetak, dan kirim",
        en: "Receipts: issue, register with Verify, print and send",
        ar: "\u0627\u0644\u0625\u064A\u0635\u0627\u0644\u0627\u062A: \u0625\u0635\u062F\u0627\u0631 \u0648\u062A\u0633\u062C\u064A\u0644 \u0641\u064A Verify \u0648\u0637\u0628\u0627\u0639\u0629 \u0648\u0625\u0631\u0633\u0627\u0644",
        zh: "\u6536\u636E\uFF1A\u5F00\u5177\u3001\u767B\u8BB0\u5230 Verify\u3001\u6253\u5370\u5E76\u53D1\u9001"
      },
      labelKategori: {
        id: "Pusat & Belajar",
        en: "Core & Learning",
        ar: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645",
        zh: "\u4F5C\u54C1\u4E0E\u5B66\u4E60"
      },
      urlProduksi: "https://nota.irsyads.com",
      urlLokal: "http://localhost:4343",
      warnaAksen: "#376A9B",
      katalog: {
        urutan: 48,
        nama: "Irsyads Nota",
        subjudul: "Kuitansi & Struk yang Bisa Diverifikasi",
        uraian: "Terbitkan kuitansi dan struk, daftarkan ke Irsyads Verify agar keasliannya bisa dicek lewat QR, lalu cetak di printer thermal atau kirim sebagai PDF.",
        kelompok: "sekolah",
        label: "Keuangan & Administrasi",
        platform: ["Web App", "Printer Thermal"],
        distribusi: "Alat petugas \xB7 berjalan di perangkat",
        rilis: "Akses Terbatas",
        teknologi: ["Astro", "React", "ESC/POS", "Supabase"],
        aksiLabel: "Buka Nota"
      }
    },
    {
      id: "curriculum",
      grup: "karya",
      huruf: "c",
      kategori: "aplikasi",
      nama: "Curriculum",
      deskripsi: {
        id: "Manajemen kurikulum madrasah, silabus & jadwal KBM",
        en: "Madrasah curriculum management, syllabus & schedule",
        ar: "\u0625\u062F\u0627\u0631\u0629 \u0645\u0646\u0627\u0647\u062C \u0627\u0644\u0645\u062F\u0631\u0633\u0629 \u0648\u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629 \u0648\u0627\u0644\u062C\u062F\u0648\u0644",
        zh: "\u5B66\u6821\u8BFE\u7A0B\u3001\u5927\u7EB2\u4E0E\u8BFE\u8868\u7BA1\u7406"
      },
      labelKategori: {
        id: "Aplikasi Mandiri",
        en: "Standalone Apps",
        ar: "\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0645\u0633\u062A\u0642\u0644\u0629",
        zh: "\u72EC\u7ACB\u5E94\u7528"
      },
      urlProduksi: "https://curriculum.irsyads.com",
      urlLokal: "http://localhost:5175",
      warnaAksen: "#586574",
      katalog: {
        urutan: 40,
        nama: "Curriculum MA ICN",
        subjudul: "Sistem Informasi Kurikulum, Silabus & Jadwal Madrasah",
        uraian: "Sistem informasi kurikulum madrasah terintegrasi untuk pengelolaan silabus, pembagian modul ajar, jadwal pembelajaran per kelas, dan kalender pendidikan resmi MA Insan Cendekia Nusantara.",
        kelompok: "belajar",
        label: "Sistem Manajemen Sekolah",
        platform: ["Web Portal", "Cloud System"],
        distribusi: "Sistem Portal Web Terpusat",
        rilis: "Live Produksi",
        teknologi: ["Modern JS", "Firebase", "Supabase", "Cloudflare Workers"]
      },
      badge: {
        id: "Portal",
        en: "Portal",
        ar: "\u0628\u0648\u0627\u0628\u0629",
        zh: "\u95E8\u6237"
      }
    },
    {
      id: "masjidku-tv",
      grup: "aplikasi",
      huruf: "M",
      kategori: "aplikasi",
      nama: "Irsyads Mosque",
      status: "beta",
      deskripsi: { id: "Layar informasi masjid untuk TV, dikelola lewat HP lokal", en: "Mosque information on TV, managed from a phone on the same network", ar: "\u0634\u0627\u0634\u0629 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0633\u062C\u062F \u0644\u0644\u062A\u0644\u0641\u0627\u0632\u060C \u062A\u064F\u062F\u0627\u0631 \u0628\u0647\u0627\u062A\u0641 \u0639\u0644\u0649 \u0627\u0644\u0634\u0628\u0643\u0629 \u0627\u0644\u0645\u062D\u0644\u064A\u0629", zh: "\u5728\u7535\u89C6\u4E0A\u663E\u793A\u6E05\u771F\u5BFA\u4FE1\u606F\uFF0C\u901A\u8FC7\u540C\u4E00\u7F51\u7EDC\u4E2D\u7684\u624B\u673A\u7BA1\u7406" },
      labelKategori: { id: "Aplikasi Mandiri", en: "Standalone Apps", ar: "\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0645\u0633\u062A\u0642\u0644\u0629", zh: "\u72EC\u7ACB\u5E94\u7528" },
      urlProduksi: "https://mosque.irsyads.com",
      urlLokal: "https://mosque.irsyads.com",
      warnaAksen: "#586574",
      katalog: {
        urutan: 50,
        subjudul: "Smart Digital Signage & Jadwal Sholat Android TV",
        uraian: "Layar informasi masjid untuk Android TV dan STB: jadwal salat offline, hitung mundur iqomah, dan tampilan yang dapat diatur pengurus melalui HP di jaringan lokal masjid. Halaman produk menyediakan APK beta dan panduan pemasangan; belum tersedia di Play Store.",
        kelompok: "harian",
        label: "Smart Signage & Ibadah",
        platform: ["Android TV", "Android APK", "Digital Signage"],
        distribusi: "APK beta \xB7 belum di Play Store",
        rilis: "Beta",
        teknologi: ["Android", "Kotlin", "Android TV Leanback", "Hisab Engine"],
        url: "https://mosque.irsyads.com",
        aksiLabel: "Lihat Irsyads Mosque"
      }
    }
  ];

  // packages/design-tokens/src/launcher.ts
  var DEFAULT_LAUNCHER = [
    { id: "site", group: "karya" },
    { id: "academy", group: "karya" },
    { id: "curriculum", group: "karya" },
    { id: "ruang", group: "aplikasi" },
    { id: "wallet", group: "aplikasi" },
    { id: "masjidku-tv", group: "aplikasi" },
    { id: "id", group: "akun" },
    { id: "verify", group: "akun" },
    { id: "letters", group: "akun" }
  ];
  function normalizeLauncher(value) {
    if (!Array.isArray(value)) return DEFAULT_LAUNCHER.map((x) => ({ ...x }));
    const seen = /* @__PURE__ */ new Set();
    return value.flatMap((item) => {
      if (!item || typeof item !== "object" || !["karya", "aplikasi", "akun"].includes(item.group) || seen.has(item.id)) return [];
      const app = DAFTAR_RUANG.find((app2) => app2.id === item.id && app2.peluncur !== false && app2.grup !== "pengelola");
      if (!app) return [];
      seen.add(item.id);
      return [{ id: app.id, group: item.group }];
    }).slice(0, 9);
  }
  var LAUNCHER_URL = "https://mqesvxweuygplrdxchkv.supabase.co/rest/v1/launcher_settings?id=eq.main&select=tiles";
  var LAUNCHER_KEY = "sb_publishable_hIDyw6sOzKOj7Ta50X8HYg_jPyOMyWZ";
  async function readLauncher() {
    try {
      const response = await fetch(LAUNCHER_URL, { headers: { apikey: LAUNCHER_KEY }, signal: AbortSignal.timeout(4e3) });
      if (!response.ok) return normalizeLauncher(null);
      const rows = await response.json();
      return normalizeLauncher(rows?.[0]?.tiles);
    } catch {
      return normalizeLauncher(null);
    }
  }
  return __toCommonJS(launcher_exports);
})();
