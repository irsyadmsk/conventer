# Irsyads Satu — S2 local candidate, 11 October 2026

Owner requested S2. Canonical handoff: `../irsyads/docs/Project Web Irsyads/2026-10-11_IRSYADS_SATU_S2.md` from the `Github` parent. All work remains local/uncommitted; no release approval. Wallet frozen; addresses unchanged. S1 live gates remain open.

Toolkit now consumes the same preference v2 runtime/language/CSS/manifest as Curriculum and Mosque public. Regenerate in the main repo using `node scripts/export-design-foundation.mjs --preferences-only` then `node scripts/export-s2-preferences.mjs`. Do not edit generated preference-contract/preferences-account or assets separately. Guest/account caches are separate; private school/family/sound preferences remain in Toolkit. Remote global preference transport is disabled by default; pending explicit selections are local only. Existing Toolkit private preferences are retained, with global appearance taking precedence.

42 targeted main-repo tests passed, including Toolkit account isolation/entry regressions. Local Toolkit type/build passed; ID type/build and two browser origins/mobile RTL were verified. Account RPC/RLS tests used local fixtures, not production. Full acceptance and real device/account persistence are pending schema/allowance/release gates.

Do not commit/push/deploy/dispatch Actions or publish SQL. Do not treat a build as release permission or consume unknown paid/free allowance. See the mandatory owner policy in the main repo.
## Kelanjutan S2 — 11 Oktober 2026

Adapter akun generated diperbarui dari `irsyads/packages/supabase/src/preferences-account.ts`: pembacaan revisi valid wajib sebelum tulis, retry gagal dibatasi 60 detik, konflik menahan tulis hingga rebase, acknowledgment harus naik satu, dan hasil akun lama tidak menunda/mengosongkan antrean akun baru. Pilihan terbaru tetap disimpan lokal. Binding tetap `remote=false`, tanpa polling/Supabase write baru.

50 tes terarah di monorepo lulus; build Toolkit (termasuk tipe) dan ID diperiksa kembali. Bukti tambahan: `irsyads/docs/Project Web Irsyads/2026-10-11_S2_CONTINUATION_EVIDENCE/`. Paket review/pemulihan: `2026-10-11_S2_ACCOUNT_RELEASE_AND_RECOVERY.md`. Seluruh pekerjaan lokal/uncommitted; rilis ditahan dan akun nyata/lintas perangkat belum diverifikasi.

