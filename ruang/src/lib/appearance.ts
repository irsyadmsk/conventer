import type { Prefs, Palet } from './prefs'
import type {} from './preference-contract'

export const SHARED_PALETTE: Record<Palet, string> = { krem: 'krem', hutan: 'forest', samudra: 'ocean', senja: 'royal', aurora: 'aurora', tanah: 'earth' }
declare global {
  interface Window {
    __irsyadsHadAppearance?: boolean
    IrsyadsLauncher?: { DEFAULT_LAUNCHER: {id:string;group:string}[]; readLauncher:()=>Promise<{id:string;group:string}[]> }
    IrsyadsLanguage?: { preferredLanguage: () => 'id' | 'en' | 'ar' | 'zh' | null }
  }
}
function read(key: string, localKey: string): string | null {
  try {
    const cookie = document.cookie.split(/;\s*/).find(item => item.startsWith(key + '='))?.slice(key.length + 1)
    if (cookie) return cookie
  } catch { /* optional */ }
  try { return localStorage.getItem(localKey) } catch { return null }
}
/** Appearance only: never copy account, APMA, sound or family settings into cookies. */
export function sharedAppearance(prefs: Prefs, preferShared = true): Prefs {
  if (!preferShared) return prefs
  const contract = window.IrsyadsPreferences?.get()
  const theme = contract?.theme || read('irsyads-appearance-theme', 'irsyads-theme')
  const palette = contract?.palette || read('irsyads-appearance-palette', 'irsyads-palette')
  const oldPalette = (Object.entries(SHARED_PALETTE).find(([, shared]) => shared === palette)?.[0] as Palet | undefined)
  const next = { ...prefs, theme: theme === 'light' || theme === 'dark' || theme === 'system' ? theme : prefs.theme, palette: oldPalette || prefs.palette, motion: contract?.motion || prefs.motion }
  return next.theme === prefs.theme && next.palette === prefs.palette && next.motion === prefs.motion ? prefs : next
}
export function publishAppearance(prefs: Prefs) {
  window.dispatchEvent(new CustomEvent('irsyads-appearance-change', { detail: { theme: prefs.theme, palette: SHARED_PALETTE[prefs.palette] || 'krem', motion: prefs.motion } }))
}
export function mergeAccountAppearance(current: Prefs, account: Partial<Prefs>): Prefs {
  // The old Toolkit row remains private. Global appearance belongs to v2.
  if (window.IrsyadsPreferences) return sharedAppearance({ ...current, ...account, theme: current.theme, palette: current.palette, motion: current.motion })
  const shared = sharedAppearance(current)
  const changedElsewhere = shared.theme !== current.theme || shared.palette !== current.palette
  const canonical = Object.entries(SHARED_PALETTE).find(([, value]) => value === account.palette)?.[0] as Palet | undefined
  const palette = canonical || (account.palette && account.palette in SHARED_PALETTE ? account.palette : current.palette)
  const theme = account.theme === 'light' || account.theme === 'dark' || account.theme === 'system' ? account.theme : current.theme
  return sharedAppearance({ ...current, ...account, theme, palette }, !!window.__irsyadsHadAppearance || changedElsewhere)
}
export function ecosystemUrl(id: string, url: string, languages: readonly string[], path = '') {
  const lang = window.IrsyadsLanguage?.preferredLanguage() || 'en'
  const target = new URL(url)
  if (id === 'site') target.pathname = (lang === 'en' ? '' : '/' + lang) + (path || '/')
  if ((id === 'verify' || id === 'letters') && languages.includes(lang)) target.searchParams.set('lang', lang)
  return target.toString()
}
