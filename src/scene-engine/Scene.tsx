import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { LessonStep, SceneNode } from '../curriculum/lessons'
import {
  NODE_WIDTH, NODE_HEIGHT, NODE_TOP, NODE_SIDE,
  PACKET_RADIUS, PACKET_STROKE,
} from './geometry'
import { routeConnection, pointOnRoute, routeToPath } from './routing'
import type { Route, RoutedNode } from './routing'
import { STAGE, boundsForNodes, fitCamera, zoomAt, panBy } from './camera'
import type { Camera } from './camera'
import './camera.css'
import './transitions.css'

const palette: Record<SceneNode['kind'], string> = {
  client: '#8fbcc7', gateway: '#c7ad76', service: '#91b7a1', cache: '#ad9bd1',
  database: '#d7a58d', component: '#93b8b8', monitor: '#a9b6c7',
}

function ArchitectureNode({node}: {node: SceneNode}) {
  const x = -NODE_WIDTH / 2
  const y = -NODE_HEIGHT / 2
  const color = palette[node.kind]
  return <g transform={`translate(${node.x},${node.y})`}>
    <rect x={x + 5} y={y + 9} rx="10" width={NODE_WIDTH + NODE_SIDE} height={NODE_HEIGHT + 8} fill="#152b32" opacity=".12" />
    <path d={`M${x} ${y} l${NODE_SIDE} ${-NODE_TOP} h${NODE_WIDTH} l${-NODE_SIDE} ${NODE_TOP} Z`} fill={color} stroke="#42575e" strokeOpacity=".45" />
    <path d={`M${x + NODE_WIDTH} ${y} l${NODE_SIDE} ${-NODE_TOP} v${NODE_HEIGHT} l${-NODE_SIDE} ${NODE_TOP} Z`} fill="#657c80" stroke="#42575e" strokeOpacity=".4" />
    <rect x={x} y={y} width={NODE_WIDTH} height={NODE_HEIGHT} rx="6" fill={color} stroke="#475e63" strokeOpacity=".55" strokeWidth="1.5" />
    <path d={`M${x + 12} ${y + 13} h${NODE_WIDTH - 24}`} stroke="#fff" strokeOpacity=".48" strokeWidth="2" />
    <circle cx={x + 12} cy={y + NODE_HEIGHT - 12} r="3" fill="#336758" opacity=".85" />
    <text textAnchor="middle" y="6" fontSize="14" fill="#20333a" fontWeight="700">{node.label}</text>
  </g>
}

type RoutedEdge = { id: string; route: Route; active: boolean }
function routeEdges(step: LessonStep): RoutedEdge[] {
  return step.edges.flatMap((edge,index) => {
    const a=step.nodes.find(n=>n.id===edge.from)
    const b=step.nodes.find(n=>n.id===edge.to)
    if(!a||!b)return []
    const route=routeConnection(a as RoutedNode,b as RoutedNode,step.nodes as RoutedNode[])
    return route ? [{ id:`${edge.from}-${edge.to}-${index}`, route, active:index===step.activeEdge }] : []
  })
}

function SceneContent({step, edges, elapsed, reducedMotion, showPacket}: {
  step: LessonStep; edges: RoutedEdge[]; elapsed: number; reducedMotion: boolean; showPacket: boolean
}) {
  const active=edges.find(edge=>edge.active)
  const packet=active && showPacket ? pointOnRoute(active.route,reducedMotion?1:elapsed/2400) : null
  const nodesByDepth=[...step.nodes].sort((a,b)=>a.y-b.y || a.x-b.x)
  return <>
    {edges.map(edge=><path key={edge.id} d={routeToPath(edge.route)}
      fill="none" stroke={edge.active?'#c78543':'#8da5a8'}
      strokeWidth={edge.active?3.5:2}
      strokeLinejoin="round" strokeLinecap="round"
      strokeDasharray={edge.active?'7 5':undefined} />)}
    {nodesByDepth.map(n=><ArchitectureNode key={n.id} node={n}/>)}
    {packet && <g transform={`translate(${packet.x},${packet.y})`}>
      <circle r={PACKET_RADIUS} fill="white" stroke="#bc783d" strokeWidth={PACKET_STROKE}/>
      <circle r="2.7" fill="#bc783d"/>
    </g>}
  </>
}

/** Phase 4: obstacle-aware routing, arc-length packet animation and cancelable scene crossfades. */
export function Scene({step, playing, replayKey}: {step: LessonStep; playing: boolean; replayKey: number}) {
  const [elapsed, setElapsed]=useState(0)
  const bounds=useMemo(()=>boundsForNodes(step.nodes),[step])
  const [camera,setCamera]=useState<Camera>(()=>fitCamera(step.nodes))
  const svgRef=useRef<SVGSVGElement>(null)
  const drag=useRef<{start:{x:number;y:number}; initial:Camera; pointerId:number}|null>(null)
  const reducedMotion=typeof window!=='undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const currentEdges=useMemo(()=>routeEdges(step),[step])

  const lastStep=useRef(step)
  const [outgoing,setOutgoing]=useState<LessonStep|null>(null)
  useEffect(()=>{
    const previous=lastStep.current
    lastStep.current=step
    if(previous.id===step.id || reducedMotion){setOutgoing(null);return}
    setOutgoing(previous)
    const timeout=window.setTimeout(()=>setOutgoing(null),260)
    return ()=>window.clearTimeout(timeout)
  },[step,reducedMotion])
  const outgoingEdges=useMemo(()=>outgoing?routeEdges(outgoing):[],[outgoing])

  useEffect(()=>{setCamera(fitCamera(step.nodes));drag.current=null},[step])
  function svgPoint(clientX:number,clientY:number){
    const svg=svgRef.current
    if(!svg)return null
    const matrix=svg.getScreenCTM()
    if(!matrix)return null
    const point=svg.createSVGPoint()
    point.x=clientX;point.y=clientY
    const result=point.matrixTransform(matrix.inverse())
    return {x:result.x,y:result.y}
  }
  function onPointerDown(event:ReactPointerEvent<SVGSVGElement>){
    if(event.button!==0)return
    const start=svgPoint(event.clientX,event.clientY)
    if(!start)return
    drag.current={start,initial:camera,pointerId:event.pointerId}
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function onPointerMove(event:ReactPointerEvent<SVGSVGElement>){
    if(!drag.current||drag.current.pointerId!==event.pointerId)return
    const current=svgPoint(event.clientX,event.clientY)
    if(!current)return
    const d=drag.current
    setCamera(panBy(d.initial,{x:current.x-d.start.x,y:current.y-d.start.y},bounds))
  }
  function onPointerEnd(event:ReactPointerEvent<SVGSVGElement>){
    if(drag.current?.pointerId!==event.pointerId)return
    drag.current=null
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)
  }
  function changeZoom(factor:number){setCamera(old=>zoomAt(old,factor,{x:STAGE.width/2,y:STAGE.height/2},bounds))}

  const clock=useRef({elapsed:0,last:0})
  useEffect(()=>{clock.current={elapsed:0,last:0};setElapsed(0)},[step.id,replayKey])
  useEffect(()=>{
    if(!playing||reducedMotion)return
    let frame=0
    const tick=(now:number)=>{
      const c=clock.current
      const delta=c.last?Math.min(50,now-c.last):0
      c.last=now
      c.elapsed=(c.elapsed+delta)%2400
      setElapsed(c.elapsed)
      frame=requestAnimationFrame(tick)
    }
    frame=requestAnimationFrame(tick)
    return ()=>{cancelAnimationFrame(frame);clock.current.last=0}
  },[playing,reducedMotion,replayKey,step.id])

  const active=currentEdges.some(edge=>edge.active)
  return <div className="scene-wrap">
    <div className="scene-camera-toolbar" role="group" aria-label="Diagram camera controls">
      <span className="camera-help">Drag to pan · Routed connections</span>
      <button type="button" onClick={()=>changeZoom(1/1.25)} aria-label="Zoom out" title="Zoom out">−</button>
      <output aria-label="Diagram zoom" className="camera-zoom">{Math.round(camera.scale*100)}%</output>
      <button type="button" onClick={()=>changeZoom(1.25)} aria-label="Zoom in" title="Zoom in">+</button>
      <button type="button" onClick={()=>setCamera(fitCamera(step.nodes))} aria-label="Fit diagram" title="Fit all nodes">Fit</button>
    </div>
    <svg ref={svgRef} viewBox="0 0 850 310" role="img" className="scene-stage"
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd} onLostPointerCapture={()=>{drag.current=null}}
      aria-label={`Architecture for ${step.title}: ${step.nodes.map(n=>n.label).join(', ')}. ${step.edges.length} component connections.`}>
      <defs>
        <pattern id="scene-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" stroke="currentColor" strokeOpacity=".075" fill="none"/>
        </pattern>
      </defs>
      <rect width="850" height="310" rx="16" fill="url(#scene-grid)"/>
      <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.scale})`}>
        {outgoing&&!reducedMotion&&<g className="scene-outgoing" aria-hidden="true">
          <SceneContent step={outgoing} edges={outgoingEdges} elapsed={0} reducedMotion={true} showPacket={false}/>
        </g>}
        <g className={outgoing&&!reducedMotion?'scene-incoming':''} key={step.id}>
          <SceneContent step={step} edges={currentEdges} elapsed={elapsed} reducedMotion={reducedMotion} showPacket={true}/>
        </g>
      </g>
    </svg>
    <div className="diagram-caption">{active?'● Animated request path':'Architecture scene'} · Obstacle-aware routing · 2.5D illustration</div>
  </div>
}
