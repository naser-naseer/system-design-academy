# Phase 3 — SVG scene camera controls

This overlay is prepared for the System Design Academy version with the Phase 2 `src/scene-engine/geometry.ts` and `src/scene-engine/Scene.tsx` files.

## Changes

- In-scene Zoom In (+), Zoom Out (-), and Fit buttons.
- Pointer-based pan with bounds that retain some of the scene in view.
- Fit-to-scene using full 2.5D node bounds, including top and right faces.
- Zoom around viewport center without losing current point of focus.
- Camera reset when navigating to another lesson step.
- Existing animated packets and connectors use the same scene transform, so they stay aligned while zooming or panning.
- Node built-in `nodeBounds()` and packet clearance rules are preserved.
- Six automated geometry tests using Node.js 22's TypeScript stripping.
- Content and geometry tests added to both CI and pre-deployment checks.

## Installation

1. `git status` should report a clean working tree.
2. `git switch main && git pull --ff-only origin main`
3. `git switch -c feature/phase3-camera-controls`
4. Extract `system-design-academy-phase3-camera.zip` into the repository root.
5. `npm ci`
6. `node scripts/validate-content.mjs`
7. `node --experimental-strip-types --test tests/*.test.mjs`
8. `npm run lint && npm run build && GITHUB_PAGES=true npm run build`
9. `npm run dev`

### Manual checks

- Navigate through HLD/LLD steps 1, 3, 5, 7, 9, 12.
- Zoom in/out. Readout updates; packets and lines remain attached.
- Drag the SVG stage while animation is running; motion continues without entering blocks.
- Fit restores the whole diagram.
- Switching lesson steps automatically fits the new scene.
- Repeat at narrow viewport and dark theme, and with reduced-motion preference enabled.

## Scope

This is camera and test-foundation development. Smooth scene transitions, world-coordinate isometric projection, edge routing around unrelated nodes, keyboard-accessible panning, and browser E2E screenshot tests are not included yet. We do not claim full Phase 3 complete until those follow-up features are developed and verified.
