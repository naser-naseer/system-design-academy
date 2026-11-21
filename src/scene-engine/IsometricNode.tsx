import type { SceneNode } from '../curriculum/lessons'
import type { NodeVisual } from './timeline'

function NodeIcon({node}: {node:SceneNode}) {
  const n=node.label.toLowerCase()
  if(/order|cart/.test(n)) return <g fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M-14-9h4l4 16H12L16-4H-6M-4 7l-2 3h17"/><circle cx="-2" cy="13" r="2"/><circle cx="10" cy="13" r="2"/></g>
  if(/courier|truck|delivery/.test(n)) return <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="-18" y="-6" width="24" height="15" rx="2"/><path d="M6-2h8l5 7v4H6"/><circle cx="-10" cy="11" r="3"/><circle cx="12" cy="11" r="3"/></g>
  if(node.kind==='client')return <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><rect x="-14" y="-13" width="28" height="20" rx="3"/><path d="M-19 13h38l-6-6h-26Z"/></g>
  if(node.kind==='gateway')return <g fill="none" stroke="currentColor" strokeWidth="2.3"><rect x="-6" y="-14" width="12" height="10" rx="2"/><rect x="-19" y="6" width="13" height="10" rx="2"/><rect x="6" y="6" width="13" height="10" rx="2"/><path d="M0-4V2H-12V6M0 2H12V6"/></g>
  if(node.kind==='monitor')return <g fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="-18" y="-13" width="36" height="26" rx="4"/><path d="M-13 4h6l6-10 6 13 5-7h3"/></g>
  if(/queue|broker/.test(n))return <g fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="-17" y="-11" width="34" height="9" rx="2"/><rect x="-17" y="3" width="34" height="9" rx="2"/><path d="M-12-6h11M-12 8h11"/></g>
  return <g fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round"><path d="M-12-10h24v20h-24Z"/><circle r="5"/><path d="M-6-16v6M6-16v6M-6 10v6M6 10v6"/></g>
}

/** A parametric extrusion: 2:1 top diamond, rounded silhouette, visible side faces. */
function Block({node}: {node:SceneNode}) {
  const labelSize=node.label.length>12 ? 11.2 : 13.5
  return <>
    <ellipse cy="53" rx="49" ry="9" className="v4-node-shadow"/>
    <path d="M-56-23 L0 5 L0 45 Q0 52-6 49 L-50 27 Q-56 24-56 17Z" className="v4-face-left"/>
    <path d="M0 5 L56-23 V17 Q56 24 50 27 L6 49 Q0 52 0 45Z" className="v4-face-right"/>
    <path d="M-6-48 Q0-51 6-48 L50-26 Q56-23 50-20 L6 2 Q0 5-6 2 L-50-20 Q-56-23-50-26Z" className="v4-face-top"/>
    <path d="M-56-23 L-6 2 Q0 5 6 2 L56-23" className="v4-face-seam"/>
    <path d="M-6-48 Q0-51 6-48 L50-26 Q56-23 56-17 V17 Q56 24 50 27 L6 49 Q0 52-6 49 L-50 27 Q-56 24-56 17 V-17 Q-56-23-50-26Z" className="v4-outer-contour"/>
    <g transform="translate(0,-27) scale(.85)" className="v4-node-icon"><NodeIcon node={node}/></g>
    <text x="0" y="22" fontSize={labelSize} className="v4-block-label" textAnchor="middle" textLength={node.label.length>16?'100':undefined} lengthAdjust="spacingAndGlyphs">{node.label}</text>
  </>
}

/** Elliptical storage volume and a raised micro-label capsule. */
function Store({node}: {node:SceneNode}) {
  const width=Math.max(68,Math.min(123,24+node.label.length*7.05))
  return <>
    <ellipse cy="39" rx="38" ry="9" className="v4-node-shadow"/>
    <path d="M-34-22 V16 C-34 38 34 38 34 16 V-22Z" className="v4-store-wall"/>
    <path d="M-34 16 C-34 38 34 38 34 16" className="v4-store-base"/>
    <ellipse cx="0" cy="-22" rx="34" ry="17" className="v4-store-top"/>
    <path d="M-29-24 Q0-6 29-24" className="v4-store-glint"/>
    <g transform="translate(0,6)" fill="none" className="v4-node-icon" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <ellipse cx="0" cy="-5" rx="7" ry="3"/>
      <path d="M-7-5V8 Q0 15 7 8V-5 M-7 2 Q0 8 7 2"/>
    </g>
    <g className="v4-store-label">
      <rect x="39" y="-9" width={width} height="21" rx="10.5" className="v4-pill-shadow"/>
      <rect x="39" y="-11" width={width} height="21" rx="10.5" className="v4-pill-fill"/>
      <circle cx="50" cy="-.5" r="4.7" className="v4-pill-symbol"/>
      <text x="61" y="3" className="v4-pill-text">{node.label}</text>
    </g>
  </>
}

/** A cluster of people on one shallow isometric platform for user-facing scenarios. */
function Crowd({node}: {node:SceneNode}) {
  const people=Array.from({length:12},(_,i)=>({x:-54+(i%4)*29+(Math.floor(i/4)%2)*10,y:-24+Math.floor(i/4)*18}))
  return <>
    <ellipse rx="98" ry="39" cy="49" className="v4-node-shadow"/>
    <path d="M-98-12 L0-61 L98-12 V1 L0 53 L-98 1Z" fill="#e5ddd0" stroke="#211e1b" strokeWidth="1.6"/>
    <path d="M0-61L98-12L0 37L-98-12Z" fill="#faf3e9" stroke="#211e1b" strokeWidth="1.6"/>
    {people.map((p,i)=><g key={i} transform={`translate(${p.x} ${p.y})`}>
      <ellipse cy="10" rx="5" ry="2.7" fill="#b6aa99" opacity=".42"/>
      <rect x="-5.3" y="1" width="10.6" height="18" rx="4" fill={['#acd3e2','#e9c09c','#c9bee2','#b7d6a8'][i%4]} stroke="#211e1b" strokeWidth="1.2"/>
      <circle cy="-3" r="5.3" fill="#fff5e9" stroke="#211e1b" strokeWidth="1.2"/>
    </g>)}
    <g transform="translate(-37 69)" className="v4-store-label"><rect x="0" y="2" width="83" height="21" rx="10.5" className="v4-pill-shadow"/>
      <rect width="83" height="21" rx="10.5" className="v4-pill-fill"/>
      <text x="42" y="14" textAnchor="middle" className="v4-pill-text">{node.label}</text></g>
  </>
}

/** Ghost entities remain visible until their timeline reveal, like the captured reference. */
export function IsometricNode({node,visual}: {node:SceneNode;visual:NodeVisual}) {
  const opacity=visual.opacity<=.001?.28:.28+visual.opacity*.72
  const tone=node.kind==='database'||node.kind==='cache'?'violet':
    /payment|billing/i.test(node.label)?'violet':
    /order|browser|client/i.test(node.label)?'blue':
    /gateway|load balance|proxy|api/i.test(node.label)?'orange':
    /courier|service|worker|consumer/i.test(node.label)?'green':
    /repository|validation|handler/i.test(node.label)?'yellow':
    node.kind==='component'?'teal':'green'
  const status=visual.status==='failed'?'failed':visual.status==='busy'?'busy':visual.status==='healthy'?'healthy':''
  return <g transform={`translate(${node.x} ${node.y})`}
    className={`v4-node v4-${tone} ${status?`v4-${status}`:''} ${visual.highlighted?'v4-highlight':''}`}
    opacity={opacity} aria-label={`${node.label}${status?` — ${status}`:''}`}>
    {node.kind==='client'&&/customers|people|users/i.test(node.label)?<Crowd node={node}/>:node.kind==='database'||node.kind==='cache'?<Store node={node}/>:<Block node={node}/>} 
    {status==='failed'&&<g transform="translate(41,-42)"><circle r="10" fill="#ba4b42" stroke="#1d1b18" strokeWidth="1.5"/><text y="5" fontSize="15" textAnchor="middle" fill="white" fontWeight="800">!</text></g>}
    {status==='busy'&&<g transform="translate(41,-42)"><circle r="10" fill="#d59b36" stroke="#1d1b18" strokeWidth="1.5"/><text y="4" fontSize="11" textAnchor="middle" fill="white" fontWeight="800">••</text></g>}
  </g>
}
