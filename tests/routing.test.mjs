import test from 'node:test'
import assert from 'node:assert/strict'
import { routeConnection, pointOnRoute, pointOnRouteInset, routeLength, routeIsClear, routeToPath } from '../src/scene-engine/routing.ts'
import { packetOutsideNode } from '../src/scene-engine/geometry.ts'

const A={id:'a',x:100,y:150}, B={id:'b',x:700,y:150}, C={id:'c',x:400,y:150}

test('direct unobstructed edge remains a straight segment',()=>{
 const route=routeConnection(A,B,[A,B])
 assert.ok(route)
 assert.equal(route.points.length,2)
 assert.ok(route.length>0)
 assert.ok(routeToPath(route).startsWith('M'))
})

test('intervening card is avoided by a deterministic bend',()=>{
 const route=routeConnection(A,B,[A,C,B])
 assert.ok(route)
 assert.ok(route.points.length>=3)
 assert.ok(routeIsClear(route,[A,B,C],A.id,B.id))
 for(let i=0;i<=100;i++){
   const p=pointOnRoute(route,i/100)
   assert.ok(packetOutsideNode(p,C),`collision at ${i}% ${JSON.stringify(p)}`)
 }
 assert.deepEqual(route,routeConnection(A,B,[A,C,B]))
})

test('routing works vertically and diagonally without cutting through obstacle',()=>{
 const a={id:'a',x:170,y:60},b={id:'b',x:170,y:540},c={id:'c',x:170,y:295}
 const vertical=routeConnection(a,b,[a,b,c])
 assert.ok(vertical)
 assert.ok(routeIsClear(vertical,[a,b,c],a.id,b.id))
 const d={id:'d',x:720,y:400},e={id:'e',x:440,y:250}
 const diagonal=routeConnection(a,d,[a,d,e])
 assert.ok(diagonal)
 assert.ok(routeIsClear(diagonal,[a,d,e],a.id,d.id))
})

test('packet movement follows complete arc length and both endpoints',()=>{
 const route=routeConnection(A,B,[A,C,B])
 assert.ok(route)
 assert.deepEqual(pointOnRoute(route,0),route.points[0])
 assert.deepEqual(pointOnRoute(route,1),route.points.at(-1))
 assert.deepEqual(pointOnRoute(route,-1),route.points[0])
 assert.deepEqual(pointOnRoute(route,2),route.points.at(-1))
 assert.ok(Math.abs(routeLength(route.points)-route.length)<1e-6)
})

test('zero-length self references are rejected',()=>{
 assert.equal(routeConnection(A,A,[A]),null)
 assert.equal(routeConnection(A,{id:'b',x:100,y:150},[A,{id:'b',x:100,y:150}]),null)
})

test('origin and destination packet never enter their blocks on a clear connection',()=>{
 const route=routeConnection(A,B,[A,B])
 assert.ok(route)
 for(let i=0;i<=100;i++){
  const p=pointOnRouteInset(route,i/100)
  assert.ok(p,'packet has room for radius clearance')
  assert.ok(packetOutsideNode(p,A))
  assert.ok(packetOutsideNode(p,B))
 }
})
