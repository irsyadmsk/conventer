// Membuat ikon PWA dari logo Ruang (pintu dengan gagang). Jalankan: node scripts/buat-ikon.mjs
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const INK = '#14183e'
const KREM = '#f6f1e8'
const KORAL = '#f07e66'

// Glyph pintu dalam kotak 64×64, digeser/diskalakan untuk varian maskable.
const glyph = (skala = 1) => {
  const t = (64 - 64 * skala) / 2
  return `<g transform="translate(${t} ${t}) scale(${skala})">
    <path d="M18 46V22a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v24" fill="none" stroke="${KREM}" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M14 46h36" stroke="${KREM}" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="38" cy="33" r="3.4" fill="${KORAL}"/>
  </g>`
}

const biasa = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${INK}"/>${glyph(1)}</svg>`
// Maskable: latar penuh tanpa sudut membulat, isi dalam zona aman 80%.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${INK}"/>${glyph(0.72)}</svg>`

await mkdir('public/ikon', { recursive: true })
const tugas = [
  ['public/ikon/ikon-192.png', biasa, 192],
  ['public/ikon/ikon-512.png', biasa, 512],
  ['public/ikon/maskable-512.png', maskable, 512],
  ['public/ikon/apple-touch-icon.png', maskable, 180],
]
for (const [berkas, svg, ukuran] of tugas) {
  await sharp(Buffer.from(svg), { density: 400 }).resize(ukuran, ukuran).png({ compressionLevel: 9 }).toFile(berkas)
  console.log('✓', berkas)
}
