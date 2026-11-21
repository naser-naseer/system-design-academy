import test from 'node:test'
import assert from 'node:assert/strict'
import { commerceHldLldSteps } from '../src/curriculum/commerce-hld-lld.ts'
import { lessonById, parseAcademyRoute } from '../src/curriculum/catalog.ts'
import { routeIsometricConnection, routeIsClear, pointOnRouteInset } from '../src/scene-engine/routing.ts'
import { silhouettePort, distanceToSilhouette, PACKET_RADIUS, PACKET_STROKE } from '../src/scene-engine/geometry.ts'
import { fitCamera, STAGE } from '../src/scene-engine/camera.ts'
import { validateTimeline, evaluateTimeline } from '../src/scene-engine/timeline.ts'

const EPS=0.005
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)
test('reference-informed eight-step commerce lesson is substantive and original',()=>{
 assert.equal(commerceHldLldSteps.length,8)
 assert.equal(new Set(commerceHldLldSteps.map(s=>s.id)).size,8)
 for(const step of commerceHldLldSteps){
  assert.ok(step.body.length>=130,step.id)
  assert.ok(step.visual?.stepLabel?.length>2,step.id)
  assert.ok(step.visual?.changes?.length>0,step.id)
  assert.deepEqual(validateTimeline(step),[],step.id)
 }
})
test('zoom-in scene has different components while whole-system context returns at step seven',()=>{
 const full=commerceHldLldSteps[0].nodes.map(n=>n.id)
 assert.deepEqual(commerceHldLldSteps[2].nodes.map(n=>n.id),full)
 assert.ok(commerceHldLldSteps[3].nodes.every(n=>!full.includes(n.id)))
 assert.deepEqual(commerceHldLldSteps[6].nodes.map(n=>n.id),full)
 assert.equal(commerceHldLldSteps[3].visual.zoomLevel,'One service')
})
test('legacy URL shortener material retained in a separate lesson; old late-step links redirect',()=>{
 assert.equal(lessonById.get('url-shortener-architecture').steps.length,12)
 assert.equal(lessonById.get('hld-lld').steps.length,8)
 assert.deepEqual(parseAcademyRoute('#/hld-lld/9'),{view:'lesson',lessonId:'url-shortener-architecture',step:9})
 assert.equal(parseAcademyRoute('#/hld-lld/8').lessonId,'hld-lld')
})
test('all links attach exactly to drawn silhouettes and avoid third-party nodes',()=>{
 let count=0
 for(const step of commerceHldLldSteps)for(const e of step.edges){
  const from=step.nodes.find(n=>n.id===e.from),to=step.nodes.find(n=>n.id===e.to)
  const route=routeIsometricConnection(from,to,step.nodes)
  assert.ok(route,`${step.id} missing route ${e.from}->${e.to}`)
  assert.ok(routeIsClear(route,step.nodes,from.id,to.id),step.id)
  const start=route.points[0],end=route.points.at(-1)
  assert.ok(distanceToSilhouette(start,from)<1.3,`${step.id} source gap ${distanceToSilhouette(start,from)}`)
  assert.ok(distanceToSilhouette(end,to)<1.3,`${step.id} target gap ${distanceToSilhouette(end,to)}`)
  assert.ok(silhouettePort(from,to),step.id)
  assert.ok(silhouettePort(to,from),step.id)
  const clearance=PACKET_RADIUS+PACKET_STROKE/2
  for(let i=0;i<=30;i++){
    const pt=pointOnRouteInset(route,i/30)
    assert.ok(pt,`${step.id} no packet position`)
    assert.ok(distanceToSilhouette(pt,from)>=clearance-1.1-EPS,`${step.id} packet hits source`)
    assert.ok(distanceToSilhouette(pt,to)>=clearance-1.1-EPS,`${step.id} packet hits target`)
  }
  count++
 }
 assert.equal(count,61)
})
test('camera framing is finite with reserved HUD and no zoom overrun',()=>{
 assert.equal(STAGE.height,620)
 for(const step of commerceHldLldSteps){
  const camera=fitCamera(step.nodes)
  assert.ok(camera.scale>=.5 && camera.scale<=1.15)
  assert.ok(Number.isFinite(camera.x)&&Number.isFinite(camera.y))
 }
})
test('scrubbing deterministic and reduced motion honors final state',()=>{
 for(const step of commerceHldLldSteps){
  const earlier=evaluateTimeline(step,1150)
  evaluateTimeline(step,4900)
  assert.deepEqual(evaluateTimeline(step,1150),earlier)
  assert.equal(evaluateTimeline(step,0,true).timeMs,step.timeline.durationMs)
 }
})
