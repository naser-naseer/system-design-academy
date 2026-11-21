import test from 'node:test'
import assert from 'node:assert/strict'
import {nodeBounds,silhouettePort,distanceToSilhouette,PACKET_RADIUS} from '../src/scene-engine/geometry.ts'
import {routeConnection,routeIsometricConnection,routeIsClear,pointOnRouteInset} from '../src/scene-engine/routing.ts'
const a={id:'service',kind:'service',x:120,y:150}
const b={id:'db',kind:'database',x:420,y:240}
test('new extrusion footprint matches the measured 112×102 SVG reference neighborhood',()=>{
  const box=nodeBounds(a)
  assert.equal(Math.round(box.right-box.left),114)
  assert.equal(Math.round(box.bottom-box.top),104)
})
test('cylinder projects approximately a 68-unit wide contour',()=>{
  const box=nodeBounds(b)
  assert.equal(Math.round(box.right-box.left),70)
  assert.ok(box.top<=b.y-39)
})
test('ports follow the visible outline, not an inflated rectangle',()=>{
  for(let angle=0;angle<360;angle+=15){
    const dest={x:a.x+250*Math.cos(angle*Math.PI/180),y:a.y+250*Math.sin(angle*Math.PI/180)}
    const port=silhouettePort(a,dest)
    assert.ok(port)
    assert.ok(distanceToSilhouette(port,a)<.05)
  }
})
test('the connector touches the artwork while the packet stays inset',()=>{
  const route=routeConnection(a,b,[a,b]);assert.ok(route)
  assert.ok(distanceToSilhouette(route.points[0],a)<.05)
  assert.ok(distanceToSilhouette(route.points.at(-1),b)<.05)
  for(let i=0;i<=100;i++){
    const p=pointOnRouteInset(route,i/100);assert.ok(p)
    assert.ok(distanceToSilhouette(p,a)>=PACKET_RADIUS-.1)
    assert.ok(distanceToSilhouette(p,b)>=PACKET_RADIUS-.1)
  }
})

test('isometric routing prefers two diagonal axes when the corridor is clear',()=>{
 const x={id:'x',kind:'gateway',x:70,y:150}, y={id:'y',kind:'service',x:400,y:150}
 const path=routeIsometricConnection(x,y,[x,y]);assert.ok(path)
 assert.ok(path.points.length>=3)
 for(let i=1;i<path.points.length;i++){
   const a=path.points[i-1],b=path.points[i], slope=(b.y-a.y)/(b.x-a.x)
   assert.ok(Math.abs(Math.abs(slope)-.5)<.08,`unexpected projected axis ${slope}`)
 }
 assert.ok(routeIsClear(path,[x,y],x.id,y.id))
})

test('isometric renderer preserves safe connectors for all existing lesson scenes',async()=>{
 const {hldLldSteps}=await import('../src/curriculum/lessons.ts')
 const {requestSteps,loadBalancingSteps,cachingSteps,queueSteps}=await import('../src/curriculum/phase6-lessons.ts')
 for(const group of [hldLldSteps,requestSteps,loadBalancingSteps,cachingSteps,queueSteps])for(const step of group){
   for(const edge of step.edges){
     const a=step.nodes.find(n=>n.id===edge.from),b=step.nodes.find(n=>n.id===edge.to)
     const route=routeIsometricConnection(a,b,step.nodes);assert.ok(route,`${step.id} ${edge.from}->${edge.to}`)
     assert.ok(distanceToSilhouette(route.points[0],a)<.08)
     assert.ok(distanceToSilhouette(route.points.at(-1),b)<.08)
     assert.ok(routeIsClear(route,step.nodes,a.id,b.id),`${step.id} obstacle collision`)
     for(let i=0;i<=30;i++){
       const center=pointOnRouteInset(route,i/30);assert.ok(center)
       assert.ok(distanceToSilhouette(center,a)>=PACKET_RADIUS-.1,`${step.id} overlap source`)
       assert.ok(distanceToSilhouette(center,b)>=PACKET_RADIUS-.1,`${step.id} overlap target`)
     }
   }
 }
})
