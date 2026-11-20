# Stage 2: 2.5D SVG diagram upgrade

This overlay is compatible with the Phase 1 React/TypeScript application. It does not modify App.tsx, lesson schema, dependencies, or CI workflows.

- Depth-sorted pseudo-isometric infrastructure cards (top and right faces).
- Connection endpoints clipped to each *whole* 2.5D card (not its center).
- Packet clearance includes its radius, stroke, and a margin.
- Zero-length or overlapping node connections are intentionally hidden instead of passing through cards.
- Existing scene step, replay and pause controls remain.
- Reduced-motion users see the end state rather than a moving request circle.

## Apply

```bash
git status   # must be clean
git switch -c feature/isometric-scene-engine
unzip -o /path/to/system-design-academy-isometric-engine-v1.zip -d .
npm run lint
npm run build
GITHUB_PAGES=true npm run build
npm run dev
```

Test steps 1–12, including diagonal service/cache/database links; compare packet clearance at the start and end. Commit and merge via PR after checks. Existing GitHub Pages deployment will run on main.

## Scope boundary

This is the 2.5D *node rendering and edge geometry* milestone. It is not a true world-coordinate isometric projection, advanced routed graph, collision solver, zoom/pan engine, or production-distributed-system simulator. Those require subsequent milestones and tests.
