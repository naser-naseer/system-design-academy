import { useEffect, useRef, useState } from 'react'
import type { LessonStep, SceneNode } from '../curriculum/lessons'

const palette: Record<SceneNode['kind'], string> = {
  client: '#8fbcc7',
  gateway: '#c7ad76',
  service: '#91b7a1',
  cache: '#ad9bd1',
  database: '#d7a58d',
  component: '#93b8b8',
  monitor: '#a9b6c7',
}

const nodeWidth = 126
const nodeHeight = 66
const packetRadius = 9
const packetStrokeWidth = 3
// A 2px visual gap between the packet's outside edge and node boundary.
const packetClearance = packetRadius + packetStrokeWidth / 2 + 2

interface Point { x: number; y: number }
interface Segment { start: Point; end: Point }

/**
 * Intersects a center-to-center ray with a rectangle of the given half-size.
 * Rectangles are axis aligned in SVG scene coordinates.
 */
function rectBoundaryDistance(dx: number, dy: number, halfWidth: number, halfHeight: number): number {
  const distance = Math.hypot(dx, dy)
  if (distance === 0) return 0
  const ux = Math.abs(dx / distance)
  const uy = Math.abs(dy / distance)
  return Math.min(
    ux === 0 ? Number.POSITIVE_INFINITY : halfWidth / ux,
    uy === 0 ? Number.POSITIVE_INFINITY : halfHeight / uy,
  )
}

/**
 * Connects visible node boundaries rather than node centers. Packet endpoints
 * have an additional clearance so the entire circle remains outside the boxes.
 * A short/overlapping edge returns null instead of drawing through a node.
 */
function connectingSegment(a: SceneNode, b: SceneNode, clearance: number): Segment | null {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const distance = Math.hypot(dx, dy)
  if (distance === 0) return null

  const startOffset = rectBoundaryDistance(dx, dy, nodeWidth / 2, nodeHeight / 2) + clearance
  const endOffset = rectBoundaryDistance(dx, dy, nodeWidth / 2, nodeHeight / 2) + clearance
  if (startOffset + endOffset >= distance) return null

  const ux = dx / distance
  const uy = dy / distance
  return {
    start: { x: a.x + ux * startOffset, y: a.y + uy * startOffset },
    end: { x: b.x - ux * endOffset, y: b.y - uy * endOffset },
  }
}

function lerp(a: Point, b: Point, progress: number): Point {
  return {
    x: a.x + (b.x - a.x) * progress,
    y: a.y + (b.y - a.y) * progress,
  }
}

export function Scene({ step, playing, replayKey }: { step: LessonStep; playing: boolean; replayKey: number }) {
  const [elapsed, setElapsed] = useState(0)
  const clock = useRef({ last: 0, elapsed: 0 })

  useEffect(() => {
    clock.current = { last: 0, elapsed: 0 }
    setElapsed(0)
  }, [step.id, replayKey])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    function tick(now: number) {
      const c = clock.current
      const delta = c.last ? Math.min(50, now - c.last) : 0
      c.last = now
      c.elapsed = (c.elapsed + delta) % 2400
      setElapsed(c.elapsed)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      clock.current.last = 0
    }
  }, [playing, step.id, replayKey])

  const active = step.activeEdge === undefined ? undefined : step.edges[step.activeEdge]
  const from = active && step.nodes.find(node => node.id === active.from)
  const to = active && step.nodes.find(node => node.id === active.to)
  const packetSegment = from && to ? connectingSegment(from, to, packetClearance) : null
  const progress = (elapsed % 2400) / 2400
  const pos = packetSegment ? lerp(packetSegment.start, packetSegment.end, progress) : null

  return (
    <div className="scene-wrap">
      <svg
        viewBox="0 0 850 310"
        role="img"
        aria-label={`Architecture diagram for ${step.title}: ${step.nodes.map(node => node.label).join(', ')}`}
      >
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeOpacity=".075" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="850" height="310" fill="url(#grid)" rx="16" />

        {step.edges.map((edge, index) => {
          const a = step.nodes.find(node => node.id === edge.from)
          const b = step.nodes.find(node => node.id === edge.to)
          if (!a || !b) return null
          const segment = connectingSegment(a, b, 0)
          if (!segment) return null
          return (
            <line
              key={`${edge.from}-${edge.to}-${index}`}
              x1={segment.start.x}
              y1={segment.start.y}
              x2={segment.end.x}
              y2={segment.end.y}
              stroke={index === step.activeEdge ? '#cc8a45' : '#91a5a8'}
              strokeWidth={index === step.activeEdge ? 3.5 : 2}
              strokeDasharray={index === step.activeEdge ? '7 5' : undefined}
            />
          )
        })}

        {step.nodes.map(node => (
          <g key={node.id} transform={`translate(${node.x},${node.y})`}>
            <rect
              x={-nodeWidth / 2 + 4}
              y={-nodeHeight / 2 + 8}
              width={nodeWidth}
              height={nodeHeight}
              rx="14"
              fill="#394146"
              opacity=".14"
            />
            <rect
              x={-nodeWidth / 2}
              y={-nodeHeight / 2}
              width={nodeWidth}
              height={nodeHeight}
              rx="14"
              fill={palette[node.kind]}
              stroke="#52636a"
              strokeOpacity=".4"
              strokeWidth="1.5"
            />
            <path d="M-50 -21H45" stroke="#fff" strokeOpacity=".42" strokeWidth="2" />
            <text x="0" y="6" textAnchor="middle" fontSize="15" fill="#1f2e34" fontWeight="700">
              {node.label}
            </text>
          </g>
        ))}

        {pos && (
          <g transform={`translate(${pos.x},${pos.y})`}>
            <circle r={packetRadius} fill="#fff" stroke="#bf7637" strokeWidth={packetStrokeWidth} />
            <circle r="3" fill="#bf7637" />
          </g>
        )}
      </svg>
      <div className="diagram-caption">
        {step.activeEdge !== undefined ? '● Animated request path' : 'Architecture scene'}
        {' · Educational illustration, not live infrastructure'}
      </div>
    </div>
  )
}
