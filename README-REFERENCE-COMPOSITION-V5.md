# System Design Academy — Reference-guided Scene Composition V5

## Purpose

This is a **local review candidate**, not a pixel-perfect clone or a deployed release. It is authored independently from the public browser capture and the user's comparative screenshots. The original site's source code, fonts, images, and SVG markup are not included.

**Baseline:** the existing System Design Academy React/TypeScript application on `main` (with Phase 6 multi-lesson navigation and the Phase 5 animation engine). This ZIP includes the required V3+V4 renderer files and V5 edits in one package; you do **not** have to unzip V3 and V4 first.

## What changed

1. Added `src/curriculum/commerce-hld-lld.ts`: eight original teaching steps illustrating a customer → gateway → order / courier / payment service architecture and three persistent stores, followed by an internal service-design zoom level. The steps use data-driven nodes, edges and declarative timelines.
2. Changed the main `#/hld-lld/1..8` lesson to the new commerce example, closer in *scene categories and step sequence* to the captured reference. Different explanatory text is intentionally used; this is an original lesson, not a textual copy.
3. Preserved the previous **twelve URL-shortener steps** as `#/url-shortener-architecture/1..12`, available in the Whole Systems curriculum as **Design a URL Shortener**. Previous `#/hld-lld/9..12` deep links resolve to the corresponding URL-shortener steps. Existing links to steps 1–8 now open the new content; this is a deliberate migration trade-off.
4. Extended the `LessonStep` schema with optional `visual` metadata for zoom level, component summary, deliverable, numbered step captions, changes and learning outcomes.
5. Changed `Scene.tsx` and camera framing to a taller **850 × 620** stage with an in-stage three-chip HUD, zoom controls, packet legend, and a protected top/bottom content region. The redundant timeline timer remains absent.
6. Adjusted three-column styling: a compact centered course heading, dominant architecture stage, numbered stepper below it, and right-side explanation + separate four-item learning checklist. Desktop target 1440 × 900, with responsive fallbacks.
7. Preserved V4 independently authored hexagonal service blocks, lavender storage cylinders, customer-group component, silhouette-to-silhouette routes, small packets, Play/Pause/Replay, zoom/pan/Fit, dark theme, and existing four Phase 6 lessons.

**Availability after applying:** six complete lessons and **44 authored steps**; still nine curriculum modules and 40 mapped topics. This release does **not** complete the 40 planned lessons.

## Safety-first Linux installation

```bash
cd /home/naser/Desktop/scripts/AIDev/codex/system-design-academy

git status --short
# If files are modified and the work is not committed, protect it first:
# git stash push -u -m "backup-before-reference-composition-v5"

git switch main
git pull --ff-only origin main
git switch -c preview/reference-composition-v5

# Download the ZIP from ChatGPT to ~/Downloads first.
unzip -o ~/Downloads/system-design-academy-reference-composition-v5.zip -d .

npm ci
node scripts/validate-content.mjs
node --experimental-strip-types --test tests/*.test.mjs
npm run lint
npm run build
GITHUB_PAGES=true npm run build
npm run dev
```

Open `http://localhost:5173/#/hld-lld/3` and compare with the reference step 3 at 1440 × 900. Try steps 1–8, then open `#/hld-lld/4` to validate the component zoom. Verify `#/url-shortener-architecture/12`, `#/journey-of-a-request/1`, `#/load-balancing/1`, `#/caching/1`, and `#/message-queues/1`.

**Do not merge before visual acceptance.** Use Play/Pause/Replay and zoom/pan/Fit in multiple steps, then perform a mobile-width and dark-mode review. The screenshot in the previous conversation represents the original site, not artwork licensed to this project.

## Offline preview

`docs/previews/v5-reference-composition-preview.html` is an **approximate static visual review** that uses `IsometricNode.tsx` to render the node artwork and the project's routing geometry. It does not execute the full React player or animation loop. You can open the HTML file locally, without npm or internet access. Use the actual running app for definitive validation.

## Verification performed by ChatGPT

- **51/51 Node.js tests passed** across existing Phase 3–V4 checks and six new V5 tests.
- The commerce eight-step timelines are schema-valid, and all **61 scene connectors** across their repeated diagrams route without intersecting unrelated node silhouettes. The connector endpoints coincide with rendered silhouette boundaries. Animated packet clearance was checked at 31 positions per route.
- The four original curriculum expansion lessons and the 12-step URL shortener were retained and tested.
- Pure TypeScript modules (`commerce-hld-lld.ts`, `catalog.ts`, camera, geometry, routing and timeline) passed the locally installed TypeScript 5.8 typechecker. The current repo uses TypeScript 7, so run its actual npm build locally.
- TSX syntax was checked using TypeScript transpile diagnostics for App, Scene and IsometricNode.
- **Full React production build, lint, interactive browser E2E and GitHub Pages build were NOT performed here** because this environment has no project `node_modules` and cannot fetch npm dependencies. The local checks above are mandatory. No remote Git changes have been made.

## Known limitations / open parity issues

- This uses similar component categories, structure and information hierarchy to the captured reference, but is not a visual replica. Layout and text are independently authored, and the scenario graph is not identical.
- Right-side data store badges may require localized positioning depending on lesson size. Test narrow viewports and alternative scenes.
- Isometric connectors use the V4 projected-axis candidate with obstacle-aware fallback; curved bend smoothing and sophisticated lane management are outside this release.
- The legacy 12-step URL-shortener lesson has been moved to a new route. Users with bookmarks for early HLD/LLD steps will see new content at those URLs.

## Git release after visual review

```bash
git add -A
git commit -m "feat: add reference-guided HLD LLD composition and lesson rail"
git push -u origin preview/reference-composition-v5
```

Open a PR, require green CI and review screenshots before merging. Keep `main` and current production unchanged until approved.
