# APMA approval integration — released 21 October 2026

The owner gave fresh authorization: "perbaiki lalu deploy". Toolkit Worker `ruang` at https://app.irsyads.com is deployed as version `a10e4b73-ee9a-4b06-9b49-2ac97dbd391d`. Compilation (TypeScript + Vite/PWA) passed; no local functional tests were run. No commits, pushes or Actions dispatches were made.

`src/lib/akses.ts` binds permission state to the account UID, rejects stale responses, refreshes on focus/visibility, and fails closed on read errors. Existing `useAkses` signature remains. The central APMA migration was applied in one transaction with the grants/signup migrations. Studio's admin-only search was observed in production; no real account was approved/revoked for testing. Account switching, concurrent decisions, revoked access during use and family-sharing acceptance remain pending.

Free plans/allowances were verified in the owner's logged-in Cloudflare/Supabase dashboards. No cloud AI provider, paid API or spending limit was enabled. Approval does not enable paid generation. Other uncommitted work is preserved.

Authoritative release/recovery/evidence: C:/Users/T6N0CV02S35823C/Github/irsyads/docs/Project Web Irsyads/2026-10-21_RELEASE_SSO_SOSIOLOGI_APMA.md . Historical pre-release candidate: 2026-10-21_SOSIOLOGI_APMA_DATA_API.md. Future unrelated releases remain held until authorized.
