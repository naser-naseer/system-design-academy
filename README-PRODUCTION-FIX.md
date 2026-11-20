# Phase 6 Production Navigation Fix

**Verified GitHub main state at preparation:** `src/curriculum/phase6-lessons.ts` exists, but `src/App.tsx` still serves only the HLD/LLD lesson and no `src/curriculum/catalog.ts` exists. The SVG timer was already removed in `src/scene-engine/Scene.tsx`.

This narrowly scoped overlay restores the multi-lesson Phase 6 player without reverting the timer removal.

## Apply

From a **clean repo** on a new branch created from main:

```bash
unzip -o /path/to/system-design-academy-phase6-production-fix.zip -d .
bash apply-phase6-fix.sh
node scripts/validate-content.mjs
node --experimental-strip-types --test tests/*.test.mjs
npm run lint
npm run build
GITHUB_PAGES=true npm run build
```

The script uses the existing `src/scene-engine/Scene.tsx` and only changes which timeline definition is selected for Phase 6 lessons. It does not touch timer markup or camera/routing code. Phase 6 content, including the corrected `LessonStep.timeline` definition, must already exist. For deployment, create a PR into main, await CI, merge, and verify live paths `#/journey-of-a-request/1`, `#/load-balancing/1`, `#/caching/1`, and `#/message-queues/1`.

## Files

- `src/App.tsx`: multi-topic navigation, title, routes, search, completion tracking.
- `src/App.css`: lesson catalog/card styling.
- `src/curriculum/catalog.ts`: mapping from Phase 6 authored lesson data into available curriculum topics.
- `apply-phase6-fix.sh`: preserves current scene renderer; uses embedded step timelines for non-HLD lessons.

## Caveats

- Automatic test execution of this *overlay* against remote GitHub `main` was not possible in the isolated build environment. The corresponding Phase 6 source tree passed 29 tests; full React build must be verified on the user's machine.
