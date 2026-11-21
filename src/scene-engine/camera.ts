import type { Point, DiagramNode } from './geometry.ts'
import { artworkBounds } from './geometry.ts'

export interface Bounds { left: number; right: number; top: number; bottom: number }
export interface Camera { scale: number; x: number; y: number }
export const STAGE = { width: 850, height: 620 } as const
export const MIN_ZOOM = 0.5
export const MAX_ZOOM = 2.8
const VISIBLE_MARGIN = 52

export function boundsForNodes(nodes: readonly DiagramNode[]): Bounds {
  if (!nodes.length) return { left: 0, right: STAGE.width, top: 0, bottom: STAGE.height }
  return nodes.reduce<Bounds>((out, node) => {
    const b = artworkBounds(node)
    return {
      left: Math.min(out.left, b.left), right: Math.max(out.right, b.right),
      top: Math.min(out.top, b.top), bottom: Math.max(out.bottom, b.bottom),
    }
  }, {left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity})
}

export function clampCamera(camera: Camera, bounds: Bounds): Camera {
  const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, camera.scale))
  const minX = VISIBLE_MARGIN - bounds.right * scale
  const maxX = STAGE.width - VISIBLE_MARGIN - bounds.left * scale
  const minY = VISIBLE_MARGIN - bounds.bottom * scale
  const maxY = STAGE.height - VISIBLE_MARGIN - bounds.top * scale
  const x = Math.max(Math.min(minX,maxX), Math.min(Math.max(minX,maxX), camera.x))
  const y = Math.max(Math.min(minY,maxY), Math.min(Math.max(minY,maxY), camera.y))
  return {scale, x, y}
}

/** Fits the complete 2.5D node geometry, including top and right faces, into the SVG stage. */
export function fitCamera(nodes: readonly DiagramNode[], padding = 28): Camera {
  const bounds = boundsForNodes(nodes)
  const width = Math.max(1, bounds.right - bounds.left)
  const height = Math.max(1, bounds.bottom - bounds.top)
  const reservedTop = 82 // In-scene context chips must not cover the first row of nodes.
  const reservedBottom = 48 // Keep the legend separate from the last row.
  const scale = Math.max(MIN_ZOOM, Math.min(1.15,
    (STAGE.width - padding * 2) / width,
    (STAGE.height - reservedTop - reservedBottom) / height,
  ))
  return clampCamera({scale,
    x: STAGE.width/2 - (bounds.left + bounds.right) * scale/2,
    y: reservedTop + (STAGE.height - reservedTop - reservedBottom)/2 - (bounds.top + bounds.bottom) * scale/2,
  }, bounds)
}

/** Preserve the world point under the supplied screen-space anchor when changing zoom. */
export function zoomAt(camera: Camera, factor: number, anchor: Point, bounds: Bounds): Camera {
  if (!Number.isFinite(factor) || factor <= 0) return camera
  const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, camera.scale * factor))
  const ratio = scale / camera.scale
  return clampCamera({scale,
    x: anchor.x - (anchor.x-camera.x)*ratio,
    y: anchor.y - (anchor.y-camera.y)*ratio,
  }, bounds)
}

export function panBy(camera: Camera, delta: Point, bounds: Bounds): Camera {
  return clampCamera({...camera, x:camera.x+delta.x, y:camera.y+delta.y},bounds)
}
