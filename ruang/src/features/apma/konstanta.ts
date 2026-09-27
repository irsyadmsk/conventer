import type { AnalisisAudit } from './model'
import type { AppFormData, DocumentDesign, ModuleBlock, SchoolProfile } from './types'

export const MODEL = [
  'Deep Learning (Pembelajaran Mendalam)',
  'Project Based Learning (PjBL)',
  'Problem Based Learning (PBL)',
  'Case Based Learning (CBL)',
  'Discovery Learning',
  'Inquiry Learning',
  'Contextual Teaching and Learning (CTL)',
  'Cooperative Learning',
  'Pembelajaran Berdiferensiasi',
]

export const PROFIL_LULUSAN = [
  'Keimanan dan Ketakwaan kepada Tuhan Yang Maha Esa dan akhlak mulia',
  'Kewargaan',
  'Penalaran Kritis',
  'Kreativitas',
  'Kolaborasi',
  'Kemandirian',
  'Kesehatan',
  'Komunikasi',
]

export const GENERATOR = [
  'Materi Ajar Lengkap',
  'Lembar Kerja Murid (LKPD) Discovery',
  'Lembar Kerja Murid (LKPD) Inquiry',
  'Lembar Kerja Murid (LKPD) PBL/PjBL',
  'Lembar Kerja Murid (LKPD) HOTS',
  'Asesmen Pilihan Ganda & Uraian HOTS',
  'Asesmen AKM & Studi Kasus',
  'Rubrik Penilaian Proyek & Sikap',
  'Kegiatan Pengayaan & Remedial',
  'Model Refleksi Murid & Guru',
  'Saran Media Pembelajaran',
  'Ice Breaking Menarik',
  'Pertanyaan Pemantik LOTS/MOTS/HOTS',
]

export const KURIKULUM = [
  { id: 'kumer', nama: 'Kurikulum Merdeka (Nasional)' },
  { id: 'kbc', nama: 'Kurikulum Berbasis Cinta (Kemenag)' },
  { id: 'khas', nama: 'Kurikulum Khas Sekolah/Lokal' },
  { id: 'yayasan', nama: 'Kurikulum Standar Yayasan' },
]

export const TEMA_DOKUMEN: { id: DocumentDesign['theme']; nama: string }[] = [
  { id: 'modern', nama: 'Modern' },
  { id: 'formal', nama: 'Formal Kemendikdasmen' },
  { id: 'minimalis', nama: 'Minimalis' },
  { id: 'islami', nama: 'Islami hijau & emas' },
  { id: 'colorful', nama: 'Kreatif berwarna' },
  { id: 'mono', nama: 'Hitam putih (hemat tinta)' },
]

export function tahunAjaran(d = new Date()) {
  const y = d.getFullYear()
  return d.getMonth() >= 6 ? `${y}/${y + 1}` : `${y - 1}/${y}`
}

export const formBawaan = (school?: Partial<SchoolProfile>): AppFormData => ({
  namaGuru: school?.namaGuru ?? '',
  institusi: school?.namaSekolah ?? '',
  tahun: tahunAjaran(),
  jenjang: '',
  kelas: '',
  fase: '',
  semester: new Date().getMonth() >= 6 ? 'Ganjil' : 'Genap',
  mapel: '',
  elemen: '',
  cp: '',
  materi: '',
  jumlahPertemuan: 1,
  lamaWaktu: '2 x 40 menit',
  model: MODEL[0],
  pendekatan: 'Deep Learning (Pembelajaran Mendalam)',
  metode: 'Diskusi, Tanya Jawab, Penugasan Mandiri',
  strategi: 'Pembelajaran Berdiferensiasi',
  media: 'Slide presentasi, gambar konseptual, kuis interaktif',
  sumberBelajar: 'Buku Guru & Buku Murid Kurikulum Merdeka Kemendikdasmen',
  karakteristikMurid: 'Murid reguler dengan beragam gaya belajar',
  kesiapanBelajar: 'Murid secara umum telah menguasai prasyarat dasar materi ini',
  saranaPrasarana: 'Proyektor, laptop, akses internet, papan tulis',
  isDaring: false,
  kurikulum: 'kumer',
  topikPancaCinta: [],
  materiInsersi: [],
  profilLulusan: ['Penalaran Kritis', 'Kolaborasi'],
  uploadedText: null,
  uploadedImage: null,
})

export const desainBawaan: DocumentDesign = {
  theme: 'modern',
  primaryColor: '#1d6b52',
  secondaryColor: '#c8503a',
  fontFamily: 'sans-serif',
  marginSize: 'normal',
  headerText: 'MODUL AJAR',
  footerText: 'Disusun dengan Ruang · irsyads.com',
  showCover: true,
  useIcons: true,
  showPageNumbers: true,
}

export const sekolahBawaan: SchoolProfile = { namaSekolah: '', alamat: '', npsn: '', nss: '', kepalaSekolah: '', namaGuru: '' }

export type KontenModul = {
  form: AppFormData
  blocks: ModuleBlock[]
  design: DocumentDesign
  school: SchoolProfile
  versions: { id: string; waktu: string; label: string; blocks: ModuleBlock[] }[]
  audit?: AnalisisAudit | null
}

/** Durasi per sesi mengikuti aturan APMA asli. */
export function hitungDurasi(f: AppFormData): AppFormData {
  const menit = parseInt(f.lamaWaktu.replace(/(\d+)\s*x\s*(\d+)/i, (_, a, b) => String(Number(a) * Number(b))).replace(/\D/g, ''), 10) || 0
  const total = f.jumlahPertemuan * menit
  let pendahuluan = 0
  let penutup = 0
  if (menit > 0) {
    const r = menit <= 25 ? 0.2 : 0.15
    pendahuluan = Math.floor(menit * r)
    penutup = Math.floor(menit * r)
    if (menit >= 40) {
      pendahuluan = Math.max(5, pendahuluan)
      penutup = Math.max(5, penutup)
    }
  }
  return {
    ...f,
    alokasi: `${f.jumlahPertemuan} pertemuan (total ${total} menit)`,
    durasiPendahuluanPerSesi: `${pendahuluan} menit`,
    durasiIntiPerSesi: `${menit - pendahuluan - penutup} menit`,
    durasiPenutupPerSesi: `${penutup} menit`,
  }
}
