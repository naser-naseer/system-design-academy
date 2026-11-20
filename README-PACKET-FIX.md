# Phase 1 packet-path fix

## Issue
The request circle previously used center-to-center interpolation, so it crossed inside the node rectangles.

## Fix
- Connectors now terminate at box boundaries.
- Packet travel starts and ends with enough clearance for the entire 9px-radius circle plus its 3px stroke, and a 2px gap.
- Handles horizontal and diagonal edges without changing lesson content or playback controls.
- Zero-length/overlapping connections are skipped rather than drawn through a block.

## Apply
From the System Design Academy Git repository root:

```bash
git switch -c fix/svg-packet-boundaries
unzip -o /path/to/system-design-academy-packet-boundary-fix.zip -d .
npm run lint
npm run build
GITHUB_PAGES=true npm run build
npm run dev
```

Check steps 1, 3, 5, 7–9 in `#/hld-lld/1`, especially diagonal service-to-database/cache edges and narrow horizontal gaps. The moving white circle should never overlap a block. Commit and open a PR after validation.
