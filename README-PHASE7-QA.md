# Phase 7 — Quality gates and visual review automation

This overlay builds **on the V5 reference-composition preview branch**. It does not alter the React renderer, existing lessons, site CSS, Vite base path, or deployment workflow.

## Included

- `tests/phase7-contract.test.mjs` — pure Node 22 regression checks for six lesson IDs, 44 steps, deep links, scene geometry, routed edges, deterministic timelines, reduced motion, and the removed timer.
- `qa/specs/academy.spec.mjs` — Playwright Chromium tests for home page, all lesson routes, stepper navigation, zoom/fit, replay/pause, search, theme persistence, lesson completion, responsive overflow, accessible controls, and runtime errors.
- `qa/specs/reduced-motion.spec.mjs` — reduced-motion functional navigation.
- `qa/capture-review.mjs` — 32 local screenshots across desktop/mobile, light/dark and representative lessons. Captures are created locally for visual inspection and are **not** included in Git.
- `.github/workflows/browser-qa.yml` — an additional pull-request and `main` quality job. The existing deployment workflow is not changed.
- A self-contained `qa/package.json`; the existing app `package.json` and `package-lock.json` are untouched.

## Installation (Linux Mint / Ubuntu 20.04)

Start from your *existing, unmerged V5 branch*. The V5 renderer and all source files should be present, and the earlier unused-import correction should already be applied.

```bash
cd /home/naser/Desktop/scripts/AIDev/codex/system-design-academy

git status --short  # do not discard working changes
unzip -o ~/Downloads/system-design-academy-phase7-quality-gates.zip -d .

node --experimental-strip-types --test tests/*.test.mjs
npm run lint
npm run build
GITHUB_PAGES=true npm run build

npm install --prefix qa --no-audit --no-fund
./qa/node_modules/.bin/playwright install chromium
npm --prefix qa test
```

The separate QA dependencies are pinned to `@playwright/test@1.62.0` to accommodate Ubuntu 20.04 / Linux Mint 20.x. The application's runtime dependencies are not changed.

If Chromium's required libraries are missing, run `sudo ./qa/node_modules/.bin/playwright install-deps chromium` (with appropriate OS privileges) and retry.

Playwright starts Vite on `127.0.0.1:4173` automatically, so `npm run dev` is not needed for tests. If port 4173 is already used by an unrelated process, stop it rather than testing the wrong app.

## Screenshot capture for your next GUI review

Run the local app on port 4173 in one terminal:

```bash
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

Run capture in another:

```bash
npm --prefix qa run capture
```

Screenshots are saved in `qa/review-captures/` with a machine-readable `manifest.json` (includes overflow measurements and uncaught page errors). Upload a selection of screenshots when you next want to review the GUI against the reference.

## Verification limits

- Pure Node 22 tests and JavaScript syntax are runnable without npm dependencies.
- Browser E2E tests require Chromium and the separately installed QA dependencies; these have **not** been executed in the preparation environment.
- Responsive overflow checks might identify pre-existing V5 CSS issues. Do not relax the test to hide a real overflow; review the screenshot and fix the layout on a separate branch.
- This suite checks the app's key accessible names and semantics but is **not** a complete WCAG audit or pixel-level screenshot comparison.
- The GitHub Actions job becomes active only after the patch is committed on a branch and a PR exists.

## Suggested release gate

1. Local Node tests, lint, production build and Pages build pass.
2. Playwright desktop and mobile suites pass.
3. Representative desktop and mobile screenshots are reviewed.
4. Create PR from the V5 + Phase 7 branch into `main`; confirm existing CI and new browser job pass.
5. Merge only after visual acceptance; then verify live GitHub Pages routes.

No GitHub or production changes have been made while preparing this overlay.
