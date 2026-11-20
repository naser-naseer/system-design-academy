import test from 'node:test'
import assert from 'node:assert/strict'
import { lessons, lessonById, curriculumModules, parseAcademyRoute } from '../src/curriculum/catalog.ts'
import { evaluateTimeline, validateTimeline } from '../src/scene-engine/timeline.ts'
import { routeConnection, routeIsClear } from '../src/scene-engine/routing.ts'

test('five unique accessible lessons have expected number of steps',()=>{
 assert.equal(lessons.length,5)
 assert.equal(new Set(lessons.map(x=>x.id)).size,lessons.length)
 assert.equal(lessons[0].steps.length,12)
 for(const lesson of lessons.slice(1))assert.equal(lesson.steps.length,6,lesson.id)
})
test('catalog mapping is aligned with the sidebar topic IDs',()=>{
 for(const lesson of lessons){
  assert.equal(lessonById.get(lesson.id),lesson)
  assert.ok(curriculumModules.some(m=>m.id===lesson.moduleId&&m.topics.some(t=>t.id===lesson.topicId&&t.available)))
 }
})
test('deep links parse correctly and reject invalid steps and names',()=>{
 assert.deepEqual(parseAcademyRoute('#/hld-lld/12'),{view:'lesson',lessonId:'hld-lld',step:12})
 for(const lesson of lessons.slice(1)) assert.equal(parseAcademyRoute(`#/${lesson.id}/3`).view,'lesson')
 for(const url of ['#/unknown/2','#/caching/7','#/load-balancing/0','#/caching/abc'])assert.equal(parseAcademyRoute(url).view,'not-found')
})
test('all new content is substantive, has valid schema and consistent edges',()=>{
 for(const lesson of lessons.slice(1))for(const step of lesson.steps){
  assert.ok(step.title.length>7,step.id)
  assert.ok(step.body.length>90,step.id)
  assert.ok(step.takeaway.length>28,step.id)
  assert.equal(validateTimeline(step).length,0,`${step.id}: ${validateTimeline(step)}`)
  const ids=new Set(step.nodes.map(n=>n.id));assert.equal(ids.size,step.nodes.length,step.id)
  for(const edge of step.edges){assert.ok(ids.has(edge.from)&&ids.has(edge.to),step.id)}
  if(step.activeEdge!==undefined)assert.ok(step.activeEdge<step.edges.length,step.id)
 }
})
test('timeline evaluation stable at arbitrary seek positions and reduced-motion end',()=>{
 for(const lesson of lessons.slice(1))for(const step of lesson.steps){
  const a=evaluateTimeline(step,1250)
  evaluateTimeline(step,3500)
  assert.deepEqual(evaluateTimeline(step,1250),a,step.id)
  const end=evaluateTimeline(step,0,true)
  assert.equal(end.timeMs,step.timeline.durationMs,step.id)
 }
})
test('routed paths are clear of unrelated scene nodes',()=>{
 for(const lesson of lessons.slice(1))for(const step of lesson.steps){
  for(const edge of step.edges){
   const from=step.nodes.find(n=>n.id===edge.from),to=step.nodes.find(n=>n.id===edge.to)
   const route=routeConnection(from,to,step.nodes)
   assert.ok(route,`${step.id}: cannot route ${edge.from}->${edge.to}`)
   assert.equal(routeIsClear(route,step.nodes,from.id,to.id),true,`${step.id}: crossing`)
  }
 }
})
