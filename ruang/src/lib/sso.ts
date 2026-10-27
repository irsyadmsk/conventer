export function tujuanToolkit(value: unknown, origin: string): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/'
  try {
    const url = new URL(value, origin)
    if (url.origin !== origin || /^\/(masuk|daftar|lupa-sandi|atur-sandi)(\/|$)/.test(decodeURIComponent(url.pathname))) return '/'
    return url.pathname + url.search + url.hash
  } catch { return '/' }
}

export function pintuId(path: unknown, mode: 'masuk' | 'daftar' | 'pemulihan' = 'masuk', origin = window.location.origin): string {
  const targetOrigin = origin === 'https://app.irsyads.com' || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ? origin : 'https://app.irsyads.com'
  const url = new URL(targetOrigin.startsWith('http:') ? 'http://localhost:4323/' : 'https://id.irsyads.com/')
  if (mode === 'pemulihan') url.pathname = '/lupa-sandi'
  url.searchParams.set('redirect', new URL(tujuanToolkit(path, targetOrigin), targetOrigin).href)
  if (mode === 'daftar') url.searchParams.set('mode', 'daftar')
  return url.href
}
