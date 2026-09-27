import type { ModuleBlock } from './types'

export type AnalisisAudit = {
  score: number
  checklist?: Record<string, boolean>
  scores?: Record<string, number>
  warnings?: { type: string; message: string }[]
  recommendations?: string[]
  kelebihan?: string[]
}

/** Blok baku yang diminta assemblePrompt; dipakai untuk mendeteksi modul terpotong. */
export const BLOK_STANDAR: { judul: string; kunci: RegExp; kategori: ModuleBlock['category'] }[] = [
  { judul: 'Identitas & Informasi Umum', kunci: /identitas|informasi umum/i, kategori: 'Informasi Umum' },
  { judul: 'Tujuan Pembelajaran & KKTP', kunci: /tujuan pembelajaran/i, kategori: 'Komponen Inti' },
  { judul: 'Pemahaman Bermakna & Pertanyaan Pemantik', kunci: /pemahaman bermakna|pemantik/i, kategori: 'Komponen Inti' },
  { judul: 'Rencana Asesmen', kunci: /rencana asesmen/i, kategori: 'Komponen Inti' },
  { judul: 'Refleksi & Tindak Lanjut', kunci: /refleksi/i, kategori: 'Komponen Inti' },
  { judul: 'Lampiran 1 - Lembar Kerja Murid (LKPD)', kunci: /lampiran 1\b|lkpd/i, kategori: 'Lampiran' },
  { judul: 'Lampiran 2 - Rubrik Penilaian', kunci: /lampiran 2\b|rubrik/i, kategori: 'Lampiran' },
  { judul: 'Lampiran 3 - Kisi-Kisi & Soal Asesmen', kunci: /lampiran 3\b|kisi/i, kategori: 'Lampiran' },
  { judul: 'Lampiran 4 - Pengayaan dan Remedial', kunci: /lampiran 4\b|pengayaan|remedial/i, kategori: 'Lampiran' },
  { judul: 'Lampiran 5 - Bahan Bacaan & Media Pembelajaran', kunci: /lampiran 5\b|bahan bacaan/i, kategori: 'Lampiran' },
  { judul: 'Lampiran 6 - Glosarium & Daftar Pustaka', kunci: /lampiran 6\b|glosarium|pustaka/i, kategori: 'Lampiran' },
]

/**
 * Deteksi modul yang terpotong: blok baku yang tidak ada, dan blok terakhir
 * yang berhenti di tengah kalimat (mis. jawaban AI mencapai batas token).
 */
export function periksaKelengkapan(blocks: ModuleBlock[]) {
  const hilang = BLOK_STANDAR.filter((s) => !blocks.some((b) => s.kunci.test(b.title)))
  const akhir = blocks[blocks.length - 1]?.content.trim() ?? ''
  // Selesai wajar: tanda baca penutup, tabel, daftar, atau garis isian.
  const terpotong = akhir.length > 0 && !/[.!?:;)\]|"”'*_>…-]$/.test(akhir)
  return { hilang, terpotong }
}

/** Audit lokal cepat (tanpa AI) sebagai cadangan & pratinjau instan. */
export function auditLokal(blocks: ModuleBlock[]): AnalisisAudit {
  const semua = blocks.map((b) => `${b.title}\n${b.content}`).join('\n').toLowerCase()
  const ada = (...k: string[]) => k.some((x) => semua.includes(x))
  const checklist = {
    cp: ada('capaian pembelajaran', ' cp'),
    tp: ada('tujuan pembelajaran'),
    kktp: ada('kktp', 'kriteria ketercapaian'),
    asesmenAwal: ada('diagnostik', 'asesmen awal'),
    formatif: ada('formatif'),
    sumatif: ada('sumatif'),
    lkpd: ada('lkpd', 'lembar kerja'),
    rubrik: ada('rubrik'),
    daftarPustaka: ada('daftar pustaka', 'glosarium'),
  }
  const lama = [
    ['peserta didik', 'Murid'],
    ['iktp', 'KKTP'],
    ['profil pelajar pancasila', 'Dimensi Profil Lulusan'],
    ['kompetensi awal', 'Kesiapan Belajar Murid'],
  ].filter(([o]) => semua.includes(o))
  const lengkap = Object.values(checklist).filter(Boolean).length
  return {
    score: Math.round((lengkap / 9) * 85 + (lama.length ? 0 : 15)),
    checklist,
    warnings: lama.map(([o, n]) => ({ type: 'regulasi', message: `Istilah “${o}” sebaiknya diganti “${n}”.` })),
    recommendations: Object.entries(checklist)
      .filter(([, v]) => !v)
      .map(([k]) => `Tambahkan bagian ${{ cp: 'Capaian Pembelajaran', tp: 'Tujuan Pembelajaran', kktp: 'KKTP', asesmenAwal: 'asesmen diagnostik', formatif: 'asesmen formatif', sumatif: 'asesmen sumatif', lkpd: 'LKPD', rubrik: 'rubrik penilaian', daftarPustaka: 'glosarium & daftar pustaka' }[k]}.`),
  }
}
