import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const GLYPH = ['ᮃ', 'ᮊ', 'ᮞ', 'ᮛ', 'ᮔ', 'ᮓ', 'ᮜ', 'ᮙ', 'ᮝ', 'ᮠ', 'ᮌ', 'ᮕ', 'ᮘ', 'ᮚ', 'ᮎ', 'ᮏ', '᮱', '᮲', '᮳']

function teksturGlyph(ch: string, warna: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  // willReadFrequently: true memastikan canvas 2D disimpan di RAM CPU,
  // menghindari Chromium/ANGLE GPU pipeline stall (ReadPixels) saat diunggah ke WebGL
  const g = c.getContext('2d', { willReadFrequently: true })!
  g.font = '84px "Noto Sans Sundanese", sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillStyle = warna
  g.fillText(ch, 64, 70)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.generateMipmaps = false
  t.minFilter = THREE.LinearFilter
  return t
}

/**
 * Latar halaman masuk: aksara Sunda melayang pelan dalam ruang 3D, condong
 * mengikuti kursor. Berhenti total bila pengguna meminta gerak dikurangi.
 */
export default function AksaraField() {
  const wadah = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wadah.current
    if (!el) return
    const kurangiGerak = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduce'
    const gaya = getComputedStyle(document.documentElement)
    const ink = gaya.getPropertyValue('--ink').trim() || '#14183e'
    const aksen = gaya.getPropertyValue('--accent').trim() || '#c8503a'

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
      precision: 'mediump',
    })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
    renderer.setSize(el.clientWidth, el.clientHeight)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100)
    camera.position.z = 14

    let batal = false
    const bahan: THREE.SpriteMaterial[] = []
    const sprites: { s: THREE.Sprite; v: number; fase: number }[] = []
    const grup = new THREE.Group()
    scene.add(grup)

    document.fonts.load('84px "Noto Sans Sundanese"').finally(() => {
      if (batal) return
      const tekstur = GLYPH.map((g, i) => teksturGlyph(g, i % 5 === 0 ? aksen : ink))
      for (let i = 0; i < 70; i++) {
        const m = new THREE.SpriteMaterial({ map: tekstur[i % tekstur.length], transparent: true, opacity: 0, depthWrite: false })
        bahan.push(m)
        const s = new THREE.Sprite(m)
        const z = (Math.random() - 0.5) * 16
        s.position.set((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 16, z)
        const skala = 0.7 + Math.random() * 1.3
        s.scale.set(skala, skala, 1)
        grup.add(s)
        sprites.push({ s, v: 0.002 + Math.random() * 0.006, fase: Math.random() * Math.PI * 2 })
      }
    })

    let mx = 0
    let my = 0
    const gerak = (e: PointerEvent) => {
      mx = (e.clientX / innerWidth - 0.5) * 2
      my = (e.clientY / innerHeight - 0.5) * 2
    }
    addEventListener('pointermove', gerak)

    const ubahUkuran = () => {
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }
    const ro = new ResizeObserver(ubahUkuran)
    ro.observe(el)

    let raf = 0

    const putar = () => {

      const t = performance.now() / 1000
      for (const { s, v, fase } of sprites) {
        const m = s.material as THREE.SpriteMaterial
        m.opacity = Math.min(m.opacity + 0.01, 0.1 + ((s.position.z + 8) / 16) * 0.32)
        if (!kurangiGerak) {
          s.position.y += v
          s.position.x += Math.sin(t * 0.4 + fase) * 0.002
          if (s.position.y > 9) s.position.y = -9
        }
      }
      grup.rotation.y += (mx * 0.18 - grup.rotation.y) * 0.03
      grup.rotation.x += (my * 0.1 - grup.rotation.x) * 0.03
      renderer.render(scene, camera)
      raf = requestAnimationFrame(putar)
    }
    raf = requestAnimationFrame(putar)

    const lihat = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else raf = requestAnimationFrame(putar)
    }
    document.addEventListener('visibilitychange', lihat)

    return () => {
      batal = true
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', gerak)
      document.removeEventListener('visibilitychange', lihat)
      ro.disconnect()
      bahan.forEach((m) => {
        m.map?.dispose()
        m.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={wadah} aria-hidden className="absolute inset-0" />
}
