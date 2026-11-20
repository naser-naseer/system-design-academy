import { useCallback, useEffect, useState } from 'react'
import { hldLldSteps, modules, parseRoute } from './curriculum/lessons'
import { Scene } from './scene-engine/Scene'
import './App.css'
const themeKey='sda:theme:v1',progressKey='sda:progress:v1'
function storedTheme(){try{return localStorage.getItem(themeKey)==='dark'?'dark':'light'}catch{return 'light'}}
function storedDone(){try{return localStorage.getItem(progressKey)==='complete'}catch{return false}}
function routeNow(){return parseRoute(location.hash)}
function App(){
 const [route,setRoute]=useState(routeNow)
 const [theme,setTheme]=useState(storedTheme)
 const [done,setDone]=useState(storedDone)
 const [playing,setPlaying]=useState(true)
 const [replayKey,setReplayKey]=useState(0)
 const [query,setQuery]=useState('')
 const [searchOpen,setSearchOpen]=useState(false)
 useEffect(()=>{const update=()=>{setRoute(routeNow());setPlaying(true)};window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update)},[])
 useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem(themeKey,theme)}catch{/* optional storage */}},[theme])
 const go=useCallback((step:number)=>{location.hash=`/hld-lld/${step}`},[])
 const stepIndex=route.step-1,step=hldLldSteps[stepIndex]
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{
  const target=e.target as HTMLElement | null
  if(e.ctrlKey||e.metaKey){if(e.key.toLowerCase()==='k'){e.preventDefault();setSearchOpen(v=>!v)}return}
  if(searchOpen||target?.matches('input,textarea,select,[contenteditable="true"]')){if(e.key==='Escape')setSearchOpen(false);return}
  if(route.view!=='lesson')return
  if(e.key==='ArrowRight'&&route.step<hldLldSteps.length){e.preventDefault();go(route.step+1)}
  if(e.key==='ArrowLeft'&&route.step>1){e.preventDefault();go(route.step-1)}
  if(e.key.toLowerCase()==='r'){setReplayKey(v=>v+1);setPlaying(true)}
  if(e.code==='Space'){e.preventDefault();setPlaying(v=>!v)}
 };window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[go,route,searchOpen])
 const searchResults=modules.flatMap(m=>m.topics.map(t=>({...t,module:m.title}))).filter(t=>`${t.name} ${t.module}`.toLowerCase().includes(query.toLowerCase())).slice(0,12)
 return <div className="app-shell">
  <header className="topbar"><a href="#/" className="brand"><span className="brand-icon">◇</span><span>DESIGNED <em>TO</em> SCALE</span></a><div className="top-links"><a href="#/">Curriculum</a><span title="Planned for a future release">Practice · soon</span><span title="Planned for a future release">Design Lab · soon</span></div><div className="actions"><button onClick={()=>setSearchOpen(true)} aria-label="Search lessons" className="search-trigger">⌕ <span>Search</span> <kbd>⌘ K</kbd></button><button onClick={()=>setTheme(t=>t==='light'?'dark':'light')} aria-label="Toggle theme">{theme==='light'?'☾':'☀'}</button></div></header>
  <div className="layout"><aside className="sidebar"><div className="sidebar-head">THE CURRICULUM <span>9 MODULES · 40 TOPICS</span></div><div className="module-list">{modules.map((m,i)=><details key={m.id} open={m.id==='whole'}><summary><span className="module-number">{String(i+1).padStart(2,'0')}</span>{m.title}<span className="count">{m.topics.length}</span></summary><div className="topic-list">{m.topics.map(t=><button key={t.id} disabled={!t.available} title={t.available?undefined:'Content planned — not yet implemented'} className={t.available&&route.view==='lesson'?'active':''} onClick={()=>t.available&&go(1)}>{t.name}{!t.available&&<small>Planned</small>}{t.available&&done&&<span>✓</span>}</button>)}</div></details>)}</div><div className="sidebar-bottom">{done?'✓ HLD vs LLD completed':'Complete your first lesson to track progress'}<small>Progress is saved locally in this browser.</small></div></aside>
   <main className="main-area">{route.view==='not-found'?<div className="welcome"><span className="eyebrow">ROUTE NOT FOUND</span><h1>That lesson step doesn’t exist.</h1><p>Choose a valid lesson from the curriculum.</p><a className="primary-link" href="#/">Back to curriculum</a></div>:route.view==='home'?<div className="welcome"><span className="eyebrow">AN INTERACTIVE SYSTEM DESIGN LEARNING LAB</span><h1>See how systems<br/><i>actually work.</i></h1><p>Learn distributed system architecture through original visual stories, step-by-step diagrams, and practical engineering trade-offs.</p><div className="overview-stats"><div><strong>09</strong><span>Modules planned</span></div><div><strong>40</strong><span>Topics mapped</span></div><div><strong>01</strong><span>Lesson available</span></div></div><button className="primary" onClick={()=>go(1)}>Explore HLD vs LLD →</button><p className="disclaimer">Early access · The remaining lessons are planned, not complete.</p></div>:<>
    <div className="lesson-head"><div><span className="eyebrow">WHOLE SYSTEMS / LESSON 01</span><h1>High-Level Design <span>vs.</span> Low-Level Design</h1><p>Understand how architectural decisions become implementable systems.</p></div><span className="step-pill">STEP {route.step.toString().padStart(2,'0')} / {hldLldSteps.length}</span></div>
    <div className="player-grid"><div className="canvas-panel"><div className="panel-top"><span>◈ ARCHITECTURE VISUALIZER</span><span className="live-dot">● {playing?'PLAYING':'PAUSED'}</span></div><Scene step={step} playing={playing} replayKey={replayKey}/><div className="controls"><button disabled={route.step===1} onClick={()=>go(route.step-1)}>← Previous</button><button onClick={()=>{setReplayKey(v=>v+1);setPlaying(true)}} aria-label="Replay animation">↺ Replay</button><button onClick={()=>setPlaying(p=>!p)} aria-label={playing?'Pause animation':'Play animation'}>{playing?'Ⅱ Pause':'▶ Play'}</button><button disabled={route.step===hldLldSteps.length} className="next" onClick={()=>go(route.step+1)}>Next step →</button></div></div>
    <article className="explanation"><span className={`category ${step.category}`}>{step.category.toUpperCase()}</span><h2>{step.title}</h2><p>{step.body}</p>{step.metric&&<div className="metric">{step.metric}<small>Assumption · not measured</small></div>}<div className="takeaway"><span>KEY TAKEAWAY</span><strong>{step.takeaway}</strong></div>{route.step===hldLldSteps.length&&<button className="primary complete" onClick={()=>{setDone(true);try{localStorage.setItem(progressKey,'complete')}catch{/* optional storage */}}}>{done?'✓ Lesson completed':'Mark lesson complete ✓'}</button>}<div className="shortcuts">← → Navigate &nbsp; · &nbsp; Space Pause &nbsp; · &nbsp; R Replay</div></article></div>
    <div className="lesson-progress" aria-label={`${route.step} of ${hldLldSteps.length} steps`}><div style={{width:`${route.step/hldLldSteps.length*100}%`}}/></div>
   </>}</main></div>
  {searchOpen&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSearchOpen(false)}}><div className="search-dialog" role="dialog" aria-modal="true" aria-label="Search curriculum"><div className="search-input"><span>⌕</span><input autoFocus placeholder="Search topics and modules…" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')setSearchOpen(false);if(e.key==='Enter'&&searchResults[0]?.available){go(1);setSearchOpen(false)}}}/><button onClick={()=>setSearchOpen(false)}>Esc ✕</button></div><div className="search-results">{searchResults.length?searchResults.map(t=><button key={t.id} disabled={!t.available} onClick={()=>{go(1);setSearchOpen(false)}}><strong>{t.name}</strong><span>{t.module} · {t.available?'Open lesson':'Planned'}</span></button>):<p>No matching topics</p>}</div></div></div>}
 </div>
}
export default App
