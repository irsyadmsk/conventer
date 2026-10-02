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
        en: "Works, sociology research, ideas, and schedule",
        ar: "\u0623\u0639\u0645\u0627\u0644 \u0648\u0628\u062D\u0648\u062B \u0633\u0648\u0633\u064A\u0648\u0644\u0648\u062C\u064A\u0629 \u0648\u0623\u0641\u0643\u0627\u0631 \u0648\u0623\u062C\u0646\u062F\u0629"
      },
      labelKategori: {
        id: "Pusat & Belajar",
        en: "Core & Learning",
        ar: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645"
      },
      urlProduksi: "https://irsyads.com",
      urlLokal: "http://localhost:4321",
      warnaAksen: "var(--color-accent, #10b981)"
    },
    {
      id: "id",
      grup: "akun",
      huruf: "id",
      kategori: "layanan",
      nama: "Irsyads ID",
      deskripsi: {
        id: "Pusat identitas, akses universal (SSO) & keamanan akun",
        en: "Universal identity, SSO access & account security",
        ar: "\u0627\u0644\u0647\u0648\u064A\u0629 \u0627\u0644\u0645\u0648\u062D\u062F\u0629\u060C \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u062D\u062F \u0648\u0623\u0645\u0627\u0646 \u0627\u0644\u062D\u0633\u0627\u0628"
      },
      labelKategori: {
        id: "Identitas & Akses",
        en: "Identity & Access",
        ar: "\u0627\u0644\u0647\u0648\u064A\u0629 \u0648\u0627\u0644\u0648\u0635\u0648\u0644"
      },
      urlProduksi: "https://id.irsyads.com",
      urlLokal: "http://localhost:4323",
      warnaAksen: "#3b82f6",
      katalog: {
        urutan: 70,
        nama: "Irsyads ID (Universal SSO)",
        subjudul: "Pusat Identitas Tunggal & Autentikasi Ekosistem",
        uraian: "Portal otentikasi tunggal (Single Sign-On) aman yang menghubungkan seluruh aplikasi dan ekosistem Irsyads dalam satu sesi terpadu lintas-subdomain, lengkap dengan daftar perangkat, riwayat masuk, dan peringatan login dari perangkat baru.",
        kelompok: "keamanan",
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
        en: "Interactive classes, curriculum modules, and CBT",
        ar: "\u0627\u0644\u062F\u0631\u0648\u0633 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0648\u0645\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0639\u0644\u0645 \u0648\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A"
      },
      labelKategori: {
        id: "Pusat & Belajar",
        en: "Core & Learning",
        ar: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645"
      },
      urlProduksi: "https://academy.irsyads.com",
      urlLokal: "http://localhost:4322",
      warnaAksen: "var(--color-gold, #f59e0b)",
      katalog: {
        urutan: 30,
        nama: "Irsyads Academy",
        subjudul: "Portal Pembelajaran, KBM Digital & Asesmen CBT",
        uraian: "Platform KBM digital interaktif, sistem asesmen Computer Based Test (CBT) real-time dengan proteksi kecurangan, presensi berbasis QR-code dinamis, forum diskusi kelas, dan bahan ajar digital.",
        kelompok: "edukasi",
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
        en: "Ecosystem command center, learning & analytics",
        ar: "\u0645\u0631\u0643\u0632 \u0642\u064A\u0627\u062F\u0629 \u0627\u0644\u0645\u0646\u0638\u0648\u0645\u0629\u060C \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A"
      },
      labelKategori: {
        id: "Pusat & Belajar",
        en: "Core & Learning",
        ar: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645"
      },
      urlProduksi: "https://studio.irsyads.com",
      urlLokal: "http://localhost:4324",
      warnaAksen: "var(--color-lilac, #a855f7)"
    },
    {
      id: "ruang",
      grup: "aplikasi",
      huruf: "r",
      kategori: "aplikasi",
      nama: "Ruang",
      deskripsi: {
        id: "Ruang kerja keluarga: aksara Sunda, sandi, kalkulator & modul ajar AI",
        en: "Family workspace: Sundanese script, ciphers, calculators & AI lesson plans",
        ar: "\u0645\u0633\u0627\u062D\u0629 \u0639\u0645\u0644 \u0644\u0644\u0639\u0627\u0626\u0644\u0629: \u0627\u0644\u062E\u0637 \u0627\u0644\u0633\u0648\u0646\u062F\u0627\u0646\u064A \u0648\u0627\u0644\u0634\u064A\u0641\u0631\u0627\u062A \u0648\u0627\u0644\u062D\u0627\u0633\u0628\u0627\u062A \u0648\u062E\u0637\u0637 \u0627\u0644\u062F\u0631\u0648\u0633 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A"
      },
      labelKategori: {
        id: "Aplikasi Mandiri",
        en: "Standalone Apps",
        ar: "\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0645\u0633\u062A\u0642\u0644\u0629"
      },
      urlProduksi: "https://app.irsyads.com",
      urlLokal: "http://localhost:5173",
      warnaAksen: "var(--color-ink, #1e293b)",
      katalog: {
        urutan: 10,
        nama: "Ruang (Keluarga & Guru)",
        subjudul: "Ruang kerja keluarga dengan satu akun irsyads.com",
        uraian: "Alih aksara & kamus Sunda, Morse dan sandi (Caesar, Vigen\xE8re, hash), kalkulator lengkap (ilmiah, satuan, tanggal & Hijriah, nilai rapor, cicilan, zakat), penyusun modul ajar berbantuan AI, koleksi bersama keluarga, otomatisasi, dan laporan pemakaian mingguan.",
        kelompok: "web",
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
        ar: "\u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u0634\u062E\u0635\u064A\u0629 \u0648\u062A\u062F\u0641\u0642 \u0627\u0644\u0633\u064A\u0648\u0644\u0629 \u0648\u0627\u0644\u0645\u062F\u062E\u0631\u0627\u062A"
      },
      labelKategori: {
        id: "Aplikasi Mandiri",
        en: "Standalone Apps",
        ar: "\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0645\u0633\u062A\u0642\u0644\u0629"
      },
      urlProduksi: "https://wallet.irsyads.com",
      urlLokal: "http://localhost:5174",
      warnaAksen: "#19363B",
      katalog: {
        urutan: 20,
        nama: "Irsyads Wallet",
        subjudul: "Buku Kas Pribadi & Arus Finansial Keluarga",
        uraian: "Aplikasi manajemen finansial pribadi dan pembukuan kas keluarga berarsitektur offline-first dengan sinkronisasi awan, pelacakan pemasukan/pengeluaran otomatis, dan analitik anggaran terperinci.",
        kelompok: "mobile",
        label: "Finansial & Kas",
        platform: ["Android (Flutter)", "Web App", "Cross-Platform"],
        distribusi: "Siap Rilis Play Store / Internal Testing",
        rilis: "Live Produksi",
        teknologi: ["Flutter", "Dart", "Supabase", "Cloudflare Workers"]
      },
      badge: {
        id: "Aplikasi",
        en: "App",
        ar: "\u062A\u0637\u0628\u064A\u0642"
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
        en: "Document authenticity, digital certificate & signatures",
        ar: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0635\u062D\u0629 \u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0648\u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0648\u0627\u0644\u0623\u062E\u062A\u0627\u0645"
      },
      labelKategori: {
        id: "Keaslian & Dokumen",
        en: "Integrity & Trust",
        ar: "\u0627\u0644\u0645\u0648\u062B\u0648\u0642\u064A\u0629 \u0648\u0627\u0644\u0648\u062B\u0627\u0626\u0642"
      },
      urlProduksi: "https://verify.irsyads.com",
      urlLokal: "http://localhost:4326",
      warnaAksen: "#0284c7",
      katalog: {
        urutan: 60,
        nama: "Irsyads Verify",
        subjudul: "Mesin Validasi Sertifikat & Tanda Tangan Kriptografis",
        uraian: "Infrastruktur verifikasi keabsahan dokumen dan sertifikat digital dengan QR code dan sidik SHA-256 di tepi jaringan (Cloudflare Edge Worker), mencegah pemalsuan dokumen resmi dan ijazah.",
        kelompok: "keamanan",
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
        en: "Request official e-signed letters, no account needed",
        ar: "\u0627\u0637\u0644\u0628 \u062E\u0637\u0627\u0628\u0627\u062A \u0631\u0633\u0645\u064A\u0629 \u0645\u0648\u0642\u0651\u0639\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u064B\u0627 \u062F\u0648\u0646 \u062D\u0633\u0627\u0628"
      },
      labelKategori: {
        id: "Keaslian & Dokumen",
        en: "Integrity & Trust",
        ar: "\u0627\u0644\u0645\u0648\u062B\u0648\u0642\u064A\u0629 \u0648\u0627\u0644\u0648\u062B\u0627\u0626\u0642"
      },
      urlProduksi: "https://letters.irsyads.com",
      urlLokal: "http://localhost:4328",
      warnaAksen: "#14183e",
      katalog: {
        urutan: 65,
        nama: "Irsyads Letters",
        subjudul: "Surat Resmi Bertanda Tangan Elektronik, Tanpa Akun",
        uraian: "Pengajuan surat keterangan, rekomendasi, dan narasumber tanpa perlu akun: formulir dengan pratinjau A4 langsung, pelacakan lewat kode, persetujuan isi akhir oleh pemohon, lalu PDF bertanda tangan elektronik ber-QR yang tercatat di Irsyads Verify.",
        kelompok: "keamanan",
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
        en: "Official computer-based exams with exam cards",
        ar: "\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0631\u0633\u0645\u064A\u0629 \u062D\u0627\u0633\u0648\u0628\u064A\u0629 \u0628\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631"
      },
      labelKategori: {
        id: "Aplikasi Mandiri",
        en: "Standalone Apps",
        ar: "\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0645\u0633\u062A\u0642\u0644\u0629"
      },
      urlProduksi: "https://cbt.irsyads.com",
      urlLokal: "http://localhost:4330",
      warnaAksen: "#16624a",
      katalog: {
        urutan: 35,
        nama: "Irsyads CBT",
        subjudul: "Ujian Resmi Berbasis Komputer dengan Kartu Ujian",
        uraian: "Ujian resmi di laptop: peserta masuk dengan kode ujian, Nomor Induk, dan token kartu; Safe Exam Browser diperiksa server; pengawas memantau langsung, menambah waktu, dan mengumpulkan paksa dari Studio. Soal mendukung rumus, aksara Arab, dan Sunda.",
        kelompok: "edukasi",
        label: "Asesmen & Ujian",
        platform: ["Web App", "Safe Exam Browser"],
        distribusi: "Dibuka dari Studio & Academy",
        rilis: "Live Produksi",
        teknologi: ["Astro", "React", "Supabase Edge Functions", "Safe Exam Browser"]
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
        ar: "\u0625\u062F\u0627\u0631\u0629 \u0645\u0646\u0627\u0647\u062C \u0627\u0644\u0645\u062F\u0631\u0633\u0629 \u0648\u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629 \u0648\u0627\u0644\u062C\u062F\u0648\u0644"
      },
      labelKategori: {
        id: "Aplikasi Mandiri",
        en: "Standalone Apps",
        ar: "\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0645\u0633\u062A\u0642\u0644\u0629"
      },
      urlProduksi: "https://curriculum.irsyads.com",
      urlLokal: "http://localhost:5175",
      warnaAksen: "#f97316",
      katalog: {
        urutan: 40,
        nama: "Curriculum MA ICN",
        subjudul: "Sistem Informasi Kurikulum, Silabus & Jadwal Madrasah",
        uraian: "Sistem informasi kurikulum madrasah terintegrasi untuk pengelolaan silabus, pembagian modul ajar, jadwal pembelajaran per kelas, dan kalender pendidikan resmi MA Insan Cendekia Nusantara.",
        kelompok: "edukasi",
        label: "Sistem Manajemen Sekolah",
        platform: ["Web Portal", "Cloud System"],
        distribusi: "Sistem Portal Web Terpusat",
        rilis: "Live Produksi",
        teknologi: ["Modern JS", "Firebase", "Supabase", "Cloudflare Workers"]
      },
      badge: {
        id: "Portal",
        en: "Portal",
        ar: "\u0628\u0648\u0627\u0628\u0629"
      }
    },
    {
      id: "masjidku-tv",
      grup: "aplikasi",
      huruf: "M",
      kategori: "aplikasi",
      nama: "MasjidKU TV",
      status: "beta",
      deskripsi: { id: "Layar informasi masjid untuk TV, dikelola lewat HP lokal", en: "Mosque information on TV, managed on a local phone", ar: "\u0634\u0627\u0634\u0629 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0633\u062C\u062F \u0644\u0644\u062A\u0644\u0641\u0627\u0632\u060C \u062A\u064F\u062F\u0627\u0631 \u0628\u0647\u0627\u062A\u0641 \u0639\u0644\u0649 \u0627\u0644\u0634\u0628\u0643\u0629 \u0627\u0644\u0645\u062D\u0644\u064A\u0629" },
      labelKategori: { id: "Aplikasi Mandiri", en: "Standalone Apps", ar: "\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0645\u0633\u062A\u0642\u0644\u0629" },
      urlProduksi: "https://mosque.irsyads.com",
      urlLokal: "https://mosque.irsyads.com",
      warnaAksen: "#059669",
      katalog: {
        urutan: 50,
        subjudul: "Smart Digital Signage & Jadwal Sholat Android TV",
        uraian: "Layar informasi masjid untuk Android TV dan STB: jadwal salat offline, hitung mundur iqomah, dan tampilan yang dapat diatur pengurus melalui HP di jaringan lokal masjid. Halaman produk menyediakan APK beta dan panduan pemasangan; belum tersedia di Play Store.",
        kelompok: "mobile",
        label: "Smart Signage & Ibadah",
        platform: ["Android TV", "Android APK", "Digital Signage"],
        distribusi: "APK beta \xB7 belum di Play Store",
        rilis: "Beta",
        teknologi: ["Android", "Kotlin", "Android TV Leanback", "Hisab Engine"],
        url: "https://mosque.irsyads.com",
        aksiLabel: "Lihat MasjidKU TV"
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
