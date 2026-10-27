# Toolkit navigation — 20 October 2026

Local, uncommitted, free-only. No commit/push/PR/deployment or remote data write.

Header now mounts the canonical Irsyads navigation as `mount(target, 'ruang', 'Toolkit')`; redundant mobile title is removed and the appearance control is compact. Favicon and service-mark assets use the flat Site favicon. `src/index.css` bridges canonical text accent/muted/on-brand/font tokens only inside shared navigation and appearance controls, preserving Toolkit's existing button foreground utility.

Canonical source and detailed evidence: `C:/Users/T6N0CV02S35823C/Github/irsyads/docs/Project Web Irsyads/2026-10-20_CBT_NAVIGATION_ID_HANDOFF.md`. Export script supports `node scripts/export-s3-navigation.mjs ruang` from the monorepo. Generated public JS/CSS and appearance copies should not be hand-edited.

Final local `npm run build` passed, including TypeScript/Vite/PWA. Native browser inspected synthetic dev preview at 1366/390, light/dark; eight Spaces, readable All services, black/white mark, and stable scroll verified. This is not account/family/APMA/production acceptance. All earlier local modifications were preserved; the repo-wide diff includes work preceding this session. Release remains held pending full scope/review and fresh owner confirmation.
