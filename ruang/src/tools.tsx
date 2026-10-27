import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BookOpenText,
  Calculator,
  Binary,
  GraduationCap,
  Hash,
  LayoutDashboard,
  Languages,
  Library,
  KeyRound,
  QrCode,
  Radio,
  Settings,
  Sparkles,
  Type,
  Users,
  Workflow,
  Grid3x3,
} from 'lucide-react'

export type Grup = 'utama' | 'aksara' | 'sandi' | 'hitung' | 'teks' | 'pendidikan' | 'kreasi' | 'akun'

export type Alat = {
  id: string
  nama: string
  path: string
  ikon: LucideIcon
  grup: Grup
  ringkas: string
  kata?: string
  /** Tampil di bilah bawah ponsel. */
  dok?: boolean
}

export const GRUP: Record<Grup, string> = {
  utama: 'Toolkit',
  aksara: 'Aksara Sunda',
  sandi: 'Kode & Sandi',
  hitung: 'Hitung',
  teks: 'Teks & Visual',
  pendidikan: 'Pendidikan',
  kreasi: 'Kreasi',
  akun: 'Akun',
}

export const ALAT: Alat[] = [
  { id: 'kreasi', nama: 'Studio Kreasi', path: '/kreasi', ikon: Sparkles, grup: 'kreasi', ringkas: 'Rancang sandi, aksara & font sendiri', kata: 'sandi aksara font glyph studio kreasi otf' },
  { id: 'beranda', nama: 'Beranda', path: '/', ikon: LayoutDashboard, grup: 'utama', ringkas: 'Ringkasan hari ini & akses cepat', dok: true },
  { id: 'laporan', nama: 'Laporan', path: '/laporan', ikon: BarChart3, grup: 'utama', ringkas: 'Laporan cerdas pribadi & keluarga', kata: 'statistik insight analitik', dok: true },
  { id: 'koleksi', nama: 'Koleksi', path: '/koleksi', ikon: Library, grup: 'utama', ringkas: 'Semua hasil tersimpan & dibagikan', kata: 'simpan arsip favorit' },
  { id: 'otomatisasi', nama: 'Otomatisasi', path: '/otomatisasi', ikon: Workflow, grup: 'utama', ringkas: 'Resep berantai & proses massal', kata: 'resep pipeline batch massal' },

  { id: 'aksara', nama: 'Pangalihtulis', path: '/aksara', ikon: Languages, grup: 'aksara', ringkas: 'Latin ⇄ Aksara Sunda baku', kata: 'sunda transliterasi aksara', dok: true },
  { id: 'kamus', nama: 'Kamus Sunda', path: '/aksara/kamus', ikon: BookOpenText, grup: 'aksara', ringkas: 'Kosakata, arti & aksara', kata: 'kamus basa sunda' },
  { id: 'pedoman', nama: 'Pedoman Aksara', path: '/aksara/pedoman', ikon: Grid3x3, grup: 'aksara', ringkas: 'Swara, ngalagena, rarangkén', kata: 'belajar huruf' },

  { id: 'morse', nama: 'Morse Studio', path: '/morse', ikon: Radio, grup: 'sandi', ringkas: 'Audio, kedip & kunci telegraf', kata: 'sos sinyal telegraf' },
  { id: 'codec', nama: 'Codec', path: '/codec', ikon: Binary, grup: 'sandi', ringkas: 'Base64, biner, hex, URL, dll.', kata: 'encode decode base64 binary hex url unicode' },
  { id: 'sandi', nama: 'Sandi Klasik', path: '/sandi', ikon: KeyRound, grup: 'sandi', ringkas: 'Caesar, Vigenère & analisis frekuensi', kata: 'cipher caesar vigenere enkripsi' },
  { id: 'hash', nama: 'Hash', path: '/hash', ikon: Hash, grup: 'sandi', ringkas: 'MD5, SHA & verifikasi', kata: 'md5 sha256 checksum' },

  { id: 'kalkulator', nama: 'Kalkulator', path: '/kalkulator', ikon: Calculator, grup: 'hitung', ringkas: 'Ilmiah, programmer, satuan, nilai & keuangan', kata: 'hitung konversi satuan persen tanggal nilai rapor cicilan zakat', dok: true },

  { id: 'gaya', nama: 'Gaya Teks', path: '/gaya-teks', ikon: Sparkles, grup: 'teks', ringkas: 'Puluhan gaya huruf unik untuk media sosial', kata: 'stylish font fancy' },
  { id: 'teks', nama: 'Analisis & Prompter', path: '/teks', ikon: Type, grup: 'teks', ringkas: 'Statistik, format kasus & teleprompter', kata: 'camelcase snake kata durasi bicara teleprompter' },
  { id: 'qr', nama: 'QR & Barcode', path: '/qr', ikon: QrCode, grup: 'teks', ringkas: 'Buat & pindai kode', kata: 'qrcode barcode scan pindai' },

  { id: 'apma', nama: 'Irsyads LessonCraft', path: '/modul-ajar', ikon: GraduationCap, grup: 'pendidikan', ringkas: 'Modul ajar Kurikulum Merdeka & KBC dengan AI', kata: 'rpp modul ajar kurikulum merdeka kbc guru lkpd asesmen' },

  { id: 'keluarga', nama: 'Keluarga', path: '/keluarga', ikon: Users, grup: 'akun', ringkas: 'Anggota, peran & kode undangan', kata: 'family anggota undang' },
  { id: 'pengaturan', nama: 'Pengaturan', path: '/pengaturan', ikon: Settings, grup: 'akun', ringkas: 'Profil, tema, suara & data', kata: 'tema gelap palet akun sandi' },
]

export const alatById = (id: string) => ALAT.find((a) => a.id === id)
export const namaAlat = (id: string) => alatById(id)?.nama ?? (id === 'ai' ? 'Asisten AI' : id)
