import { connectingSegment, nodeBounds, PACKET_CLEARANCE } from './geometry.ts'
import type { Point } from './geometry.ts'

export type Route = { points: Point[]; length: number }
export type RoutedNode = Point & { id: string }
export type RouteEdge = { from: string; to: string }
type Rect = ReturnType<typeof nodeBounds>
const EPS = 1e-7
const PADDING = PACKET_CLEARANCE + 2
const ROUND = (n: number) => Number(n.toFixed(5))

function expanded(node: Point): Rect {
  const b = nodeBounds(node)
  return { left: b.left - PADDING, right: b.right + PADDING, top: b.top - PADDING, bottom: b.bottom + PADDING }
}

function inside(p: Point, r: Rect): boolean {
  return p.x > r.left + EPS && p.x < r.right - EPS && p.y > r.top + EPS && p.y < r.bottom - EPS
}

function segmentClear(a: Point, b: Point, blocks: readonly Rect[]): boolean {
  if (Math.abs(a.x - b.x) > EPS && Math.abs(a.y - b.y) > EPS) return false
  return blocks.every(r => {
    if (inside(a, r) || inside(b, r)) return false
    if (Math.abs(a.y - b.y) <= EPS) {
      return !(a.y > r.top + EPS && a.y < r.bottom - EPS && Math.max(a.x,b.x) > r.left + EPS && Math.min(a.x,b.x) < r.right - EPS)
    }
    return !(a.x > r.left + EPS && a.x < r.right - EPS && Math.max(a.y,b.y) > r.top + EPS && Math.min(a.y,b.y) < r.bottom - EPS)
  })
}

/** A complete continuous polyline, including the first and last endpoints. */
export function routeLength(points: readonly Point[]): number {
  return points.slice(1).reduce((sum,p,i) => sum + Math.hypot(p.x-points[i].x,p.y-points[i].y),0)
}

/** Arc-length interpolation yields uniform packet speed through turns. */
export function pointOnRoute(route: Route, fraction: number): Point {
  const pts = route.points
  if (!pts.length) return {x:0,y:0}
  if (pts.length===1 || route.length<EPS) return pts[0]
  let distance = Math.max(0,Math.min(1,fraction))*route.length
  for(let i=1;i<pts.length;i++){
    const a=pts[i-1],b=pts[i]
    const length=Math.hypot(b.x-a.x,b.y-a.y)
    if(distance<=length || i===pts.length-1){
      const t=length<EPS?0:Math.max(0,Math.min(1,distance/length))
      return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}
    }
    distance-=length
  }
  return pts[pts.length-1]
}

function cleanPoints(points: Point[]): Point[] {
  const result: Point[] = []
  for (const p of points) {
    if(result.length && Math.hypot(result[result.length-1].x-p.x,result[result.length-1].y-p.y)<EPS)continue
    result.push(p)
    while(result.length>=3){
      const a=result[result.length-3],b=result[result.length-2],c=result[result.length-1]
      if(Math.abs((b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x))>EPS)break
      result.splice(result.length-2,1)
    }
  }
  return result
}

/**
 * Routes a connector outside the inflated 2.5D card bounds of every node.
 * When a clear straight segment exists it is retained to preserve existing
 * HLD/LLD diagrams. Otherwise a deterministic rectilinear visibility grid
 * finds the shortest free route, with a small cost for extra corners.
 * Returns null when no safe route exists; never draws a line through a card.
 */
export function routeConnection(source: RoutedNode, target: RoutedNode, nodes: readonly RoutedNode[]): Route | null {
  if(source.id===target.id || Math.hypot(source.x-target.x,source.y-target.y)<EPS)return null
  const inflated=nodes.map(expanded)
  const centerSegment=connectingSegment(source,target,PACKET_CLEARANCE)
  if(centerSegment){
    const a=centerSegment.start,b=centerSegment.end
    // Preserve diagonal connectors when they do not intersect any unrelated card.
    const safe=nodes.every(n => n.id===source.id || n.id===target.id || !diagonalCutsBox(a,b,expanded(n)))
    if(safe)return {points:[a,b],length:Math.hypot(b.x-a.x,b.y-a.y)}
  }

  const dx=target.x-source.x,dy=target.y-source.y
  const horizontal=Math.abs(dx)>=Math.abs(dy)
  const s=expanded(source),t=expanded(target)
  const start:Point=horizontal
    ? {x:dx>=0?s.right:s.left,y:source.y}
    : {x:source.x,y:dy>=0?s.bottom:s.top}
  const end:Point=horizontal
    ? {x:dx>=0?t.left:t.right,y:target.y}
    : {x:target.x,y:dy>=0?t.top:t.bottom}
  if(inflated.some((r,i)=>nodes[i].id!==source.id && nodes[i].id!==target.id && (inside(start,r)||inside(end,r))))return null

  const xs=[start.x,end.x,...inflated.flatMap(r=>[r.left,r.right])].map(ROUND)
  const ys=[start.y,end.y,...inflated.flatMap(r=>[r.top,r.bottom])].map(ROUND)
  const X=[...new Set(xs)].sort((a,b)=>a-b),Y=[...new Set(ys)].sort((a,b)=>a-b)
  const width=X.length,height=Y.length
  const index=(x:number,y:number)=>y*width+x
  const positions=Array.from({length:width*height},(_,i)=>({x:X[i%width],y:Y[Math.floor(i/width)]}))
  const available=positions.map(p=>!inflated.some(r=>inside(p,r)))
  const sx=X.indexOf(ROUND(start.x)),sy=Y.indexOf(ROUND(start.y))
  const ex=X.indexOf(ROUND(end.x)),ey=Y.indexOf(ROUND(end.y))
  if(sx<0||sy<0||ex<0||ey<0)return null
  const first=index(sx,sy),last=index(ex,ey)
  if(!available[first]||!available[last])return null

  // Dijkstra over grid intersections. Direction state encourages fewer bends.
  const directions=[[1,0],[-1,0],[0,1],[0,-1]] as const
  const key=(node:number,dir:number)=>node*5+dir
  const best=new Map<number,number>([[key(first,4),0]])
  const parent=new Map<number,number>()
  const queue:[number,number][]=[[0,key(first,4)]]
  let winner=-1
  while(queue.length){
    queue.sort((a,b)=>a[0]-b[0]||a[1]-b[1])
    const [cost,state]=queue.shift()!
    if(cost>(best.get(state)??Infinity)+EPS)continue
    const current=Math.floor(state/5),previous=state%5
    if(current===last){winner=state;break}
    const cx=current%width,cy=Math.floor(current/width)
    for(let dir=0;dir<4;dir++){
      const [vx,vy]=directions[dir]
      const nx=cx+vx,ny=cy+vy
      if(nx<0||nx>=width||ny<0||ny>=height)continue
      const next=index(nx,ny)
      if(!available[next]||!segmentClear(positions[current],positions[next],inflated))continue
      const distance=Math.hypot(positions[next].x-positions[current].x,positions[next].y-positions[current].y)
      if(distance<EPS)continue
      const newCost=cost+distance+(previous!==4&&previous!==dir?8:0)
      const stateNext=key(next,dir)
      if(newCost+EPS<(best.get(stateNext)??Infinity)){
        best.set(stateNext,newCost)
        parent.set(stateNext,state)
        queue.push([newCost,stateNext])
      }
    }
  }
  if(winner<0)return null
  const backward:Point[]=[]
  for(let state=winner;;){
    backward.push(positions[Math.floor(state/5)])
    const prior=parent.get(state)
    if(prior===undefined)break
    state=prior
  }
  const points=cleanPoints(backward.reverse())
  return {points,length:routeLength(points)}
}

/** True if a segment intersects the actual area of an inflated rectangle. */
function diagonalCutsBox(a: Point,b: Point,r: Rect): boolean {
  const dx=b.x-a.x,dy=b.y-a.y
  let low=0,high=1
  for(const [origin,delta,min,max] of [[a.x,dx,r.left,r.right],[a.y,dy,r.top,r.bottom]]){
    if(Math.abs(delta)<EPS){if(origin>min+EPS&&origin<max-EPS)continue;return false}
    const t1=(min-origin)/delta,t2=(max-origin)/delta
    low=Math.max(low,Math.min(t1,t2))
    high=Math.min(high,Math.max(t1,t2))
    if(high<=low+EPS)return false
  }
  return low<1-EPS && high>EPS
}

/** Convert a polyline to an SVG path. */
export function routeToPath(route: Route): string {
  return route.points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
}

/** Ensure animated packet center stays outside all inflated obstacle rectangles. */
export function routeIsClear(route: Route, nodes: readonly RoutedNode[], fromId: string, toId: string): boolean {
  return nodes.filter(n=>n.id!==fromId&&n.id!==toId).every(n=>{
    const rect=expanded(n)
    return route.points.slice(1).every((p,i)=>{
      const a=route.points[i]
      return !diagonalCutsBox(a,p,rect)
    })
  })
}
