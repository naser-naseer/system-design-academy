import test from 'node:test'
import assert from 'node:assert/strict'
import { hldLldSteps } from '../src/curriculum/lessons.ts'
import { requestSteps, loadBalancingSteps, cachingSteps, queueSteps } from '../src/curriculum/phase6-lessons.ts'
import { nodeBounds } from '../src/scene-engine/geometry.ts'
import { STAGE, fitCamera } from '../src/scene-engine/camera.ts'
import { routeConnection, routeIsClear } from '../src/scene-engine/routing.ts'

const suites=[hldLldSteps,requestSteps,loadBalancingSteps,cachingSteps,queueSteps]
test('larger illustration footprint protects the hexagonal block silhouette',()=>{
  const b=nodeBounds({x:0,y:0})
  assert.ok(b.left<=-52&&b.right>=52)
  assert.ok(b.top<=-46&&b.bottom>=47)
})
test('scene uses the reference-ratio 850 by 620 workplane',()=>{
  assert.equal(STAGE.width,850)
  assert.equal(STAGE.height,620)
})
test('all five existing lessons retain safe, nonempty routes',()=>{
  for(const group of suites)for(const step of group){
    for(const edge of step.edges){
      const a=step.nodes.find(n=>n.id===edge.from)
      const b=step.nodes.find(n=>n.id===edge.to)
      assert.ok(a&&b,`${step.id} references missing nodes`)
      const route=routeConnection(a,b,step.nodes)
      assert.ok(route&&route.length>0,`${step.id}: ${edge.from} → ${edge.to} not routed`)
      assert.equal(routeIsClear(route,step.nodes,edge.from,edge.to),true,`${step.id}: route intersects a third block`)
    }
  }
})
test('camera Fit maintains usable magnification across 36 authored lesson steps',()=>{
  for(const group of suites)for(const step of group){
    const camera=fitCamera(step.nodes)
    assert.ok(Number.isFinite(camera.x)&&Number.isFinite(camera.y),`${step.id}: bad camera position`)
    assert.ok(camera.scale>=.5&&camera.scale<=1.15,`${step.id}: unexpected zoom ${camera.scale}`)
  }
})
