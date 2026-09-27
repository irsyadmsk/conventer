import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { AppFormData, DocumentDesign, ModuleBlock, SchoolProfile } from './types'
import { unduh } from '@/lib/utils'

export const mdKeHtml = (md: string) => DOMPurify.sanitize(marked.parse(md ?? '', { async: false }) as string)

const aman = (s: string | undefined) => (s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Baca rujukan: PDF & DOCX jadi teks (di perangkat), gambar jadi base64 untuk AI. */
export async function bacaBerkas(file: File): Promise<{ text: string | null; image: { mimeType: string; data: string } | null }> {
  if (file.type === 'application/pdf') {
    const pdfjs = await import('pdfjs-dist')
    pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
    let teks = ''
    for (let i = 1; i <= Math.min(pdf.numPages, 60); i++) {
      const page = await pdf.getPage(i)
      const isi = await page.getTextContent()
      teks += `\n--- Halaman ${i} ---\n${isi.items.map((it) => ('str' in it ? it.str : '')).join(' ')}`
    }
    return { text: teks.slice(0, 60000), image: null }
  }
  if (file.name.toLowerCase().endsWith('.docx')) {
    const mammoth = await import('mammoth')
    const r = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
    return { text: r.value.slice(0, 60000), image: null }
  }
  if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp') {
    const data = await new Promise<string>((res, rej) => {
      const fr = new FileReader()
      fr.onload = () => res(String(fr.result).split(',')[1] ?? '')
      fr.onerror = rej
      fr.readAsDataURL(file)
    })
    return { text: null, image: { mimeType: file.type, data } }
  }
  throw new Error('Format belum didukung. Gunakan PDF, DOCX, JPG, atau PNG.')
}

const IKON: [RegExp, string][] = [
  [/identitas|informasi umum/, '📋 '],
  [/tujuan|kktp/, '🎯 '],
  [/pemahaman|pemantik/, '💡 '],
  [/asesmen|rencana/, '📊 '],
  [/kegiatan/, '🚶 '],
  [/refleksi/, '🔄 '],
  [/lkpd|lembar kerja/, '📝 '],
  [/rubrik/, '📐 '],
  [/kisi|soal/, '✏️ '],
  [/pengayaan|remedial/, '🚀 '],
  [/bacaan|media/, '📚 '],
  [/glosarium|pustaka/, '📖 '],
]
const ikonBlok = (t: string, pakai: boolean) => (pakai ? (IKON.find(([r]) => r.test(t.toLowerCase()))?.[1] ?? '🔹 ') : '')

/** Susun dokumen HTML lengkap (dipakai untuk cetak, HTML, dan Word). */
export function susunDokumen(blocks: ModuleBlock[], design: DocumentDesign, school: SchoolProfile | undefined, form: AppFormData, untukWord = false) {
  const { fontFamily, theme, primaryColor: p, secondaryColor: s, marginSize, headerText, footerText, showCover, useIcons, showPageNumbers } = design
  const huruf = fontFamily === 'serif' ? "Lora, 'Times New Roman', serif" : fontFamily === 'mono' ? "'Courier Prime', 'Courier New', monospace" : "Inter, Calibri, Arial, sans-serif"
  const margin = marginSize === 'narrow' ? '12mm' : marginSize === 'wide' ? '35mm' : '20mm'

  const kop =
    school && (school.namaSekolah || school.logoUrl)
      ? `<div style="display:flex;align-items:center;justify-content:center;border-bottom:3px double ${p};padding-bottom:12px;margin-bottom:24px;text-align:center">
          ${school.logoUrl ? `<img src="${school.logoUrl}" style="height:70px;margin-right:16px" />` : ''}
          <div><div style="font-size:14pt;font-weight:bold;text-transform:uppercase;color:${p}">${aman(school.namaSekolah)}</div>
          <div style="font-size:10pt;color:#334155">${aman(school.alamat)}</div>
          <div style="font-size:9pt;color:#64748b">NPSN: ${aman(school.npsn) || '-'} | NSS: ${aman(school.nss) || '-'}</div></div></div>`
      : ''

  const sampul = showCover
    ? `<div class="sampul" style="page-break-after:always;text-align:center;padding:60px 30px;${theme === 'formal' ? `border:4px double ${p};` : theme === 'islami' ? `border-top:14px solid ${p};border-bottom:14px solid ${p};` : theme === 'modern' ? `border-top:6px solid ${p};` : theme === 'colorful' ? `border:3px solid ${p};border-radius:24px;` : ''}">
        ${school?.logoUrl ? `<img src="${school.logoUrl}" style="height:90px;margin-bottom:20px" />` : ''}
        <div style="font-size:12pt;font-weight:bold;color:${s};letter-spacing:2px">DOKUMEN PERENCANAAN PEMBELAJARAN</div>
        <div style="margin:50px 0"><div style="font-size:26pt;font-weight:800;color:${p}">MODUL AJAR</div>
        <div style="font-size:14pt;font-weight:600;color:#475569;margin-top:10px">${aman((form.mapel || '').toUpperCase())}</div>
        <div style="font-size:12pt;color:#475569;margin-top:6px">${aman(form.materi)}</div>
        <div style="font-size:11pt;color:#64748b;margin-top:14px">Fase ${aman(form.fase) || '-'} / Kelas ${aman(form.kelas) || '-'}</div></div>
        <table style="width:100%;border:none;margin-top:40px"><tr>
          <td style="border:none;text-align:center"><b>Penyusun</b><br/>${aman(school?.namaGuru || form.namaGuru)}</td>
          <td style="border:none;text-align:center"><b>Institusi</b><br/>${aman(school?.namaSekolah || form.institusi)}</td>
          <td style="border:none;text-align:center"><b>Tahun Ajaran</b><br/>${aman(form.tahun)}</td>
        </tr></table></div>`
    : ''

  let bab = ''
  const isi = blocks
    .map((b) => {
      let judulBab = ''
      const kat = b.category
      if (kat !== bab) {
        bab = kat
        const n = kat === 'Informasi Umum' ? 'I' : kat === 'Komponen Inti' ? 'II' : 'III'
        judulBab = `<h2 class="bab" style="${n !== 'I' ? 'page-break-before:always;' : ''}border-bottom:2px solid ${p};color:${p}">BAB ${n}: ${kat.toUpperCase()}</h2>`
      }
      return `${judulBab}<div class="blok"><h3>${ikonBlok(b.title, useIcons)}${aman(b.title)}</h3>${mdKeHtml(b.content)}</div>`
    })
    .join('\n')

  const aksen =
    theme === 'mono'
      ? 'h3{color:#000;border-bottom:2px solid #000} th{background:#f3f4f6;color:#000}'
      : theme === 'minimalis'
        ? 'h3{color:#000;border-bottom:1px solid #000} th{background:#fff}'
        : `h3{color:${p};border-bottom:2px solid ${theme === 'islami' ? s : p}} th{background:${theme === 'formal' ? '#f1f5f9' : p};color:${theme === 'formal' ? '#1e293b' : '#fff'}}`

  const css = `
    @page { size: A4; margin: ${margin}; }
    body { font-family: ${huruf}; font-size: 11pt; line-height: 1.6; color: #1e293b; max-width: 850px; margin: 0 auto; padding: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; vertical-align: top; }
    h2.bab { font-size: 14pt; text-align: left; padding-bottom: 6px; margin-top: 24px; }
    h3 { font-size: 13pt; margin-top: 22px; padding-bottom: 4px; }
    h4 { font-size: 11pt; margin-top: 14px; }
    ul, ol { padding-left: 22px; }
    .blok { margin-bottom: 18px; }
    .kepala { position: fixed; top: 0; left: 0; right: 0; font-size: 8pt; color: #64748b; text-align: center; border-bottom: 1px solid #e2e8f0; }
    .kaki { position: fixed; bottom: 0; left: 0; right: 0; font-size: 8pt; color: #64748b; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; }
    .nomor::after { content: "Halaman " counter(page); }
    @media screen { .kepala, .kaki { display: none; } }
    ${aksen}`

  const wordNs = untukWord
    ? ` xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"`
    : ''

  return `<!DOCTYPE html><html lang="id"${wordNs}><head><meta charset="utf-8"><title>Modul Ajar - ${aman(form.materi || form.mapel)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Lora:wght@400;700&family=Courier+Prime&display=swap" rel="stylesheet"><style>${css}</style></head>
<body>${headerText ? `<div class="kepala">${aman(headerText)}</div>` : ''}${showPageNumbers || footerText ? `<div class="kaki"><span>${aman(footerText)}</span>${showPageNumbers ? '<span class="nomor"></span>' : ''}</div>` : ''}
${sampul}${kop}${isi}</body></html>`
}

export function cetak(html: string) {
  const dok = html.replace('</body>', '<script>window.onload=()=>{setTimeout(()=>window.print(),300)}</script></body>')
  const url = URL.createObjectURL(new Blob([dok], { type: 'text/html;charset=utf-8' }))
  const w = window.open(url, '_blank')
  if (!w) throw new Error('Jendela cetak diblokir. Izinkan pop-up untuk situs ini.')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export const namaBerkas = (form: AppFormData) => `Modul Ajar - ${(form.materi || form.mapel || 'Baru').replace(/[\\/:*?"<>|]/g, '')}`

export function eksporWord(html: string, form: AppFormData) {
  unduh(`${namaBerkas(form)}.doc`, '﻿' + html, 'application/msword')
}
export function eksporHtml(html: string, form: AppFormData) {
  unduh(`${namaBerkas(form)}.html`, html, 'text/html;charset=utf-8')
}
export function eksporMarkdown(blocks: ModuleBlock[], form: AppFormData) {
  unduh(`${namaBerkas(form)}.md`, blocks.map((b) => `## ${b.title}\n\n${b.content}`).join('\n\n---\n\n'), 'text/markdown;charset=utf-8')
}
