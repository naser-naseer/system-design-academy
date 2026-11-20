# System Design Academy — Phase 5: Deterministic Animation Timeline

**Baseline:** GitHub `main` after Phase 4 obstacle-aware routing and camera controls. This is a non-destructive overlay: it does not replace the curriculum file, package lock, GitHub workflows, or Vite configuration.

## Delivered

- `src/scene-engine/timeline.ts`: independent, pure TypeScript animation timeline evaluator with `appear`, `disappear`, `status`, `highlight`, `edge`, and `packet` actions, plus deterministic timestamps, validation and bounded clock progression.
- `src/scene-engine/lesson-timelines.ts`: declarative, independently authored timing sequences for HLD/LLD steps 3, 4, 5, 7, and 9. Other steps retain the Phase 4 single-packet behavior through an explicit compatibility fallback.
- `src/scene-engine/Scene.tsx`: renders evaluated states and packet events over the unchanged Phase 4 obstacle-aware routes. Preserves the Phase 3 camera and Phase 4 crossfade, adding a keyboard-accessible timeline scrubber and visible failure/busy/healthy states.
- `src/scene-engine/timeline.css`: restrained status and timeline styles.
- `tests/timeline.test.mjs`: 11 new automated checks, automatically picked up by the existing GitHub Actions `tests/*.test.mjs` glob.

All animation states are derived from a timestamp (no permanent mutation of the lesson graph). This means pause, replay, scrub and step switching can recover the same deterministic scene. Hidden tabs do not accumulate huge animation jumps.

**Demo guidance:** Step 3 reveals nodes in stages; step 4 animates multiple request segments; step 5 illustrates database load, failure and recovery (illustrative, not a simulation or measurement); step 7 progressively reveals LLD components; step 9 demonstrates a database-write state change.

## Apply locally

```bash
cd /home/naser/Desktop/scripts/AIDev/codex/system-design-academy
git status --short  # must be empty
git switch main
git pull --ff-only origin main
git switch -c feature/phase5-animation-timeline
unzip -o /home/naser/Downloads/system-design-academy-phase5-animation-timeline.zip -d .
node --experimental-strip-types --test tests/*.test.mjs
node scripts/validate-content.mjs
npm run lint
npm run build
GITHUB_PAGES=true npm run build
npm run dev
```

## Acceptance walkthrough

1. Open `http://localhost:5173/#/hld-lld/3`; observe staged node appearance and packet movement.
2. On step 4 verify packets follow their corresponding four routed connections; zoom, pan and Fit do not move packets off their paths.
3. On step 5 verify that the database changes to busy, failed (with `!` marker) and healthy, then resets cleanly when the timeline loops.
4. Pause the timeline and confirm both status and packet position remain frozen. Drag the slider to seek backward and forward, then resume.
5. Replay the step: scene starts at time 0; quickly navigate between steps 3–7 to ensure old scenes and packets are discarded after the existing crossfade.
6. Enable operating-system **reduced motion**: scene displays settled state without animated motion. The timeline slider is disabled in this mode.
7. Confirm all 12 lesson steps work and previous Phase 3/4 controls remain available.
8. Check both mobile and desktop layouts plus keyboard access to the slider and camera controls.

## Validation evidence and limitations

- Local Node.js 22.16.0 test run: **23 tests passed** across Phase 3 camera, Phase 4 routing, and Phase 5 timeline suites.
- Standalone strict TypeScript typecheck for new timeline modules: **passed** under TypeScript 5.8.3.
- ZIP integrity: verified at package creation.
- Full React/Vite `npm run build`, oxlint and real browser testing **not executed in preparation environment**; they are mandatory local/CI gates before merging.
- The existing CI executes `tests/*.test.mjs`, so new timeline tests run automatically. There is no dependency or lockfile change.
- This is a declarative *teaching animation* engine, not a real distributed-systems simulator. Timeline actions use the separate `lesson-timelines.ts` registry for this milestone. The lesson-schema/content-authoring migration, more timeline actions, and cross-browser E2E are future work.

## Release through pull request

```bash
git add src/scene-engine/Scene.tsx src/scene-engine/timeline.ts \
  src/scene-engine/lesson-timelines.ts src/scene-engine/timeline.css \
  tests/timeline.test.mjs README-PHASE5.md
git commit -m "feat: add deterministic scene animation timeline"
git push -u origin feature/phase5-animation-timeline
```

Create a PR targeting `main`; merge only after CI and a local interaction walkthrough pass. GitHub Pages will deploy after `main` is updated. Do not delete branches or stashes containing unique unmerged work.
