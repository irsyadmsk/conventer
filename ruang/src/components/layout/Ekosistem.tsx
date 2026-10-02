import registry from '@/irsyads-v1/ecosystem.json'
import { ecosystemUrl } from '@/lib/appearance'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Grid2x2 } from 'lucide-react'
import { cn } from '@/lib/utils'

import siteT from '@/assets/sublogo/site_light.svg?raw'
import siteG from '@/assets/sublogo/site_dark.svg?raw'
import academyT from '@/assets/sublogo/academy_light.svg?raw'
import academyG from '@/assets/sublogo/academy_dark.svg?raw'
import ruangT from '@/assets/sublogo/ruang_light.svg?raw'
import ruangG from '@/assets/sublogo/ruang_dark.svg?raw'
import walletT from '@/assets/sublogo/wallet_light.svg?raw'
import walletG from '@/assets/sublogo/wallet_dark.svg?raw'
import curriculumT from '@/assets/sublogo/curriculum_light.svg?raw'
import curriculumG from '@/assets/sublogo/curriculum_dark.svg?raw'
import idT from '@/assets/sublogo/id_light.svg?raw'
import idG from '@/assets/sublogo/id_dark.svg?raw'
import verifyT from '@/assets/sublogo/verify_light.svg?raw'
import verifyG from '@/assets/sublogo/verify_dark.svg?raw'
import lettersT from '@/assets/sublogo/letters_light.svg?raw'
import lettersG from '@/assets/sublogo/letters_dark.svg?raw'
import mosqueT from '@/assets/sublogo/masjidku_light.svg?raw'
import mosqueG from '@/assets/sublogo/masjidku_dark.svg?raw'
import studioT from '@/assets/sublogo/studio_light.svg?raw'
import studioG from '@/assets/sublogo/studio_dark.svg?raw'

/**
 * Pemilih "Ruang Irsyads" — cerminan peluncur di irsyads.com
 * (irsyads/packages/design-tokens/src/Experience.astro + ruang.ts +
 * sublogo/). Kisi ubin tiga kolom berkelompok dengan sub-logo resmi; Studio
 * di kaki; "Semua aplikasi" ke irsyads.com/apps. Berkas SVG di
 * src/assets/sublogo adalah SALINAN dari repo irsyads — perbarui keduanya
 * bersamaan bila menambah ruang.
 */
type Entri = { id: string; nama: string; ket: string; href: string; logo: [string, string] }

const LOGOS: Record<string, [string, string]> = { site:[siteT,siteG], academy:[academyT,academyG], ruang:[ruangT,ruangG], wallet:[walletT,walletG], curriculum:[curriculumT,curriculumG], id:[idT,idG], verify:[verifyT,verifyG], letters:[lettersT,lettersG], 'masjidku-tv':[mosqueT,mosqueG] }
const DEFAULT_CHOICES=registry.apps.filter(app=>app.launcher&&app.group!=='pengelola').slice(0,9).map(app=>({id:app.id,group:app.group}))
const groupChoices = (choices:{id:string;group:string}[]): { label: string; entri: Entri[] }[] => ['karya','aplikasi','akun'].map(group => ({
  label: registry.groups[group as keyof typeof registry.groups].id,
  entri: choices.filter(choice=>choice.group===group).flatMap(choice=>{const app=registry.apps.find(app=>app.id===choice.id&&app.launcher&&app.group!=='pengelola');return app?[{id:app.id,nama:app.name,ket:app.description.id,href:app.id==='ruang'?'/':app.url,logo:LOGOS[app.id]}]:[]}),
})).filter(group=>group.entri.length>0)

function SubLogo({ logo, className }: { logo: [string, string]; className?: string }) {
  return (
    <span className={cn('block shrink-0', className)} aria-hidden>
      <span className="block size-full dark:hidden [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: logo[0] }} />
      <span className="hidden size-full dark:block [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: logo[1] }} />
    </span>
  )
}

export function Ekosistem() {
  const [buka, setBuka] = useState(false)
  const [choices,setChoices]=useState(DEFAULT_CHOICES)
  const KELOMPOK=groupChoices(choices)
  useEffect(()=>{if(!buka)return;let active=true;window.IrsyadsLauncher?.readLauncher().then(value=>{if(active)setChoices(value)});return()=>{active=false}},[buka])
  const wadah = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!buka) return
    const klik = (e: MouseEvent) => !wadah.current?.contains(e.target as Node) && setBuka(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setBuka(false)
    document.addEventListener('mousedown', klik)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', klik)
      document.removeEventListener('keydown', esc)
    }
  }, [buka])

  return (
    <div ref={wadah} className="relative">
      <button
        onClick={() => setBuka((b) => !b)}
        aria-expanded={buka}
        aria-haspopup="true"
        className="flex h-10 sm:h-11 items-center gap-2 rounded-full border border-line px-3 text-[13px] font-bold transition-colors hover:bg-surface-2 max-sm:w-10 max-sm:justify-center max-sm:px-0"
        title="Ruang Irsyads — pindah ke situs lain"
      >
        <Grid2x2 className="size-[17px]" aria-hidden />
        <span className="max-sm:sr-only">Ruang Irsyads</span>
      </button>
      <AnimatePresence>
        {buka && (
          <motion.nav
            aria-label="Ruang Irsyads"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 460, damping: 34 }}
            className="absolute top-[calc(100%+10px)] right-0 z-50 w-[min(328px,calc(100vw-24px))] max-sm:fixed max-sm:inset-x-3 max-sm:top-[4.5rem] max-sm:w-auto rounded-[20px] border border-line bg-surface px-3 pt-3.5 pb-2.5 shadow-[var(--shadow-pop)]"
          >
            <p className="mx-1.5 mb-2.5 text-[13px] font-extrabold">Ruang Irsyads</p>
            <div className="max-h-[min(420px,calc(100vh-200px))] overflow-y-auto overscroll-contain">
              {KELOMPOK.map((k, i) => (
                <section key={k.label} className={cn(i > 0 && 'mt-2 border-t border-line pt-2')}>
                  <h3 className="mx-1.5 mb-1 text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-ink-3">{k.label}</h3>
                  <ul className="grid grid-cols-3 gap-0.5">
                    {k.entri.map((e) => {
                      const kini = e.id === 'ruang'
                      return (
                        <li key={e.id}>
                          <a
                            href={e.id === 'ruang' ? '/' : ecosystemUrl(e.id, e.href, registry.apps.find(app => app.id === e.id)?.languages || [])}
                            title={e.ket}
                            aria-current={kini ? 'page' : undefined}
                            aria-label={`${e.nama} — ${e.ket}`}
                            onClick={() => setBuka(false)}
                            className={cn(
                              'relative flex flex-col items-center gap-1.5 rounded-[14px] px-1 pt-2.5 pb-2 text-center transition-colors hover:bg-surface-2',
                              kini && 'bg-accent/12',
                            )}
                          >
                            <SubLogo logo={e.logo} className="size-[46px]" />
                            <span className="max-w-full truncate text-xs font-bold">{e.nama}</span>
                            {kini && <span className="absolute top-2 right-3 size-1.5 rounded-full bg-accent" aria-hidden />}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-line px-1 pt-2">
              <a href="https://studio.irsyads.com" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-ink-2 hover:bg-surface-2">
                <SubLogo logo={[studioT, studioG]} className="size-6" />
                Studio HQ
              </a>
              <a href={ecosystemUrl('site', 'https://irsyads.com', ['id','en','ar'], '/apps')} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-bold text-accent-text hover:bg-surface-2">
                Semua aplikasi <span aria-hidden>→</span>
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
