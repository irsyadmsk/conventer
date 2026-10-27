import { lazy, Suspense, useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ArrowLeft, BarChart3, GraduationCap, Languages, Users } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { ecosystemUrl } from '@/lib/appearance'
import { SharedNavigation } from '@/components/layout/SharedNavigation'
import AppearancePreferences from '@/lib/appearance-preferences'

gsap.registerPlugin(useGSAP)

const AksaraField = lazy(() => import('./AksaraField'))

const FITUR = [
  { ikon: Users, teks: 'Akun keluarga — koleksi & laporan tersinkron antaranggota' },
  { ikon: Languages, teks: 'Aksara Sunda, Morse, codec, sandi, hash, QR' },
  { ikon: GraduationCap, teks: 'LessonCraft — draf modul ajar dengan template lokal' },
  { ikon: BarChart3, teks: 'Koleksi dan laporan untuk pekerjaan keluarga' },
]

export function AuthLayout({ judul, sub, children, kaki }: { judul: string; sub: ReactNode; children: ReactNode; kaki?: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null)
  const language = window.IrsyadsLanguage?.preferredLanguage() || 'id'

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('.kata', { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.07 })
          .from('.fitur', { x: -16, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.45')
      })
    },
    { scope: panel },
  )

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <div ref={panel} className="relative hidden overflow-hidden border-r border-line bg-bg-2 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="grain pointer-events-none absolute inset-0 opacity-60" />
        <Suspense fallback={null}>
          <AksaraField />
        </Suspense>
        <div className="relative flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2"><AppearancePreferences /><SharedNavigation /></div>
        </div>
        <div className="relative max-w-lg">
          <h2 className="font-display text-[46px] leading-[1.05] font-semibold tracking-[-0.02em] xl:text-[56px]">
            {['Satu', 'ruang', 'untuk', 'semua', 'pekerjaan', 'keluarga.'].map((k, i) => (
              <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
                <span className={`kata inline-block ${i === 5 ? 'text-accent-text italic' : ''}`}>{k}&nbsp;</span>
              </span>
            ))}
          </h2>
          <ul className="mt-8 flex flex-col gap-3">
            {FITUR.map(({ ikon: I, teks }) => (
              <li key={teks} className="fitur flex items-center gap-3 text-[15px] text-ink-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface text-accent-text shadow-[var(--shadow-soft)]">
                  <I className="size-[18px]" aria-hidden />
                </span>
                {teks}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-[13px] text-ink-3">
          Dikembangkan oleh Muhammad Irsyad Sirojul Khoeir ·{' '}
          <a href={ecosystemUrl('site','https://irsyads.com',['id','en','ar'])} className="font-semibold text-ink-2 underline-offset-4 hover:underline">
            irsyads.com
          </a>
        </p>
      </div>

      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <a
            href={ecosystemUrl('site','https://irsyads.com',['id','en','ar'])}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-3 hover:text-ink transition-colors py-1.5 px-3 rounded-xl border border-line bg-surface/80"
            title="Kembali ke portal utama irsyads.com"
          >
            <ArrowLeft className="size-3.5" />
            <span>irsyads.com</span>
          </a>
          <div className="ms-auto flex items-center gap-2">
            <div className="lg:hidden">
              <Logo />
            </div>
            <AppearancePreferences />
            <SharedNavigation />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[400px]"
          >
            <h1 className="font-display text-[32px] leading-tight font-semibold tracking-tight">{judul}</h1>
            <p className="mt-2 text-[15px] text-ink-2">{sub}</p>
            {language !== 'id' && <p className="mt-3 text-xs text-ink-2" lang={language} dir={language==='ar'?'rtl':'ltr'}>{language==='en'?'Toolkit currently uses Indonesian. Your ecosystem language preference is kept.':language==='zh'?'Toolkit目前使用印度尼西亚语。您在Irsyads中的语言偏好会保留。':'واجهة Toolkit متاحة حاليًا بالإندونيسية. يبقى تفضيل لغتك محفوظًا في المنظومة.'}</p>}
            <div className="mt-8">{children}</div>
            {kaki && <div className="mt-8 text-center text-sm text-ink-2">{kaki}</div>}
          </motion.div>
        </div>
        <p className="text-center text-xs text-ink-3">
          Akun Ruang sama dengan akun{' '}
          <a href={ecosystemUrl('site','https://irsyads.com',['id','en','ar'])} className="font-semibold hover:underline">
            irsyads.com
          </a>{' '}
          — satu akun untuk semuanya.
        </p>
      </div>
    </div>
  )
}

export function GoogleButton({ onClick, memuat }: { onClick: () => void; memuat?: boolean }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={memuat}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-line-2 bg-surface text-[15px] font-semibold transition-colors hover:bg-surface-2 disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 12s4.3 9.7 9.6 9.7c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
      </svg>
      Lanjutkan dengan Google
    </motion.button>
  )
}

export function Pemisah() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs font-semibold text-ink-3">
      <span className="h-px flex-1 bg-line" />
      atau dengan email
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}
