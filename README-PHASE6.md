# System Design Academy — Phase 6: Curriculum Expansion (Wave 1)

Adds four complete six-step animated lessons to the original twelve-step HLD vs LLD lesson.

## Deliverables

| Lesson | URL | Steps | Core scenarios |
|---|---|---:|---|
| Journey of a Request | `#/journey-of-a-request/1` | 6 | DNS, TLS, edge, gateway, tracing, recovery |
| Load Balancing | `#/load-balancing/1` | 6 | algorithms, health checks, failover, SPOFs, production validation |
| Caching | `#/caching/1` | 6 | hits, misses, fills, invalidation, stampede, recovery |
| Message Queues | `#/message-queues/1` | 6 | publish, consume, parallelism, retries, idempotency, backlog |
| HLD vs LLD (existing) | `#/hld-lld/1` | 12 | preserved existing lesson |

## Files in this overlay

- `src/curriculum/phase6-lessons.ts`: content and timeline actions for four lessons
- `src/curriculum/catalog.ts`: data-driven multi-lesson registry and deep-link routing
- `src/curriculum/lessons.ts`: add optional timeline type on `LessonStep` (other definitions preserved)
- `src/App.tsx`: multi-lesson navigation, lesson search, home catalog and per-lesson completion
- `src/App.css`: responsive lesson cards
- `src/scene-engine/Scene.tsx`: use `step.timeline` where defined, otherwise preserve original HLD/LLD timeline map
- `tests/phase6-content.test.mjs`: content/schema/deep-link/determinism/routing tests

## Backward compatibility

- Original HLD vs LLD links and timeline examples remain available.
- `sda:progress:v1` is read for migration and `sda:progress:v2` saves per-lesson completion.
- Existing camera, route-avoidance, playback, timeline scrubber, theme and GitHub Pages workflows remain.
- No additional runtime dependencies; no CI workflow edits necessary (`tests/*.test.mjs` already includes new suite).
- The 40-topic planned curriculum is not presented as 40 completed lessons. Only five are available.

## Apply on Linux

```bash
cd /home/naser/Desktop/scripts/AIDev/codex/system-design-academy
git status --short # must be clean
git switch main
git pull --ff-only origin main
git switch -c feature/phase6-curriculum-wave1
unzip -o /home/naser/Downloads/system-design-academy-phase6-curriculum-wave1.zip -d .
node --experimental-strip-types --test tests/*.test.mjs
node scripts/validate-content.mjs
npm ci
npm run lint
npm run build
GITHUB_PAGES=true npm run build
npm run dev
```

## Manual acceptance checks

1. Open the home route and confirm five lesson cards.
2. Open each new topic in the sidebar and through search. All six steps must navigate correctly.
3. Confirm every new lesson’s packet/timeline scrubber, failure coloring, replay, pause, zoom/pan/fit and step transitions.
4. Confirm completed lessons remain completed after refresh, independently from each other; test HLD v1 completion migration.
5. Check direct refresh on `#/hld-lld/12` and new deep links; invalid routes show not-found.
6. Test desktop/mobile viewport, dark mode and reduced-motion accessibility.
7. Only merge if Node tests, lint, TypeScript/Vite build and browser checks pass.

## Release

```bash
git add src/App.tsx src/App.css src/curriculum/catalog.ts src/curriculum/lessons.ts \
  src/curriculum/phase6-lessons.ts src/scene-engine/Scene.tsx tests/phase6-content.test.mjs README-PHASE6.md
git commit -m "feat: add four interactive system design lessons"
git push -u origin feature/phase6-curriculum-wave1
```

Open PR into `main`. Successful GitHub Actions build is necessary before merging. GitHub Pages deploys `main`.

## Validation evidence and limitations

- All 29 Node test cases passed in the development container, including the six new curriculum tests and previous geometry/routing/timeline suites.
- No full browser E2E or production Vite build was run in this preparation container because the repository's npm dependency installation was unavailable locally.
- Examples are educational, not operationally connected to live infrastructure.
