import { hldLldSteps, modules } from './lessons.ts'
import type { LessonStep } from './lessons.ts'
import { requestSteps, loadBalancingSteps, cachingSteps, queueSteps } from './phase6-lessons.ts'

export interface Lesson { id: string; moduleId: string; topicId: string; title: string; subtitle: string; steps: LessonStep[] }
export const lessons: Lesson[] = [
  { id:'hld-lld', moduleId:'whole', topicId:'hld-lld', title:'High-Level Design vs. Low-Level Design', subtitle:'Translate architecture decisions into implementable components.', steps:hldLldSteps },
  { id:'journey-of-a-request', moduleId:'foundations', topicId:'journey-of-a-request', title:'Journey of a Request', subtitle:'Trace DNS, TLS, routing, services and observability along a user request.', steps:requestSteps },
  { id:'load-balancing', moduleId:'scaling', topicId:'load-balancing', title:'Load Balancing', subtitle:'Distribute traffic, isolate failures and protect upstream capacity.', steps:loadBalancingSteps },
  { id:'caching', moduleId:'scaling', topicId:'caching', title:'Caching', subtitle:'Understand cache hits, misses, invalidation and stampede prevention.', steps:cachingSteps },
  { id:'message-queues', moduleId:'communication', topicId:'message-queues', title:'Message Queues', subtitle:'Design reliable asynchronous handoffs, retries and dead-letter handling.', steps:queueSteps },
]
export const lessonById = new Map(lessons.map(lesson=>[lesson.id, lesson]))
export const availableTopicIds = new Set(lessons.map(lesson=>lesson.topicId))
export const curriculumModules = modules.map(module=>({
  ...module,
  topics:module.topics.map(topic=>({...topic,available:availableTopicIds.has(topic.id)})),
}))
export type AcademyRoute = {view:'home'|'lesson'|'not-found'; lessonId:string; step:number}
export function parseAcademyRoute(hash:string): AcademyRoute {
  const path=hash.replace(/^#\/?/,'').replace(/\/$/,'')
  if(!path)return {view:'home',lessonId:'hld-lld',step:1}
  // Preserve the original published HLD/LLD deep links.
  const match=/^([a-z0-9-]+)\/(\d+)$/.exec(path)
  if(!match)return {view:'not-found',lessonId:'hld-lld',step:1}
  const lesson=lessonById.get(match[1])
  const step=Number(match[2])
  if(!lesson || !Number.isSafeInteger(step) || step<1 || step>lesson.steps.length)
    return {view:'not-found',lessonId:'hld-lld',step:1}
  return {view:'lesson',lessonId:lesson.id,step}
}
