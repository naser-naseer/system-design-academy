# System Design Academy — Phase 1 vertical slice

Original educational site implementation inspired by the product capability requirements in `docs/requirements/Designed_to_Scale_Complete_Discovery_Development_Spec_v1.md`. This is not the original site or an exact recreation.

## Scope delivered
- Nine-module / 40-topic curriculum **catalog**. Only HLD vs LLD is implemented; other topics are visibly marked **Planned**.
- Original 12-step HLD vs LLD lesson with a reusable TypeScript scene schema and SVG renderer.
- Animated request marker on an active edge, play/pause/replay, previous/next, hash deep links and keyboard shortcuts.
- Search dialog (catalog title/module matching), theme persistence, explicit lesson completion persistence, responsive layout.
- Content structure checks (`node scripts/validate-content.mjs`).

## Deliberate Phase 1 limitations
- Rendered diagrams are flat SVG component cards, not the full 2.5D/isometric engine promised in the product specification.
- No automatic camera fit/zoom/pan, advanced collision routing, or global animation timeline/state machine.
- No translated curriculum, advanced content search, offline PWA, automated browser E2E or per-scene visual regression yet.
- All 39 other topics are **planned**, not implemented.
- Search currently matches module/topic labels only; unavailable topics cannot be opened.
- Completion records only the single HLD/LLD lesson in local storage.

## Apply on an existing clone
1. Create a feature branch from current `main`.
2. Copy the contents of this overlay to the root of the repository (replace `src/App.tsx`, `src/App.css`, `src/index.css`; add new files).
3. Keep the existing `package.json`, `package-lock.json`, `vite.config.ts`, `src/main.tsx`, and GitHub Actions configurations. Do not overwrite them.
4. Run `node scripts/validate-content.mjs`, `npm run lint`, `npm run build`, `GITHUB_PAGES=true npm run build`.
5. Check `npm run dev`, visit `/#/hld-lld/1`, exercise navigation, theme and search.
6. Commit on the feature branch and open a PR. Merge only after checks pass.

## Roadmap
- Replace the flat SVG proof-of-concept with the original isometric primitive system, geometric edge anchors, camera framing and cancelable timeline scheduler.
- Add proper schema validation, unit + Playwright E2E tests, security auditing and CI-gated deployment.
- Independently author and review remaining 39 lesson experiences.
- Add high-fidelity parity assessment only where reference evidence is directly verified.
