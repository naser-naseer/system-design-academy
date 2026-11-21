import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { LessonStep } from '../curriculum/lessons'
import { IsometricNode } from './IsometricNode'
import { PACKET_RADIUS } from './geometry'
import { routeIsometricConnection, pointOnRouteInset, routeToPath } from './routing'
import type { Route, RoutedNode } from './routing'
import { STAGE, boundsForNodes, fitCamera, zoomAt, panBy } from './camera'
import type { Camera } from './camera'
import './camera.css'
import './transitions.css'
import {evaluateTimeline, advanceClock, validateTimeline} from './timeline'
import type {TimelineFrame, PacketKind} from './timeline'
import {hldLldTimelines} from './lesson-timelines'
import './timeline.css'

type RoutedEdge = { id: string; route: Route; active: boolean }
function routeEdges(step: LessonStep): RoutedEdge[] {
  return step.edges.flatMap((edge,index) => {
    const a=step.nodes.find(n=>n.id===edge.from)
    const b=step.nodes.find(n=>n.id===edge.to)
    if(!a||!b)return []
    const route=routeIsometricConnection(a as RoutedNode,b as RoutedNode,step.nodes as RoutedNode[])
    return route ? [{ id:`${edge.from}-${edge.to}-${index}`, route, active:index===step.activeEdge }] : []
  })
}

const packetColors: Record<PacketKind, string> = {
  request: '#bc783d', response: '#388a7e', retry: '#9876ca', error: '#c94545',
}
function SceneContent({step, edges, frame}: {
  step: LessonStep; edges: RoutedEdge[]; frame: TimelineFrame
}) {
  const nodesByDepth=[...step.nodes].sort((a,b)=>a.y-b.y || a.x-b.x)
  const routeByIndex=new Map(step.edges.map((edge,index)=>[index, edges.find(e=>e.id===`${edge.from}-${edge.to}-${index}`)]))
  return <>
    {edges.map(edge=>{
      const index=step.edges.findIndex((e,i)=>edge.id===`${e.from}-${e.to}-${i}`)
      if(index<0 || !frame.edges[index])return null
      const source=step.nodes.find(n=>n.id===step.edges[index].from)
      const target=step.nodes.find(n=>n.id===step.edges[index].to)
      // Keep future architecture visible: same ghost alpha as unrevealed blocks.
      const opacity=Math.max(.26,Math.min(source?frame.nodes[source.id].opacity:1,target?frame.nodes[target.id].opacity:1))
      return <path key={edge.id} d={routeToPath(edge.route)} opacity={opacity}
        className={edge.active?'scene-edge-active':'scene-edge'} fill="none"
        strokeWidth={edge.active?3.5:2} strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray={edge.active?'7 5':undefined} markerEnd="url(#v4-arrow)"/>
    })}
    {nodesByDepth.map(n=><IsometricNode key={n.id} node={n} visual={frame.nodes[n.id]}/>)}
    {frame.packets.map(packet=>{
      const edge=routeByIndex.get(packet.edgeIndex)
      if(!edge)return null
      const location=pointOnRouteInset(edge.route,packet.progress)
      if(!location)return null
      const color=packetColors[packet.kind]
      return <g key={packet.id} transform={`translate(${location.x},${location.y})`}>
        <circle r={PACKET_RADIUS} fill={color} stroke="#211e1b" strokeWidth={1.4}/>
        
      </g>
    })}
  </>
}

/** Phase 5: declarative timeline layered on Phase 4 routed scenes and Phase 3 camera. */
export function Scene({step, playing, replayKey}: {step: LessonStep; playing: boolean; replayKey: number}) {
  const reducedMotion=typeof window!=='undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [elapsed, setElapsed]=useState(0)
  const timelineStep=useMemo(()=>({...step,timeline:step.timeline ?? hldLldTimelines[step.id]}),[step])
  const frame=useMemo(()=>evaluateTimeline(timelineStep,elapsed,reducedMotion),[timelineStep,elapsed,reducedMotion])
  const bounds=useMemo(()=>boundsForNodes(step.nodes),[step])
  const [camera,setCamera]=useState<Camera>(()=>fitCamera(step.nodes))
  const svgRef=useRef<SVGSVGElement>(null)
  const drag=useRef<{start:{x:number;y:number}; initial:Camera; pointerId:number}|null>(null)
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
  const outgoingFrame=useMemo(()=>outgoing?evaluateTimeline({...outgoing,timeline:outgoing.timeline ?? hldLldTimelines[outgoing.id]},0,true):null,[outgoing])

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
      if(document.visibilityState==='hidden'){c.last=now;frame=requestAnimationFrame(tick);return}
      c.elapsed=advanceClock(c.elapsed,delta)
      setElapsed(c.elapsed)
      frame=requestAnimationFrame(tick)
    }
    frame=requestAnimationFrame(tick)
    return ()=>{cancelAnimationFrame(frame);clock.current.last=0}
  },[playing,reducedMotion,replayKey,step.id])

  const active=currentEdges.some(edge=>edge.active)
  const context = step.visual
  const timelineWarnings=useMemo(()=>validateTimeline(timelineStep),[timelineStep])
  return <div className="scene-wrap">
    <div className="scene-camera-toolbar" role="group" aria-label="Diagram camera controls">
      <span className="camera-help">Drag to pan · Full architecture</span>
      <button type="button" onClick={()=>changeZoom(1/1.25)} aria-label="Zoom out" title="Zoom out">−</button>
      <output aria-label="Diagram zoom" className="camera-zoom">{Math.round(camera.scale*100)}%</output>
      <button type="button" onClick={()=>changeZoom(1.25)} aria-label="Zoom in" title="Zoom in">+</button>
      <button type="button" onClick={()=>setCamera(fitCamera(step.nodes))} aria-label="Fit diagram" title="Fit all nodes">Fit</button>
    </div>
    <div className="diagram-context" aria-label="Architecture scene context">
      <div><small>ZOOM LEVEL</small><strong>{context?.zoomLevel ?? 'Whole system'}</strong></div>
      <div><small>BUILDING BLOCKS</small><strong>{context?.buildingBlocks ?? `${step.nodes.length} components · ${step.edges.length} links`}</strong></div>
      <div><small>YOU PRODUCE</small><strong>{context?.deliverable ?? 'Architecture diagram'}</strong></div>
    </div>
    <svg ref={svgRef} viewBox="0 0 850 620" role="img" className="scene-stage"
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd} onLostPointerCapture={()=>{drag.current=null}}
      aria-label={`Architecture for ${step.title}: ${step.nodes.map(n=>n.label).join(', ')}. ${step.edges.length} component connections.`}>
      <defs>
        <pattern id="scene-iso-grid" width="36" height="18" patternUnits="userSpaceOnUse" className="scene-floor-pattern">
          <path d="M0 9 18 0 36 9 18 18Z M0 9 18 18 M18 0 36 9" stroke="currentColor" strokeOpacity=".13" strokeWidth=".65" fill="none"/>
        </pattern>
        <marker id="v4-arrow" viewBox="0 0 10 10" markerWidth="5.8" markerHeight="5.8" refX="9.2" refY="5" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
          <path d="M1 1 L9 5 L1 9 Z" fill="#46413b"/>
        </marker>
        <filter id="v4-ambient-shadow" x="-35%" y="-80%" width="170%" height="260%">
          <feGaussianBlur stdDeviation="5"/>
        </filter>
      </defs>
      <rect width="850" height="620" rx="10" className="scene-stage-surface"/>
      <rect width="850" height="620" rx="10" fill="url(#scene-iso-grid)"/>
      <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.scale})`}>

        {outgoing&&!reducedMotion&&<g className="scene-outgoing" aria-hidden="true">
          <SceneContent step={outgoing} edges={outgoingEdges} frame={{...outgoingFrame!,packets:[]}}/>
        </g>}
        <g className={outgoing&&!reducedMotion?'scene-incoming':''} key={step.id}>
          <SceneContent step={step} edges={currentEdges} frame={frame}/>
        </g>
      </g>
      <g className="scene-stage-legend" aria-hidden="true" transform="translate(19 600)">
        <circle r="4" cx="5" fill="#b8623e" stroke="#362b22" strokeWidth="1"/><text x="16" y="4">request</text>
        <circle r="4" cx="113" fill="#4d9a75" stroke="#362b22" strokeWidth="1"/><text x="124" y="4">response</text>
        <circle r="4" cx="229" fill="#d7a047" stroke="#362b22" strokeWidth="1"/><text x="240" y="4">event</text>
      </g>
    </svg>
    <div className="diagram-caption">
      <span>{active?'● Follow the animated request':'◇ Explore the system components'}</span>
      <span>{step.nodes.length} components · {step.edges.length} connections · Illustrative model
        {timelineWarnings.length>0&&<span role="alert"> · Timeline validation error</span>}
      </span>
    </div>
  </div>
}
