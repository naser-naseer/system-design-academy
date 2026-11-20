# System Design Academy — Phase 4: Routed Connections & Scene Transitions

**Scope:** Incremental patch against the GitHub `main` branch *after* Phase 3 camera controls. No changes to lesson content, dependencies, package scripts, or existing deployment settings.

## Included

- `src/scene-engine/routing.ts` — deterministic SVG screen-space path routing. Keeps a clear direct connector unchanged; if unrelated 2.5D boxes obstruct it, finds a rectilinear detour using an obstacle-inflated visibility grid. Packet center follows the exact rendered polyline at uniform arc-length speed.
- `src/scene-engine/Scene.tsx` — integrates shared routed path for both connector and packet, keeps Phase 3 zoom/pan/fit and playback, and crossfades incoming/outgoing scenes for step changes.
- `src/scene-engine/transitions.css` — 250ms crossfade with reduced-motion override.
- `tests/routing.test.mjs` — six tests for clear/blocked/vertical/diagonal paths, determinism, endpoints, and degenerate inputs.

**Non-goals:** General-purpose 3D routing, rounded elbow spline, crossing minimization across *all* edges, multi-edge lane assignment, HLD/LLD content additions, and advanced tweening of moving nodes are not included. An impossible route is intentionally omitted rather than drawn through an obstruction. Existing scene is still pseudo-isometric cards, not a true 3D projection.

## Apply safely (Linux)

```bash
cd /home/naser/Desktop/scripts/AIDev/codex/system-design-academy
git status --short                         # must be empty
git switch main
git pull --ff-only origin main
git switch -c feature/phase4-routing-transitions
unzip -o /home/naser/Downloads/system-design-academy-phase4-routing-transitions.zip -d .

# The existing CI glob tests/*.test.mjs picks up the new routing tests.
node --experimental-strip-types --test tests/*.test.mjs
npm run lint
npm run build
GITHUB_PAGES=true npm run build
npm run dev
```

## Acceptance walkthrough

1. Open `http://localhost:5173/#/hld-lld/1` and navigate all 12 steps.
2. Verify no packet overlaps source/destination boxes. Zoom/pan/fit retains packet-path alignment.
3. Switch steps quickly (Next/Previous 10 times): no lingering ghost scenes after 250ms, no stray packets, correct step narration.
4. Pause/replay: paused packet stays put; replay begins at path start.
5. Enable OS/browser reduced motion: scene fades disabled and packet displayed at route end.
6. Verify `npm run lint`, build, and all geometry tests pass.

## Commit and release

```bash
git add src/scene-engine/Scene.tsx src/scene-engine/routing.ts src/scene-engine/transitions.css tests/routing.test.mjs README-PHASE4.md
git commit -m "feat: route connections around nodes and crossfade lesson scenes"
git push -u origin feature/phase4-routing-transitions
```

Create PR into main, await CI, merge, monitor GitHub Pages deployment, and verify the live lesson.

## Test evidence and limitations

- Routing unit suite: **6/6 passed** using Node.js 22.16.0 in the preparation environment.
- Standalone TypeScript geometry typecheck: **passed**.
- Full React production build and browser E2E: **not executed in the preparation environment**; validate on your machine before merging.
- The new route works with the existing `geometry.ts` and `camera.ts`. It does not replace these files.
