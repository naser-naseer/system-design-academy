import test from 'node:test'
import assert from 'node:assert/strict'
import { STAGE, boundsForNodes, fitCamera, zoomAt, panBy, MIN_ZOOM, MAX_ZOOM } from '../src/scene-engine/camera.ts'
import { connectingSegment, interpolate, packetOutsideNode, PACKET_CLEARANCE } from '../src/scene-engine/geometry.ts'

const nodes = [{x:100,y:135},{x:305,y:135},{x:510,y:135},{x:715,y:220},{x:715,y:62}]
const approx = (actual, expected, eps=1e-6) => assert.ok(Math.abs(actual-expected)<eps, `${actual} != ${expected}`)
test('fit keeps diagram node bounds in SVG viewport', () => {
 const b=boundsForNodes(nodes), c=fitCamera(nodes)
 assert.ok(b.left*c.scale+c.x>=0)
 assert.ok(b.right*c.scale+c.x<=STAGE.width)
 assert.ok(b.top*c.scale+c.y>=0)
 assert.ok(b.bottom*c.scale+c.y<=STAGE.height)
})
test('zoom preserves the position of the focal point when unclamped',()=>{
 const b=boundsForNodes(nodes), c=fitCamera(nodes), anchor={x:STAGE.width/2,y:STAGE.height/2}
 const before={x:(anchor.x-c.x)/c.scale,y:(anchor.y-c.y)/c.scale}
 const next=zoomAt(c,1.3,anchor,b)
 approx((anchor.x-next.x)/next.scale,before.x)
 approx((anchor.y-next.y)/next.scale,before.y)
})
test('zoom stays within configured limits',()=>{
 const b=boundsForNodes(nodes), c=fitCamera(nodes)
 assert.equal(zoomAt(c,100,{x:425,y:155},b).scale, MAX_ZOOM)
 assert.equal(zoomAt(c,0.001,{x:425,y:155},b).scale, MIN_ZOOM)
})
test('pan cannot lose every node outside the viewport',()=>{
 const b=boundsForNodes(nodes), c=fitCamera(nodes)
 const p=panBy(c,{x:10000,y:-10000},b)
 assert.ok(b.left*p.scale+p.x <= STAGE.width-52)
 assert.ok(b.bottom*p.scale+p.y >= 52)
})
test('packet travels outside source and destination geometry at all progress points',()=>{
 const pairs=[[nodes[0],nodes[1]],[nodes[2],nodes[3]],[nodes[2],nodes[4]]]
 for(const [a,b] of pairs) {
  const path=connectingSegment(a,b,PACKET_CLEARANCE)
  assert.ok(path, 'visible packet path must exist')
  for(let i=0;i<=100;i++) {
   const p=interpolate(path,i/100)
   assert.ok(packetOutsideNode(p,a), 'packet overlaps source')
   assert.ok(packetOutsideNode(p,b), 'packet overlaps destination')
  }
 }
})
test('overlapping nodes do not generate packet paths',()=>{
 assert.equal(connectingSegment(nodes[0],nodes[0],PACKET_CLEARANCE),null)
})
