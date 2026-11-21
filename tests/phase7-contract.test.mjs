import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { lessons, lessonById, parseAcademyRoute } from '../src/curriculum/catalog.ts'
import { validateTimeline, evaluateTimeline } from '../src/scene-engine/timeline.ts'
import { routeIsometricConnection, routeIsClear } from '../src/scene-engine/routing.ts'
import { fitCamera } from '../src/scene-engine/camera.ts'

const totalSteps = lessons.reduce((sum, lesson) => sum + lesson.steps.length, 0)

test('Phase 7 release catalog retains six authored lessons and 44 steps', () => {
  assert.equal(lessons.length, 6)
  assert.equal(totalSteps, 44)
  assert.equal(new Set(lessons.map(lesson => lesson.id)).size, lessons.length)
  assert.equal(lessonById.get('hld-lld').steps.length, 8)
  assert.equal(lessonById.get('url-shortener-architecture').steps.length, 12)
})

test('every route resolves to exactly one valid step; invalid routes fail closed', () => {
  for (const lesson of lessons) for (let i=1; i<=lesson.steps.length; i++) {
    const route = parseAcademyRoute(`#/${lesson.id}/${i}`)
    assert.equal(route.view,'lesson',`${lesson.id}/${i}`)
    assert.equal(route.lessonId,lesson.id)
    assert.equal(route.step,i)
  }
  for (const hash of ['#/hld-lld/0','#/hld-lld/100','#/not-a-lesson/1','#/../1']) {
    assert.equal(parseAcademyRoute(hash).view,'not-found',hash)
  }
})

test('all steps have stable identifiers and reference real nodes/edges', () => {
  for (const lesson of lessons) {
    const seen = new Set()
    for (const step of lesson.steps) {
      assert.ok(step.id && !seen.has(step.id), `${lesson.id}: duplicate step ID ${step.id}`)
      seen.add(step.id)
      assert.ok(step.title && step.body && step.takeaway, `${step.id}: missing instructional content`)
      const ids = new Set(step.nodes.map(node => node.id))
      assert.equal(ids.size,step.nodes.length,`${step.id}: duplicate node IDs`)
      for (const edge of step.edges) {
        assert.ok(ids.has(edge.from) && ids.has(edge.to),`${step.id}: dangling edge`)
      }
      assert.deepEqual(validateTimeline(step),[],`${step.id}: invalid animation timeline`)
    }
  }
})

test('all scene cameras fit and all routed connectors avoid foreign nodes', () => {
  for (const lesson of lessons) for (const step of lesson.steps) {
    const camera = fitCamera(step.nodes)
    assert.ok(Number.isFinite(camera.scale+camera.x+camera.y), `${step.id}: invalid camera`)
    for (const edge of step.edges) {
      const source=step.nodes.find(n=>n.id===edge.from)
      const target=step.nodes.find(n=>n.id===edge.to)
      const route=routeIsometricConnection(source,target,step.nodes)
      assert.ok(route && route.length>0,`${step.id}: unroutable ${edge.from}->${edge.to}`)
      assert.ok(routeIsClear(route,step.nodes,edge.from,edge.to),`${step.id}: path crosses a node`)
    }
  }
})

test('timeline seeking is deterministic and reduced motion reaches the final state', () => {
  for (const lesson of lessons) for (const step of lesson.steps) {
    const mid = evaluateTimeline(step,1200)
    evaluateTimeline(step,3000)
    assert.deepEqual(evaluateTimeline(step,1200),mid,`${step.id}: non-deterministic timeline`)
    const reduced = evaluateTimeline(step,0,true)
    assert.ok(Number.isFinite(reduced.timeMs),`${step.id}: invalid reduced-motion frame`)
  }
})

test('UI still omits the redundant timeline scrubber', () => {
  const component = readFileSync(new URL('../src/scene-engine/Scene.tsx', import.meta.url), 'utf8')
  assert.ok(!component.includes('scene-timeline-controls'), 'The removed timeline timer returned')
  assert.match(component,/Diagram camera controls/)
})
