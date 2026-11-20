import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateTimeline, validateTimeline, effectiveTimeline, advanceClock } from '../src/scene-engine/timeline.ts'
import { hldLldTimelines } from '../src/scene-engine/lesson-timelines.ts'
const nodes=[{id:'client'},{id:'server'},{id:'db'}]
const edges=[{from:'client',to:'server'},{from:'server',to:'db'}]
const step=(actions,extras={})=>({nodes,edges,activeEdge:0,timeline:{durationMs:3000,loop:false,actions},...extras})
test('falls back to legacy single-packet loop without authored actions',()=>{
  const fallback=effectiveTimeline({nodes,edges,activeEdge:0})
  assert.equal(fallback.loop,true)
  assert.equal(fallback.actions[0].type,'packet')
  assert.equal(evaluateTimeline({nodes,edges,activeEdge:0},1200).packets[0].progress,0.5)
})
test('frame calculations are deterministic across arbitrary seek order',()=>{
  const s=step([{id:'busy',type:'status',nodeId:'db',status:'busy',atMs:500},{id:'okay',type:'status',nodeId:'db',status:'healthy',atMs:2000}])
  const a=evaluateTimeline(s,2300)
  evaluateTimeline(s,700)
  assert.deepEqual(evaluateTimeline(s,2300),a)
})
test('node state transitions use ordered status actions',()=>{
  const s=step([{id:'a',type:'status',nodeId:'db',status:'failed',atMs:100},{id:'b',type:'status',nodeId:'db',status:'healthy',atMs:1100}])
  assert.equal(evaluateTimeline(s,300).nodes.db.status,'failed')
  assert.equal(evaluateTimeline(s,1600).nodes.db.status,'healthy')
})
test('appear/disappear are interpolated without mutating inputs',()=>{
  const s=step([{id:'show',type:'appear',nodeId:'db',atMs:500,durationMs:400},{id:'hide',type:'disappear',nodeId:'db',atMs:2000,durationMs:400}])
  assert.equal(evaluateTimeline(s,100).nodes.db.opacity,0)
  assert.equal(evaluateTimeline(s,700).nodes.db.opacity,0.5)
  assert.equal(evaluateTimeline(s,1000).nodes.db.opacity,1)
  assert.equal(evaluateTimeline(s,2200).nodes.db.opacity,0.5)
  assert.equal(s.nodes[2].status,undefined)
})
test('packet progress uses its own action duration',()=>{
  const s=step([{id:'packet',type:'packet',edgeIndex:1,atMs:300,durationMs:1200}])
  assert.equal(evaluateTimeline(s,100).packets.length,0)
  assert.equal(evaluateTimeline(s,900).packets[0].progress,0.5)
  assert.equal(evaluateTimeline(s,2000).packets.length,0)
})
test('edge state blocks packets on disabled connections',()=>{
  const s=step([{id:'disable',type:'edge',edgeIndex:1,atMs:200,enabled:false},{id:'packet',type:'packet',edgeIndex:1,atMs:300,durationMs:1000}])
  assert.equal(evaluateTimeline(s,600).edges[1],false)
  assert.equal(evaluateTimeline(s,600).packets.length,0)
})
test('loop restarts the entire scene state, including failures',()=>{
  const s=step([{id:'failure',type:'status',nodeId:'db',status:'failed',atMs:1000}],{timeline:{durationMs:3000,loop:true,actions:[{id:'failure',type:'status',nodeId:'db',status:'failed',atMs:1000}]}})
  assert.equal(evaluateTimeline(s,2400).nodes.db.status,'failed')
  assert.equal(evaluateTimeline(s,3100).nodes.db.status,'idle')
})
test('reduced-motion shows final state and hides intermediate packet travel',()=>{
  const s=step([{id:'show',type:'appear',nodeId:'db',atMs:800,durationMs:400},{id:'packet',type:'packet',edgeIndex:1,atMs:1800,durationMs:1200}])
  const frame=evaluateTimeline(s,0,true)
  assert.equal(frame.nodes.db.opacity,1)
  assert.equal(frame.packets[0].progress,1)
})
test('clock clamps long background delays and rejects negative deltas',()=>{
  assert.equal(advanceClock(120,25000),170)
  assert.equal(advanceClock(120,-40),120)
  assert.equal(advanceClock(120,Number.NaN),120)
})
test('validation rejects duplicate IDs, missing nodes, invalid edges and durations',()=>{
  const s=step([
    {id:'same',type:'status',nodeId:'unknown',status:'bad',atMs:50},
    {id:'same',type:'packet',edgeIndex:10,atMs:2900,durationMs:200},
  ])
  assert.ok(validateTimeline(s).length>=4)
})
test('authored HLD timelines are all schema-valid against their corresponding nodes',()=>{
  const configurations={
    'step-03':{nodes:[{id:'client'},{id:'api'},{id:'service'},{id:'cache'},{id:'db'}],edges:[{},{},{},{}]},
    'step-04':{nodes:[{id:'client'},{id:'api'},{id:'service'},{id:'cache'},{id:'db'}],edges:[{},{},{},{}]},
    'step-05':{nodes:[{id:'client'},{id:'api'},{id:'service'},{id:'cache'},{id:'db'}],edges:[{},{},{},{}]},
    'step-07':{nodes:[{id:'handler'},{id:'validation'},{id:'generator'},{id:'repository'},{id:'storage'}],edges:[{},{},{},{}]},
    'step-09':{nodes:[{id:'handler'},{id:'validation'},{id:'generator'},{id:'repository'},{id:'storage'}],edges:[{},{},{},{}]},
  }
  for(const [id,timeline] of Object.entries(hldLldTimelines)) {
    const definition={...configurations[id],timeline}
    assert.deepEqual(validateTimeline(definition),[],id)
  }
})
