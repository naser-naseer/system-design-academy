/** Screen-space layout of a node. Coordinates are the center of its front face. */
export type Point = { x: number; y: number }
export type Segment = { start: Point; end: Point }
export const NODE_WIDTH = 110
export const NODE_HEIGHT = 62
export const NODE_TOP = 12
export const NODE_SIDE = 9
export const PACKET_RADIUS = 7
export const PACKET_STROKE = 2
export const PACKET_GAP = 2
export const PACKET_CLEARANCE = PACKET_RADIUS + PACKET_STROKE / 2 + PACKET_GAP

export function nodeBounds(p: Point) {
  return { left: p.x - NODE_WIDTH / 2, right: p.x + NODE_WIDTH / 2 + NODE_SIDE,
    top: p.y - NODE_HEIGHT / 2 - NODE_TOP, bottom: p.y + NODE_HEIGHT / 2 }
}

/** Ray/rectangle intersection. Works for horizontal, vertical, and diagonal edges. */
function exitDistance(origin: Point, toward: Point, rect: ReturnType<typeof nodeBounds>) {
  const dx = toward.x - origin.x
  const dy = toward.y - origin.y
  const length = Math.hypot(dx, dy)
  if (length < 0.001) return Infinity
  const ux = dx / length
  const uy = dy / length
  const candidates = [
    ux > 0 ? (rect.right - origin.x) / ux : ux < 0 ? (rect.left - origin.x) / ux : Infinity,
    uy > 0 ? (rect.bottom - origin.y) / uy : uy < 0 ? (rect.top - origin.y) / uy : Infinity,
  ].filter(t => t >= 0)
  return Math.min(...candidates)
}

/** Returns null for overlapping/zero-length nodes instead of allowing a packet through them. */
export function connectingSegment(a: Point, b: Point, clearance = 0): Segment | null {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const distance = Math.hypot(dx, dy)
  if (distance < 0.001) return null
  const aOffset = exitDistance(a, b, nodeBounds(a)) + clearance
  const bOffset = exitDistance(b, a, nodeBounds(b)) + clearance
  if (!Number.isFinite(aOffset + bOffset) || aOffset + bOffset >= distance) return null
  const ux = dx / distance
  const uy = dy / distance
  return {start: {x: a.x + ux * aOffset, y: a.y + uy * aOffset},
    end: {x: b.x - ux * bOffset, y: b.y - uy * bOffset}}
}

export function interpolate(segment: Segment, t: number): Point {
  const f = Math.max(0, Math.min(1, t))
  return {x: segment.start.x + (segment.end.x - segment.start.x) * f,
    y: segment.start.y + (segment.end.y - segment.start.y) * f}
}

export function packetOutsideNode(center: Point, node: Point, radius = PACKET_CLEARANCE - PACKET_GAP): boolean {
  const r = nodeBounds(node)
  const dx = Math.max(r.left - center.x, 0, center.x - r.right)
  const dy = Math.max(r.top - center.y, 0, center.y - r.bottom)
  return Math.hypot(dx, dy) >= radius - 0.01
}
