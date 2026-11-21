/** Single source of truth for the visible SVG silhouette, ports and collisions. */
export type Point = { x: number; y: number }
export type DiagramNode = Point & { kind?: string; label?: string }
export type Segment = { start: Point; end: Point }
export type Rect = { left: number; right: number; top: number; bottom: number }
export const NODE_WIDTH = 112
export const NODE_HEIGHT = 102
export const NODE_TOP = 0
export const NODE_SIDE = 0
export const PACKET_RADIUS = 4.3
export const PACKET_STROKE = 2
export const PACKET_GAP = 2
export const PACKET_CLEARANCE = PACKET_RADIUS + PACKET_STROKE / 2 + PACKET_GAP
const EPS = 1e-8

/** Coordinates are in each node's own SVG group, with origin (0,0). */
const PRISM: readonly Point[] = [
  {x: 0,y:-51}, {x:56,y:-23}, {x:56,y:23},
  {x:0,y:51}, {x:-56,y:23}, {x:-56,y:-23},
]
/** The projected cylinder contour: elliptical upper rim, vertical wall, rounded bottom. */
const CYLINDER: Point[] = [
  ...Array.from({length:33},(_,i)=>{
    const theta=i*Math.PI/32
    return {x:34*Math.cos(theta),y:-22-17*Math.sin(theta)}
  }),
  {x:-34,y:16},
  ...Array.from({length:32},(_,i)=>{
    const theta=Math.PI+(i+1)*Math.PI/32
    return {x:34*Math.cos(theta),y:16-16*Math.sin(theta)}
  }),
 ]
const CROWD:readonly Point[] = [{x:0,y:-64},{x:102,y:-13},{x:102,y:1},{x:0,y:64},{x:-102,y:1},{x:-102,y:-13}]
export const isCrowd = (n:DiagramNode)=>n.kind==='client' && /customers|people|users/i.test(n.label??'')
export const isCylinder = (n: DiagramNode) => n.kind === 'database' || n.kind === 'cache'
export function silhouette(n: DiagramNode): readonly Point[] { return isCrowd(n) ? CROWD : isCylinder(n) ? CYLINDER : PRISM }
export function nodeBounds(n: DiagramNode): Rect {
  const poly=silhouette(n)
  // 1 SVG unit accounts for the outer half of the drawn outline.
  return {
    left:n.x+Math.min(...poly.map(p=>p.x))-1,
    right:n.x+Math.max(...poly.map(p=>p.x))+1,
    top:n.y+Math.min(...poly.map(p=>p.y))-1,
    bottom:n.y+Math.max(...poly.map(p=>p.y))+1,
  }
}

/** Camera framing includes database name badges; routing anchors do NOT use these. */
export function artworkBounds(node: DiagramNode): Rect {
  const b=nodeBounds(node)
  if(isCrowd(node))return {...b,bottom:b.bottom+30}
  if(!isCylinder(node)||!node.label)return b
  const badgeWidth=Math.max(62,Math.min(106,node.label.length*7+17))
  return {...b,right:Math.max(b.right,node.x+38+badgeWidth+1)}
}

const cross=(a:Point,b:Point)=>a.x*b.y-a.y*b.x
/** Ray from a node center to its visible painted contour, not its bounding box. */
export function silhouettePort(node: DiagramNode, toward: Point): Point | null {
  const direction={x:toward.x-node.x,y:toward.y-node.y}
  if(Math.hypot(direction.x,direction.y)<EPS)return null
  const polygon=silhouette(node)
  let smallest=Infinity
  for(let i=0;i<polygon.length;i++){
    const a=polygon[i],b=polygon[(i+1)%polygon.length]
    const side={x:b.x-a.x,y:b.y-a.y}
    const denominator=cross(direction,side)
    if(Math.abs(denominator)<EPS)continue
    const t=cross(a,side)/denominator
    const u=cross(a,direction)/denominator
    if(t>=-EPS&&u>=-EPS&&u<=1+EPS&&t<smallest)smallest=t
  }
  return Number.isFinite(smallest)?{x:node.x+direction.x*smallest,y:node.y+direction.y*smallest}:null
}

/** Exact minimum distance to the drawn silhouette, including the edges. */
export function distanceToSilhouette(p:Point,n:DiagramNode):number {
  const poly=silhouette(n)
  const local={x:p.x-n.x,y:p.y-n.y}
  // Convex polygon: a segment or chord crossing the body must be considered overlapping.
  let inside=true
  let orientation=0
  for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length]
    const s=cross({x:b.x-a.x,y:b.y-a.y},{x:local.x-a.x,y:local.y-a.y})
    if(Math.abs(s)>EPS){if(!orientation)orientation=Math.sign(s);else if(Math.sign(s)!==orientation)inside=false}
  }
  if(inside)return 0
  let best=Infinity
  for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length]
    const d={x:b.x-a.x,y:b.y-a.y}
    const t=Math.max(0,Math.min(1,((local.x-a.x)*d.x+(local.y-a.y)*d.y)/(d.x*d.x+d.y*d.y)))
    best=Math.min(best,Math.hypot(local.x-(a.x+t*d.x),local.y-(a.y+t*d.y)))
  }
  return best
}

/** Legacy rectangle-based helper retained for older scene-engine consumers/tests. */
function exitDistance(origin:Point,toward:Point,rect:Rect) {
  const dx=toward.x-origin.x,dy=toward.y-origin.y
  const len=Math.hypot(dx,dy)
  if(len<EPS)return Infinity
  const ux=dx/len,uy=dy/len
  return Math.min(
    ux>0?(rect.right-origin.x)/ux:ux<0?(rect.left-origin.x)/ux:Infinity,
    uy>0?(rect.bottom-origin.y)/uy:uy<0?(rect.top-origin.y)/uy:Infinity,
  )
}
export function connectingSegment(a:Point,b:Point,clearance=0):Segment|null {
  const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)
  if(len<EPS)return null
  const aOffset=exitDistance(a,b,nodeBounds(a))+clearance
  const bOffset=exitDistance(b,a,nodeBounds(b))+clearance
  if(!Number.isFinite(aOffset+bOffset)||aOffset+bOffset>=len)return null
  return {start:{x:a.x+dx/len*aOffset,y:a.y+dy/len*aOffset},end:{x:b.x-dx/len*bOffset,y:b.y-dy/len*bOffset}}
}
export function interpolate(segment:Segment,t:number):Point {
  const f=Math.max(0,Math.min(1,t))
  return {x:segment.start.x+(segment.end.x-segment.start.x)*f,y:segment.start.y+(segment.end.y-segment.start.y)*f}
}
export function packetOutsideNode(center:Point,node:DiagramNode,radius=PACKET_CLEARANCE-PACKET_GAP):boolean {
  return distanceToSilhouette(center,node)>=radius-0.01
}
