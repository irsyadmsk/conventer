import type { Session } from '@supabase/supabase-js'

type AuthReader = { getSession(): Promise<{ data: { session: Session | null }; error: unknown }> }
function sesiDicabut(value: unknown) {
  const error = value as { name?: string; code?: string } | null
  return error?.name === 'AuthSessionMissingError' || ['session_not_found', 'session_expired', 'refresh_token_not_found', 'refresh_token_already_used'].includes(error?.code ?? '')
}
/** Shared cookies are reread on activation; no reload, polling or token messages. */
export function ikutiSesi(auth: AuthReader, apply: (session: Session | null) => void, failed: () => void = () => {}) {
  let active = true, revision = 0
  let channel: BroadcastChannel | undefined
  async function read() {
    if (document.visibilityState === 'hidden') return
    const current = ++revision
    try {
      const result = await auth.getSession()
      if (!active || current !== revision) return
      if (result.error) {
        if (sesiDicabut(result.error)) apply(null)
        else failed()
        return
      }
      apply(result.data.session)
    } catch (error) { if (active && current === revision) { if (sesiDicabut(error)) apply(null); else failed() } }
  }
  const wake = () => { void read() }
  const storage = (event: StorageEvent) => { if (event.key === null || event.key.startsWith('sb-')) wake() }
  try { channel = new BroadcastChannel('irsyads-sso-sync'); channel.onmessage = wake } catch {}
  window.addEventListener('focus', wake)
  window.addEventListener('pageshow', wake)
  window.addEventListener('storage', storage)
  document.addEventListener('visibilitychange', wake)
  wake()
  return {
    // An auth callback is newer than any outstanding storage read.
    authChanged(session: Session | null) { revision++; if (active) apply(session) },
    stop() {
      active = false; revision++; channel?.close()
      window.removeEventListener('focus', wake)
      window.removeEventListener('pageshow', wake)
      window.removeEventListener('storage', storage)
      document.removeEventListener('visibilitychange', wake)
    },
  }
}
