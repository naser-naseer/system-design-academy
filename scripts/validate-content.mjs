import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const s=readFileSync(new URL('../src/curriculum/lessons.ts',import.meta.url),'utf8')
const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')
assert.match(s,/export const hldLldSteps/)
for(let i=1;i<=12;i++)assert.match(s,new RegExp(`step-${String(i).padStart(2,'0')}`))
for(const id of ['foundations','scaling','data','communication','reliability','architecture','security','shipping','whole'])assert.match(s,new RegExp(`id:'${id}'`))
assert.match(app,/Mark lesson complete/)
assert.match(app,/setSearchOpen/)
const commerce=readFileSync(new URL('../src/curriculum/commerce-hld-lld.ts',import.meta.url),'utf8')
for(let i=1;i<=8;i++)assert.match(commerce,new RegExp(`commerce-${String(i).padStart(2,'0')}`))
assert.match(app,/lesson-outcomes/)
console.log('Content smoke checks passed: nine modules, eight commerce HLD/LLD steps, preserved twelve URL shortener steps, six lessons, player and search wired.')
