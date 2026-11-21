import test from 'node:test'
import assert from 'node:assert/strict'
import { silhouettePort, distanceToSilhouette, PACKET_RADIUS, PACKET_STROKE, nodeBounds } from '../src/scene-engine/geometry.ts'
import { routeConnection, pointOnRouteInset, routeIsClear } from '../src/scene-engine/routing.ts'
import { hldLldSteps } from '../src/curriculum/lessons.ts'
import { requestSteps, loadBalancingSteps, cachingSteps, queueSteps } from '../src/curriculum/phase6-lessons.ts'
const groups=[hldLldSteps,requestSteps,loadBalancingSteps,cachingSteps,queueSteps]
const approx=(actual,expected,epsilon=.12)=>assert.ok(Math.abs(actual-expected)<epsilon,`${actual} differs from ${expected}`)

test('each visual port lies on the painted prism or cylinder outline',()=>{
  const kinds=['service','gateway','client','database','cache','component']
  for(const kind of kinds)for(let angle=0;angle<360;angle+=9){
    const a={id:'a',kind,x:100,y:100}
    const radians=angle*Math.PI/180
    const b={x:100+200*Math.cos(radians),y:100+200*Math.sin(radians)}
    const port=silhouettePort(a,b)
    assert.ok(port,`${kind} @ ${angle}`)
    approx(distanceToSilhouette(port,a),0,.08)
    const bnds=nodeBounds(a)
    assert.ok(port.x>=bnds.left-1&&port.x<=bnds.right+1)
    assert.ok(port.y>=bnds.top-1&&port.y<=bnds.bottom+1)
  }
})

test('unobstructed connector endpoints touch BOTH painted silhouettes without gap',()=>{
  const a={id:'a',kind:'service',x:100,y:135}
  for(const kind of ['service','database','cache','client']){
    const b={id:'b',kind,x:330,y:210}
    const route=routeConnection(a,b,[a,b])
    assert.ok(route)
    approx(distanceToSilhouette(route.points[0],a),0,.08)
    approx(distanceToSilhouette(route.points.at(-1),b),0,.08)
    assert.equal(route.points.length,2)
  }
})

test('packet is safely inset from source and target while connector remains attached',()=>{
  const a={id:'a',kind:'service',x:100,y:135}
  const b={id:'b',kind:'database',x:315,y:210}
  const route=routeConnection(a,b,[a,b]);assert.ok(route)
  assert.ok(pointOnRouteInset(route,0))
  for(let i=0;i<=100;i++){
    const p=pointOnRouteInset(route,i/100)
    assert.ok(p)
    assert.ok(distanceToSilhouette(p,a)>=PACKET_RADIUS+PACKET_STROKE/2-.5)
    assert.ok(distanceToSilhouette(p,b)>=PACKET_RADIUS+PACKET_STROKE/2-.5)
  }
})

test('detour retains physical ports, avoids obstacles and has packet clearance',()=>{
  const a={id:'a',kind:'service',x:100,y:155}
  const b={id:'b',kind:'database',x:660,y:155}
  const c={id:'c',kind:'gateway',x:365,y:155}
  const route=routeConnection(a,b,[a,b,c]);assert.ok(route)
  assert.ok(route.points.length>=4)
  approx(distanceToSilhouette(route.points[0],a),0,.08)
  approx(distanceToSilhouette(route.points.at(-1),b),0,.08)
  assert.ok(routeIsClear(route,[a,b,c],a.id,b.id))
  for(let i=0;i<=100;i++){
    const p=pointOnRouteInset(route,i/100); assert.ok(p)
    assert.ok(distanceToSilhouette(p,c)>=PACKET_RADIUS+PACKET_STROKE/2)
  }
})

test('all authored scenes attach each connector to its source and target silhouettes',()=>{
  for(const group of groups)for(const step of group)for(const edge of step.edges){
    const a=step.nodes.find(n=>n.id===edge.from),b=step.nodes.find(n=>n.id===edge.to)
    const route=routeConnection(a,b,step.nodes)
    assert.ok(route,`${step.id}: ${edge.from}->${edge.to} missing`)
    approx(distanceToSilhouette(route.points[0],a),0,.08)
    approx(distanceToSilhouette(route.points.at(-1),b),0,.08)
    assert.ok(routeIsClear(route,step.nodes,a.id,b.id),`${step.id} obstacle collision`)
  }
})

test('animated packets never touch either endpoint across all 149 authored links',()=>{
  for(const group of groups)for(const step of group)for(const edge of step.edges){
    const a=step.nodes.find(n=>n.id===edge.from),b=step.nodes.find(n=>n.id===edge.to)
    const route=routeConnection(a,b,step.nodes);assert.ok(route)
    for(let i=0;i<=100;i++){
      const p=pointOnRouteInset(route,i/100)
      assert.ok(p,`${step.id}: no room for packet on ${edge.from}->${edge.to}`)
      const minimum=PACKET_RADIUS+PACKET_STROKE/2-.5
      assert.ok(distanceToSilhouette(p,a)>=minimum,`${step.id}: overlaps source at ${i}%`)
      assert.ok(distanceToSilhouette(p,b)>=minimum,`${step.id}: overlaps target at ${i}%`)
    }
  }
})
