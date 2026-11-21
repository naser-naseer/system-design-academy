import { useCallback, useEffect, useState } from 'react'
import { curriculumModules, lessonById, lessons, parseAcademyRoute } from './curriculum/catalog'
import { Scene } from './scene-engine/Scene'
import './App.css'
import './visual-system.css'

const themeKey = 'sda:theme:v1'
const progressKey = 'sda:progress:v2'
const legacyProgressKey = 'sda:progress:v1'
type Theme = 'light' | 'dark'
function storedTheme():Theme { try {return localStorage.getItem(themeKey)==='dark'?'dark':'light'} catch {return 'light'} }
function storedDone():string[] { try {
  const raw=JSON.parse(localStorage.getItem(progressKey) ?? '[]')
  if(Array.isArray(raw))return raw.filter((value):value is string=>typeof value==='string')
} catch {/* ignore invalid local storage */}
  try {return localStorage.getItem(legacyProgressKey)==='complete'?['hld-lld']:[]} catch {return []}
}
function currentRoute(){return parseAcademyRoute(location.hash)}
function App(){
  const [route,setRoute]=useState(currentRoute)
  const [theme,setTheme]=useState(storedTheme)
  const [completed,setCompleted]=useState(storedDone)
  const [playing,setPlaying]=useState(true)
  const [replayKey,setReplayKey]=useState(0)
  const [query,setQuery]=useState('')
  const [searchOpen,setSearchOpen]=useState(false)
  const lesson=lessonById.get(route.lessonId) ?? lessons[0]
  const step=lesson.steps[route.step-1] ?? lesson.steps[0]
  const go=useCallback((id:string,number=1)=>{location.hash=`/${id}/${number}`},[])
  useEffect(()=>{const update=()=>{setRoute(currentRoute());setPlaying(true)};window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update)},[])
  useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem(themeKey,theme)}catch{/* storage optional */}},[theme])
  useEffect(()=>{try{localStorage.setItem(progressKey,JSON.stringify(completed))}catch{/* storage optional */}},[completed])
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>{
    const target=event.target as HTMLElement|null
    // Browsers can reserve Ctrl+K. Slash is an additional in-page search shortcut.
    if (!searchOpen && event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey &&
        !target?.matches('input,textarea,select,[contenteditable="true"]')) {
      event.preventDefault()
      setSearchOpen(true)
      return
    }
    if(event.ctrlKey||event.metaKey){if(event.key.toLowerCase()==='k'){event.preventDefault();setSearchOpen(open=>!open)}return}
    if(searchOpen||target?.matches('input,textarea,select,[contenteditable="true"]')){
      if(event.key==='Escape')setSearchOpen(false)
      return
    }
    if(route.view!=='lesson')return
    if(event.key==='ArrowRight'&&route.step<lesson.steps.length){event.preventDefault();go(lesson.id,route.step+1)}
    if(event.key==='ArrowLeft'&&route.step>1){event.preventDefault();go(lesson.id,route.step-1)}
    if(event.key.toLowerCase()==='r'){setReplayKey(value=>value+1);setPlaying(true)}
    if(event.code==='Space'){event.preventDefault();setPlaying(value=>!value)}
  };window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[go,route,searchOpen,lesson])
  const searchResults=curriculumModules.flatMap(module=>module.topics.map(topic=>({...topic,module:module.title,lesson:lessons.find(item=>item.topicId===topic.id)})))
    .filter(topic=>`${topic.name} ${topic.module}`.toLowerCase().includes(query.toLowerCase())).slice(0,12)
  const totalTopics=curriculumModules.reduce((count,module)=>count+module.topics.length,0)
  const outcomeRows = lesson.id === 'hld-lld' ? [
    {label:'Understand system-level ownership',step:2},
    {label:'Explain architecture trade-offs',step:3},
    {label:'Specify component-level behavior',step:4},
    {label:'Reconcile contracts and failure modes',step:6},
  ] : lesson.steps.slice(0,4).map((part,index)=>({label:part.visual?.outcome ?? part.title,step:index+1}))
  function markCompleted(){setCompleted(previous=>previous.includes(lesson.id)?previous:[...previous,lesson.id])}
  return <div className="app-shell">
    <header className="topbar"><a href="#/" className="brand"><span className="brand-icon">◇</span><span>SYSTEM DESIGN <em>ACADEMY</em></span></a>
      <div className="top-links"><a href="#/">Curriculum</a><span title="Future release">Practice · soon</span><span title="Future release">Design Lab · soon</span></div>
      <div className="actions"><button className="search-trigger" aria-label="Search lessons" onClick={()=>setSearchOpen(true)}>⌕ <span>Search</span><kbd>Ctrl K</kbd></button>
      <button aria-label="Toggle theme" onClick={()=>setTheme(old=>old==='light'?'dark':'light')}>{theme==='light'?'☾':'☀'}</button></div>
    </header>
    <div className="layout"><aside className="sidebar"><div className="sidebar-head">THE CURRICULUM <span>{curriculumModules.length} MODULES · {totalTopics} TOPICS</span></div>
      <div className="module-list">{curriculumModules.map((module,index)=><details key={module.id} open={module.id===lesson.moduleId}>
        <summary><span className="module-number">{String(index+1).padStart(2,'0')}</span>{module.title}<span className="count">{module.topics.length}</span></summary>
        <div className="topic-list">{module.topics.map(topic=>{
          const item=lessons.find(entry=>entry.topicId===topic.id)
          return <button key={topic.id} disabled={!item} className={route.view==='lesson'&&item?.id===lesson.id?'active':''}
            title={item?undefined:'Content planned — not yet implemented'} onClick={()=>item&&go(item.id)}>
            {topic.name}{!item&&<small>Planned</small>}{item&&completed.includes(item.id)&&<span aria-label="Completed">✓</span>}
          </button>
        })}</div>
      </details>)}</div><div className="sidebar-bottom">{completed.length} of {lessons.length} available lessons completed<small>Progress is saved in this browser.</small></div>
    </aside>
    <main className="main-area">{route.view==='not-found'?<div className="welcome"><span className="eyebrow">ROUTE NOT FOUND</span><h1>That lesson step doesn't exist.</h1><p>Select a lesson from the curriculum.</p><a className="primary-link" href="#/">Back to curriculum</a></div>
    :route.view==='home'?<div className="welcome"><span className="eyebrow">INTERACTIVE SYSTEM DESIGN LEARNING LAB</span><h1>See how systems<br/><i>actually work.</i></h1><p>Learn infrastructure design through animated stories, architecture diagrams, failure scenarios and engineering trade-offs.</p>
      <div className="overview-stats"><div><strong>{String(curriculumModules.length).padStart(2,'0')}</strong><span>Modules mapped</span></div><div><strong>{totalTopics}</strong><span>Topics planned</span></div><div><strong>{String(lessons.length).padStart(2,'0')}</strong><span>Lessons available</span></div></div>
      <div className="lesson-catalog">{lessons.map(item=><button className="lesson-card" key={item.id} onClick={()=>go(item.id)}><strong>{item.title}</strong><span>{item.steps.length} interactive steps · {completed.includes(item.id)?'Completed':'Open lesson'}</span><small>{item.subtitle}</small></button>)}</div><p className="disclaimer">Early access · Additional topics will be released incrementally.</p>
    </div>:<>
      <div className="lesson-head"><div><span className="eyebrow">{lesson.moduleId.toUpperCase()} / LESSON  ·  {lesson.steps.length} STEPS</span><h1>{lesson.title}</h1><p>{lesson.subtitle}</p></div><span className="step-pill">STEP {String(route.step).padStart(2,'0')} / {lesson.steps.length}</span></div>
      <div className="player-grid"><div className="lesson-visual-column">
        <section className="canvas-panel" aria-label="Interactive architecture visualization">
          <div className="panel-top"><span>◈ ARCHITECTURE VISUALIZER</span><div className="panel-actions"><span className="live-dot">● {playing?'PLAYING':'PAUSED'}</span>
            <button aria-label="Replay animation" onClick={()=>{setReplayKey(value=>value+1);setPlaying(true)}}>↺ Replay</button>
            <button aria-label={playing?'Pause animation':'Play animation'} onClick={()=>setPlaying(value=>!value)}>{playing?'Ⅱ Pause':'▶ Play'}</button>
          </div></div>
          <Scene step={step} playing={playing} replayKey={replayKey}/>
        </section>
        <nav className="lesson-stepper" aria-label="Navigate lesson steps">
          <div className="lesson-stepper-head"><strong>IN THIS LESSON</strong><span>Step {route.step} of {lesson.steps.length}</span></div>
          <div className="lesson-stepper-track">{lesson.steps.map((part,index)=><button type="button" key={part.id}
            className={route.step===index+1?'current':route.step>index+1?'visited':''}
            aria-current={route.step===index+1?'step':undefined} onClick={()=>go(lesson.id,index+1)}>
            <span>{index+1}</span><small>{part.visual?.stepLabel ?? part.title}</small>
          </button>)}</div>
        </nav>
      </div>
        <div className="lesson-right-column"><article className="explanation"><div className="side-step">STEP {route.step} / {lesson.steps.length} <span className={`category ${step.category}`}>{step.category.toUpperCase()}</span></div>
          <h2>{step.title}</h2><p>{step.body}</p>
          {step.metric&&<div className="metric">{step.metric}<small>Illustrative example · not live metrics</small></div>}
          <div className="takeaway"><span>KEY IDEA</span><strong>{step.takeaway}</strong></div>
          {step.visual?.changes?.length ? <section className="step-changes" aria-label="What changed in this step">
            <h3>WHAT CHANGED</h3>
            {step.visual.changes.map((change,index)=><div key={index}><span>↝</span>{change}</div>)}
          </section> : null}
          {route.step===lesson.steps.length&&<button className="primary complete" onClick={markCompleted}>{completed.includes(lesson.id)?'✓ Lesson completed':'Mark lesson complete ✓'}</button>}
          <div className="side-spacer"/>
          <div className="side-actions"><button disabled={route.step===1} onClick={()=>go(lesson.id,route.step-1)}>← Back</button>
            <button className="next" disabled={route.step===lesson.steps.length} onClick={()=>go(lesson.id,route.step+1)}>Next step →</button></div>
          <div className="shortcuts">← → Navigate · Space Pause · R Replay</div>
        </article>
        <aside className="lesson-outcomes" aria-label="Learning outcomes">
          <div className="outcomes-header"><strong>YOU WILL LEARN</strong><span>{route.step} / {lesson.steps.length}</span></div>
          <div className="outcomes-list">
            {outcomeRows.map((item,index)=><button key={index} type="button" onClick={()=>go(lesson.id,item.step)} aria-pressed={route.step>=item.step}>
              <span className={route.step>=item.step?'outcome-done':'outcome-pending'} aria-hidden="true">{route.step>=item.step?'✓':''}</span>
              <span>{item.label}</span>
            </button>)}
          </div>
        </aside>
        </div></div>
    </>}</main></div>
    {searchOpen&&<div className="modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setSearchOpen(false)}}>
      <div className="search-dialog" role="dialog" aria-modal="true" aria-label="Search curriculum"><div className="search-input"><span>⌕</span><input autoFocus placeholder="Search topics and modules…" value={query} onChange={event=>setQuery(event.target.value)}
        onKeyDown={event=>{if(event.key==='Escape')setSearchOpen(false);if(event.key==='Enter'&&searchResults[0]?.lesson){go(searchResults[0].lesson.id);setSearchOpen(false)}}}/><button onClick={()=>setSearchOpen(false)}>Esc ✕</button></div>
        <div className="search-results">{searchResults.length?searchResults.map(result=><button key={`${result.module}-${result.id}`} disabled={!result.lesson} onClick={()=>{if(result.lesson){go(result.lesson.id);setSearchOpen(false)}}}>
          <strong>{result.name}</strong><span>{result.module} · {result.lesson?'Open lesson':'Planned'}</span></button>):<p>No matching topics</p>}</div></div>
    </div>}
  </div>
}
export default App
