# Phase 7 — Browser QA corrections after initial 32-test run

Observed: 18 passed / 14 failed. The failure report groups into ambiguous Zoom in locators, browser-reserved Ctrl+K shortcut, and mobile click interception. The Playwright HTML report is generated in `qa/playwright-report/` rather than the repository root.

## Changes made

The safe installer `scripts/apply_phase7_browser_fix.py`:

1. Adds a final responsive CSS override to `src/visual-system.css` so the V5 explanation content flows normally on <=1050px, the mobile navigation buttons are not constrained by previous flex heights or negative margins, and mobile search has a fixed icon-sized hit target that does not obscure the theme toggle.
2. Preserves Ctrl+K and adds `/` as an in-page search shortcut to `src/App.tsx` (only when focus is not in an editable field).
3. Makes zoom selectors unambiguous by scoping them to `role="group"` named `Diagram camera controls` in `qa/specs/academy.spec.mjs`.
4. Makes the search E2E test click the visible search control and verify the `/` shortcut before navigating to Message Queues.
5. Adds a mobile test checking that the Next button is at the top of the hit-test stack; then actually clicks Next and Toggle theme. These are real click tests, not `{ force: true }` bypasses.

No rendering geometry, lesson content, package dependencies, Git configuration, or GitHub workflow is modified.

## Apply on existing V5 + Phase 7 checkout

```bash
cd /home/naser/Desktop/scripts/AIDev/codex/system-design-academy

git branch --show-current
git status --short
# Extract system-design-academy-phase7-browser-fix.zip into this directory
unzip -o ~/Downloads/system-design-academy-phase7-browser-fix.zip -d .
python3 scripts/apply_phase7_browser_fix.py

node --experimental-strip-types --test tests/*.test.mjs
npm run lint
npm run build
GITHUB_PAGES=true npm run build

npm --prefix qa test
```

The installer is idempotent and can be rerun. It checks V5 markers before editing source files.

## Faster failure isolation

```bash
npm --prefix qa run test:desktop
npm --prefix qa run test:mobile
```

For the last HTML report, use the QA package's Playwright installation, not `npx` from the project root:

```bash
npm --prefix qa run report
# or
./qa/node_modules/.bin/playwright show-report qa/playwright-report
```

When all checks pass, review screenshots in `qa/review-captures/` (see the original Phase 7 README), then commit on your existing preview branch. Do not merge with any known mobile E2E failures.

## Evidence and limitations

- 57 existing Node.js tests passed with the installer applied to a reconstructed V5 + Phase 7 source tree.
- Browser CSS layout hit-testing was checked in Chromium against a representative structure at 393px width, for both Next and Toggle theme; both are topmost in that mock layout.
- New QA test JavaScript syntax passed with Node 22.
- Full application build and 32+ browser tests were **not** run here (npm dependencies unavailable in this environment). Confirm on the user machine before merging. Do not treat mock layout validation as a full browser E2E result.
