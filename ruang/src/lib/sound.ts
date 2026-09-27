/**
 * Umpan balik "haptic" kecil: bunyi klik lembut via WebAudio + getar di ponsel.
 * Aktif hanya bila pengguna menyalakannya di preferensi.
 */
let ctx: AudioContext | null = null
let aktif = false

export function setSuaraAktif(v: boolean) {
  aktif = v
}

type Nada = 'tap' | 'sukses' | 'galat' | 'toggle'

const RESEP: Record<Nada, { f: number[]; d: number; tipe: OscillatorType; vol: number; getar: number | number[] }> = {
  tap: { f: [680], d: 0.045, tipe: 'sine', vol: 0.05, getar: 8 },
  toggle: { f: [520, 780], d: 0.05, tipe: 'triangle', vol: 0.045, getar: 10 },
  sukses: { f: [660, 990], d: 0.08, tipe: 'sine', vol: 0.06, getar: [10, 40, 12] },
  galat: { f: [300, 220], d: 0.09, tipe: 'square', vol: 0.03, getar: [30, 30, 30] },
}

export function bunyi(n: Nada = 'tap') {
  if (!aktif) return
  const r = RESEP[n]
  try {
    navigator.vibrate?.(r.getar)
  } catch {
    /* tidak didukung */
  }
  try {
    ctx ??= new AudioContext()
    const t0 = ctx.currentTime
    r.f.forEach((f, i) => {
      const o = ctx!.createOscillator()
      const g = ctx!.createGain()
      o.type = r.tipe
      o.frequency.value = f
      const mulai = t0 + i * r.d * 0.9
      g.gain.setValueAtTime(0.0001, mulai)
      g.gain.exponentialRampToValueAtTime(r.vol, mulai + 0.008)
      g.gain.exponentialRampToValueAtTime(0.0001, mulai + r.d)
      o.connect(g).connect(ctx!.destination)
      o.start(mulai)
      o.stop(mulai + r.d + 0.02)
    })
  } catch {
    /* audio diblokir */
  }
}
