/** Pure, replayable educational scene timeline. No DOM, timer or randomness. */
export type NodeStatus = 'idle' | 'active' | 'busy' | 'failed' | 'healthy'
export type PacketKind = 'request' | 'response' | 'retry' | 'error'
export type TimelineAction = {
  id: string
  type: 'appear' | 'disappear' | 'status' | 'highlight' | 'edge' | 'packet'
  atMs: number
  durationMs?: number
  nodeId?: string
  edgeIndex?: number
  status?: NodeStatus
  enabled?: boolean
  kind?: PacketKind
}
export interface TimelineDefinition {
  durationMs: number
  loop?: boolean
  actions: TimelineAction[]
}
export interface TimelineStep {
  nodes: readonly { id: string; status?: string }[]
  edges: readonly { from: string; to: string }[]
  activeEdge?: number
  timeline?: TimelineDefinition
}
export interface NodeVisual { opacity: number; status: NodeStatus; highlighted: boolean }
export interface PacketVisual { id: string; edgeIndex: number; progress: number; kind: PacketKind }
export interface TimelineFrame {
  timeMs: number
  nodes: Record<string, NodeVisual>
  edges: boolean[]
  packets: PacketVisual[]
  finished: boolean
}

const LEGACY_DURATION = 3000
const LEGACY_PACKET_DURATION = 2400
const DEFAULT_STATUS: NodeStatus = 'idle'
const isStatus = (value: unknown): value is NodeStatus =>
  value === 'idle' || value === 'active' || value === 'busy' || value === 'failed' || value === 'healthy'
const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n))

/** Reproduces earlier single-packet lessons without requiring content migration. */
export function effectiveTimeline(step: TimelineStep): TimelineDefinition {
  if (step.timeline) return step.timeline
  return {
    durationMs: LEGACY_DURATION,
    loop: true,
    actions: step.activeEdge === undefined ? [] : [
      { id: 'legacy-packet', type: 'packet', edgeIndex: step.activeEdge,
        atMs: 0, durationMs: LEGACY_PACKET_DURATION, kind: 'request' },
    ],
  }
}

/** Returns a stateless frame for a given elapsed time; safe to seek in any order. */
export function evaluateTimeline(step: TimelineStep, elapsedMs: number, reducedMotion = false): TimelineFrame {
  const timeline = effectiveTimeline(step)
  const duration = timeline.durationMs
  const raw = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0
  const timeMs = reducedMotion ? duration : timeline.loop ? raw % duration : Math.min(raw, duration)
  const nodes: Record<string, NodeVisual> = Object.create(null)
  for (const node of step.nodes) {
    nodes[node.id] = {
      opacity: 1,
      status: isStatus(node.status) ? node.status : DEFAULT_STATUS,
      highlighted: false,
    }
  }
  const edges = step.edges.map(() => true)
  const packets: PacketVisual[] = []
  const actions = [...timeline.actions].sort((a,b) => a.atMs-b.atMs || a.id.localeCompare(b.id))
  // Establish the start state for delayed appearances even before their first frame.
  for (const a of actions) if (a.type === 'appear' && a.nodeId && nodes[a.nodeId]) nodes[a.nodeId].opacity = 0
  for (const action of actions) {
    if (action.atMs > timeMs) continue
    const span = action.durationMs ?? 0
    const fraction = span > 0 ? clamp((timeMs - action.atMs) / span) : 1
    const node = action.nodeId ? nodes[action.nodeId] : undefined
    switch (action.type) {
      case 'appear': if (node) node.opacity = reducedMotion ? 1 : fraction; break
      case 'disappear': if (node) node.opacity = reducedMotion ? 0 : 1 - fraction; break
      case 'status': if (node && action.status) node.status = action.status; break
      case 'highlight': if (node) node.highlighted = action.enabled ?? true; break
      case 'edge': if (action.edgeIndex !== undefined && action.edgeIndex in edges) edges[action.edgeIndex] = action.enabled ?? true; break
      case 'packet': {
        if (action.edgeIndex === undefined || !edges[action.edgeIndex] || span <= 0) break
        if (timeMs > action.atMs + span) break
        packets.push({id: action.id, edgeIndex: action.edgeIndex, progress: reducedMotion ? 1 : fraction, kind: action.kind ?? 'request'})
        break
      }
    }
  }
  return {timeMs,nodes,edges,packets,finished:!timeline.loop && raw >= duration}
}

/** Validation designed for CI and content authors; no scene should silently fail. */
export function validateTimeline(step: TimelineStep): string[] {
  const timeline = step.timeline
  if (!timeline) return []
  const errors: string[] = []
  if (!Number.isFinite(timeline.durationMs) || timeline.durationMs <= 0) errors.push('durationMs must be positive and finite')
  const ids = new Set<string>()
  const nodes = new Set(step.nodes.map(n=>n.id))
  for (const a of timeline.actions) {
    if (!a.id || ids.has(a.id)) errors.push(`duplicate or empty action ID: ${a.id}`)
    ids.add(a.id)
    if (!Number.isFinite(a.atMs) || a.atMs < 0) errors.push(`${a.id}: invalid atMs`)
    if (a.atMs > timeline.durationMs) errors.push(`${a.id}: starts after timeline ends`)
    if (a.durationMs !== undefined && (!Number.isFinite(a.durationMs) || a.durationMs < 0 || a.atMs+a.durationMs > timeline.durationMs)) errors.push(`${a.id}: invalid durationMs`)
    if (['appear','disappear','highlight','status'].includes(a.type) && (!a.nodeId || !nodes.has(a.nodeId))) errors.push(`${a.id}: unknown nodeId`)
    if (['packet','edge'].includes(a.type) && (a.edgeIndex === undefined || !Number.isInteger(a.edgeIndex) || a.edgeIndex < 0 || a.edgeIndex >= step.edges.length)) errors.push(`${a.id}: invalid edgeIndex`)
    if (a.type === 'packet' && !(a.durationMs && a.durationMs > 0)) errors.push(`${a.id}: packet requires positive durationMs`)
    if (a.type === 'status' && !isStatus(a.status)) errors.push(`${a.id}: invalid status`)
  }
  return errors
}

/** Fixed frame increment with tab-resume clamping; pause/resume handled by caller. */
export function advanceClock(elapsed: number, delta: number, maxDelta = 50): number {
  return elapsed + (Number.isFinite(delta) ? clamp(delta, 0, maxDelta) : 0)
}
