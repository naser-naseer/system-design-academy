#!/usr/bin/env bash
set -euo pipefail
if [[ ! -f src/scene-engine/Scene.tsx || ! -f src/curriculum/phase6-lessons.ts ]]; then
  echo "ERROR: Run from System Design Academy repo with Phase 6 content present" >&2
  exit 1
fi
python3 - <<'PYFIX'
from pathlib import Path
p=Path('src/scene-engine/Scene.tsx')
s=p.read_text()
replacements={
  'timeline:hldLldTimelines[step.id]':'timeline:step.timeline ?? hldLldTimelines[step.id]',
  'timeline:hldLldTimelines[outgoing.id]':'timeline:outgoing.timeline ?? hldLldTimelines[outgoing.id]',
}
for old,new in replacements.items():
    if old in s:
        s=s.replace(old,new)
        print('Updated animation timeline selection:',old)
    elif new in s:
        print('Already correct:',new)
    else:
        raise SystemExit('Unexpected Scene.tsx structure: '+old+' not found, refusing to modify file')
p.write_text(s)
if 'scene-timeline-controls' in s:
    print('WARNING: Timeline slider still exists; current fix does not add or remove that control')
else:
    print('PASS: no timer/slider markup in Scene.tsx')
PYFIX

echo 'Patch applied. Run npm run lint && npm run build && GITHUB_PAGES=true npm run build.'
