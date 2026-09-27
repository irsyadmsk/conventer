import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Clock3, Flame, Lightbulb, Library, Pin, Sparkles, TrendingUp, Users, Zap } from 'lucide-react'
import { ALAT, alatById } from '@/tools'
import { useAuth } from '@/lib/auth'
import { useFamily } from '@/lib/family'
import { usePrefs } from '@/lib/prefs'
import { useItems } from '@/lib/items'
import { useAkses } from '@/lib/akses'
import { Sunda } from '@/legacy'
import { awalHari, buatWawasan, deretHarian, hitungBeruntun, menitDihemat, tambahHari, useRingkasan } from '@/lib/wawasan'
import { cn, sapaan, tanggalPanjang, waktuRelatif } from '@/lib/utils'
import { AngkaHidup, stagger } from '@/components/ui/Layout'
import { Avatar, Badge, CopyButton } from '@/components/ui/Controls'
import { AreaChart } from '@/components/charts/Charts'
import { Button } from '@/components/ui/Button'

function Kotak({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, delay }}
      className={cn('card p-5', className)}
    >
      {children}
    </motion.section>
  )
}

export default function Beranda() {
  const { namaTampil } = useAuth()
  const { keluarga, anggota } = useFamily()
  const { prefs } = usePrefs()
  const nav = useNavigate()
  const [kilat, setKilat] = useState('')
  const { akses } = useAkses('apma')

  const hariIni = awalHari()
  const besok = tambahHari(hariIni, 1)
  const mulai7 = tambahHari(hariIni, -6)
  const mulai30 = tambahHari(hariIni, -29)
  const { data: pekan } = useRingkasan(mulai7, besok, 'pribadi')
  const { data: bulan } = useRingkasan(mulai30, besok, 'pribadi')
  const { data: pekanLalu } = useRingkasan(tambahHari(mulai7, -7), mulai7, 'pribadi')
  const { items, memuat: memuatItem } = useItems({ batas: 6 })

  const deret = useMemo(() => deretHarian(pekan, mulai7, 7), [pekan, mulai7])
  const hariIniN = deret[6]?.nilai ?? 0
  const beruntun = hitungBeruntun(bulan)
  const wawasan = useMemo(() => buatWawasan(pekan, pekanLalu, 'pribadi', !!keluarga).slice(0, 3), [pekan, pekanLalu, keluarga])

  const terakhir = (prefs.recentTools ?? []).map(alatById).filter(Boolean) as typeof ALAT
  const cepat = [...terakhir, ...ALAT.filter((a) => !terakhir.includes(a) && !['beranda', 'pengaturan', 'keluarga'].includes(a.id))].slice(0, 8)

  // "Muhammad Irsyad …" disapa "Irsyad": nama depan Muhammad/Moh./M. lazimnya bukan nama panggilan.
  const kata = namaTampil.split(/\s+/).filter(Boolean)
  const namaDepan = kata.length > 1 && /^(muhamm?ad|moh?amm?ad|mochamm?ad|muh\.?|moh\.?|m\.)$/i.test(kata[0]) ? kata[1] : kata[0] ?? ''
  const salam = `${sapaan()}, ${namaDepan}`

  return (
    <div className="flex flex-col gap-4">
      {/* Sapaan */}
      <header className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[32px] leading-tight font-semibold tracking-tight sm:text-[40px]" aria-label={salam}>
            {salam.split(' ').map((w, i) => (
              <span key={i} className="mr-[0.25em] inline-block overflow-hidden pb-1 align-bottom" aria-hidden>
                <motion.span
                  className={cn('inline-block', i === salam.split(' ').length - 1 && 'text-accent-text')}
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <p className="mt-1.5 text-ink-2">
            <span className="font-semibold text-ink">{tanggalPanjang(new Date())}.</span>{' '}
            {keluarga ? `Ruang keluarga ${keluarga.name} tersinkron dengan ${anggota.length} anggota.` : 'Semua pekerjaan Anda tersimpan dan tersinkron di akun ini.'}
          </p>
        </div>
        {akses?.boleh && (
          <Button varian="primary" ikon={<Sparkles />} onClick={() => nav('/modul-ajar')}>
            Buat modul ajar
          </Button>
        )}
      </header>

      {/* Statistik */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: 'Aktivitas hari ini', v: hariIniN, ikon: Zap },
          { l: 'Hari beruntun', v: beruntun, ikon: Flame, akhir: ' hari' },
          { l: 'Menit dihemat (7 hari)', v: menitDihemat(pekan), ikon: Clock3, akhir: ' mnt' },
          { l: 'Tersimpan (30 hari)', v: bulan?.items_created ?? 0, ikon: Library },
        ].map((s, i) => (
          <motion.div
            key={s.l}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, type: 'spring', stiffness: 260, damping: 26 }}
            whileHover={{ y: -3 }}
            className={cn('card p-4', i === 0 && 'bg-ink text-bg border-ink')}
          >
            <div className="flex items-center justify-between">
              <p className={cn('text-[12.5px] font-semibold', i === 0 ? 'opacity-75' : 'text-ink-3')}>{s.l}</p>
              <s.ikon className={cn('size-4', i === 0 ? 'text-accent' : 'text-accent-text')} aria-hidden />
            </div>
            <p className="mt-2 font-display text-[32px] leading-none font-semibold">
              <AngkaHidup nilai={s.v} />
              {s.akhir && <span className="text-base font-medium opacity-70">{s.akhir}</span>}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Akses cepat */}
        <Kotak className="lg:col-span-2" delay={0.1}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">{terakhir.length ? 'Lanjutkan' : 'Mulai dari sini'}</h2>
            <span className="text-xs text-ink-3">Ctrl K untuk mencari</span>
          </div>
          <motion.ul variants={stagger.wadah} initial="hidden" animate="show" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {cepat.map((a) => (
              <motion.li key={a.id} variants={stagger.anak}>
                <Link to={a.path} className="group flex h-full flex-col gap-2.5 rounded-2xl border border-line bg-surface p-3.5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-2 hover:shadow-[var(--shadow-lift)]">
                  <span className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent-text transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                      <a.ikon className="size-5" aria-hidden />
                    </span>
                    <ArrowUpRight className="size-4 text-ink-3 opacity-0 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{a.nama}</span>
                    <span className="line-clamp-2 text-xs text-ink-3">{a.ringkas}</span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </Kotak>

        {/* Konversi kilat */}
        <Kotak delay={0.15} className="flex flex-col">
          <h2 className="mb-1 font-bold">Aksara kilat</h2>
          <p className="mb-3 text-xs text-ink-3">Ketik Latin, langsung jadi aksara Sunda.</p>
          <label htmlFor="kilat" className="sr-only">
            Teks Latin
          </label>
          <input id="kilat" value={kilat} onChange={(e) => setKilat(e.target.value)} className="field h-11" placeholder="Sampurasun…" />
          <div className="mt-3 flex min-h-24 flex-1 items-center justify-center rounded-2xl bg-surface-2 p-3 text-center">
            <p className="sunda text-[28px] leading-snug break-words">{kilat ? Sunda.latinToSunda(kilat) : <span className="text-ink-3 opacity-60">ᮞᮙ᮪ᮕᮥᮛᮞᮥᮔ᮪</span>}</p>
          </div>
          <div className="mt-3 flex justify-between">
            <CopyButton teks={kilat ? Sunda.latinToSunda(kilat) : ''} tool="aksara" varian="ghost" />
            <Link to="/aksara" className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent-text hover:underline">
              Buka lengkap <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </Kotak>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Tren */}
        <Kotak className="lg:col-span-2" delay={0.2}>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Tujuh hari terakhir</h2>
              <p className="text-xs text-ink-3">{pekan ? `${pekan.total} aktivitas · ${pekan.active_days} hari aktif` : 'Memuat…'}</p>
            </div>
            <Link to="/laporan" className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent-text hover:underline">
              Laporan lengkap <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {pekan ? <AreaChart data={deret} judul="Aktivitas tujuh hari terakhir" tinggi={180} /> : <div className="skeleton h-44" />}
        </Kotak>

        {/* Wawasan */}
        <Kotak delay={0.25}>
          <h2 className="mb-3 flex items-center gap-2 font-bold">
            <Lightbulb className="size-4 text-accent-text" aria-hidden /> Wawasan
          </h2>
          {!pekan ? (
            <div className="flex flex-col gap-2">
              <div className="skeleton h-12" />
              <div className="skeleton h-12" />
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {wawasan.map((w, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="flex gap-2.5 rounded-xl bg-surface-2 p-3 text-[13.5px]">
                  <TrendingUp className={cn('mt-0.5 size-4 shrink-0', w.nada === 'baik' ? 'text-success' : w.nada === 'perhatian' ? 'text-warning' : 'text-ink-3')} aria-hidden />
                  {w.teks}
                </motion.li>
              ))}
            </ul>
          )}
        </Kotak>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Koleksi terbaru */}
        <Kotak className="lg:col-span-2" delay={0.3}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Koleksi terbaru</h2>
            <Link to="/koleksi" className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent-text hover:underline">
              Semua <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {memuatItem ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line-2 p-6 text-center text-sm text-ink-3">Belum ada yang disimpan. Tekan “Simpan” di alat mana pun — hasilnya muncul di sini dan di semua perangkat.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {items.map((it) => {
                const a = alatById(it.tool)
                return (
                  <li key={it.id}>
                    <Link to={`/koleksi?buka=${it.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:border-line-2 hover:bg-surface-2">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-ink-2">{a ? <a.ikon className="size-4" /> : <Library className="size-4" />}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 truncate text-sm font-semibold">
                          {it.pinned && <Pin className="size-3 text-accent-text" aria-label="Disematkan" />}
                          {it.title}
                        </span>
                        <span className="block truncate text-xs text-ink-3">
                          {a?.nama ?? it.kind} · {waktuRelatif(it.updated_at)}
                        </span>
                      </span>
                      {it.family_id && (
                        <Badge nada="info">
                          <Users className="size-3" /> Keluarga
                        </Badge>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Kotak>

        {/* Keluarga */}
        <Kotak delay={0.35}>
          <h2 className="mb-3 flex items-center gap-2 font-bold">
            <Users className="size-4 text-accent-text" aria-hidden /> Keluarga
          </h2>
          {keluarga ? (
            <>
              <p className="mb-3 font-display text-xl font-semibold">{keluarga.name}</p>
              <ul className="flex flex-col gap-2">
                {anggota.slice(0, 5).map((a) => (
                  <li key={a.user_id} className="flex items-center gap-2.5">
                    <Avatar nama={a.display_name} ukuran={30} />
                    <span className="flex-1 truncate text-sm font-semibold">{a.display_name}</span>
                    <span className="text-xs text-ink-3 capitalize">{a.role === 'owner' ? 'Pemilik' : a.role}</span>
                  </li>
                ))}
              </ul>
              <Button ukuran="sm" varian="ghost" className="mt-3" penuh onClick={() => nav('/keluarga')}>
                Kelola keluarga
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-ink-2">Satukan akun pasangan, anak, atau orang tua. Koleksi & laporan bisa dibagikan, masing-masing tetap punya ruang pribadi.</p>
              <Button varian="soft" onClick={() => nav('/keluarga')}>
                Buat atau gabung keluarga
              </Button>
            </div>
          )}
        </Kotak>
      </div>
    </div>
  )
}
