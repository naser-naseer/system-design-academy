import type { SceneNode, SceneEdge, LessonStep } from './lessons.ts'
import type { TimelineAction, TimelineDefinition } from '../scene-engine/timeline.ts'

/** Authored learning scenarios; reference-inspired visual composition, not copied text or assets. */
const node = (id: string, label: string, kind: SceneNode['kind'], x: number, y: number): SceneNode => ({id,label,kind,x,y})
const edge = (...pairs: [string,string][]): SceneEdge[] => pairs.map(([from,to]) => ({from,to}))

const customers = node('customers','Customers','client',110,425)
const gateway = node('gateway','API Gateway','gateway',276,348)
const orders = node('orders','Orders','service',371,172)
const couriers = node('couriers','Couriers','service',524,279)
const payments = node('payments','Payments','service',676,370)
const ordersDb = node('orders-db','orders SQL','database',560,112)
const locations = node('locations','location KV','cache',738,191)
const paymentDb = node('payment-db','payments SQL','database',807,284)
const whole = [customers,gateway,orders,couriers,payments,ordersDb,locations,paymentDb]
const wholeEdges = edge(
  ['customers','gateway'],['gateway','orders'],['gateway','couriers'],
  ['orders','couriers'],['orders','orders-db'],['couriers','locations'],
  ['couriers','payments'],['payments','payment-db'],
)

const api = node('api','API Gateway','gateway',126,357)
const controller = node('controller','Controller','component',296,342)
const orderSvc = node('order-service','Order Service','service',444,254)
const repository = node('repository','Repository','component',571,155)
const db = node('order-table','Orders Table','database',742,117)
const paymentClient = node('payment-client','Payment Client','component',710,362)
const validation = node('validation','Validator','component',315,155)
const inside = [api,controller,validation,orderSvc,repository,db,paymentClient]
const insideEdges = edge(
  ['api','controller'],['controller','validation'],['validation','order-service'],
  ['controller','order-service'],['order-service','repository'],
  ['repository','order-table'],['order-service','payment-client'],
)

const packet = (id: string, atMs: number, edgeIndex: number, kind: 'request'|'response'|'retry'|'error'='request', durationMs=850):TimelineAction => ({id,type:'packet',atMs,edgeIndex,kind,durationMs})
const status = (id: string, atMs: number, nodeId: string, state: 'busy'|'failed'|'healthy'|'active'):TimelineAction => ({id,type:'status',atMs,nodeId,status:state})
const emphasis = (id: string, atMs: number, nodeId: string):TimelineAction => ({id,type:'highlight',atMs,nodeId,enabled:true})
const makeTimeline=(actions:TimelineAction[],durationMs=5400):TimelineDefinition=>({durationMs,loop:true,actions})
const visual=(stepLabel:string,zoomLevel:string,buildingBlocks:string,deliverable:string,changes:string[],outcome:string)=>({stepLabel,zoomLevel,buildingBlocks,deliverable,changes,outcome})
function lesson(id:string,title:string,category:LessonStep['category'],body:string,takeaway:string,
  nodes:SceneNode[],edges:SceneEdge[],activeEdge:number|undefined,timeline:TimelineDefinition,view:ReturnType<typeof visual>,metric?:string):LessonStep{
  return {id,title,category,body,takeaway,nodes,edges,activeEdge,timeline,visual:view,metric}
}

/** 8-step, reference-proportioned teaching example. Every step has independent original prose. */
export const commerceHldLldSteps:LessonStep[] = [
  lesson('commerce-01','One product, two design views','setup',
    'Imagine a delivery platform with ordering, couriers, payments and persistent stores. The high-level view explains service ownership and communication. The low-level view explains the behavior inside one service. Both are needed to deploy safely.',
    'System boundaries describe responsibilities; component designs make those responsibilities executable.',
    whole,wholeEdges,0,makeTimeline([packet('order-entry',250,0),packet('route-order',1300,1),packet('order-record',2600,4),packet('ack',3700,3,'response')]),
    visual('Two views','Whole system','Services · stores · API','Architecture outline',['Map the user interaction','Identify independently operated services'],'Recognize the two levels of technical detail')),
  lesson('commerce-02','Draw the system map first','technique',
    'Begin with the customer entry point, an API gateway, service responsibilities and the data each service owns. Label synchronous calls differently from asynchronous notifications and call out which stores are authoritative.',
    'A useful HLD records ownership, traffic direction and failure boundaries—not only a collection of boxes.',
    whole,wholeEdges,2,makeTimeline([emphasis('highlight-gateway',200,'gateway'),packet('to-courier',650,2),packet('to-payment',1850,6),packet('location-read',2900,5,'response')]),
    visual('The map','Whole system','Gateways · services · databases','Dependency map',['Separate edge routing from business logic','Identify data ownership'],'Explain why each major component exists')),
  lesson('commerce-03','Decisions create trade-offs','tradeoff',
    'An order acknowledgement needs a predictable response, but courier allocation can be handled asynchronously. Payment writes demand stronger correctness guarantees than frequently refreshed courier locations. Each choice changes latency, failure handling and consistency.',
    'Architecture diagrams are decisions with consequences: explain why each edge and store exists.',
    whole,wholeEdges,3,makeTimeline([packet('order-to-courier',550,3),status('courier-busy',1450,'couriers','busy'),packet('payment-call',1950,6),status('courier-ready',3250,'couriers','healthy'),packet('location-update',3750,5,'response')]),
    visual('Trade-offs','Whole system','Sync calls · events · stores','Decision record',['Courier dispatch can use an event','Payment needs explicit write guarantees'],'Connect architecture choices to availability and correctness')),
  lesson('commerce-04','Zoom inside the order boundary','technique',
    'The order service contains smaller responsibilities. A controller validates the incoming contract, the domain component enforces state transitions, a repository persists data, and a payment client translates external failures into safe internal outcomes.',
    'Zoom in only where implementation detail is required; retain the larger service contract.',
    inside,insideEdges,3,makeTimeline([packet('request',350,0),packet('validate',1350,1),packet('logic',2500,3),packet('persist',3750,4)]),
    visual('Zoom in','One service','Controller · rules · repository','Class & sequence sketch',['One service becomes several components','Outside callers still see one API'],'Identify the seams that require unit and contract tests')),
  lesson('commerce-05','Specify failures and state changes','problem',
    'A successful order write is only one path. The implementation must also handle invalid input, duplicate requests, payment timeouts and repository unavailability. Add idempotency keys, safe retry decisions and observable failure states.',
    'Correctness depends on the exceptional paths as much as the happy path.',
    inside,insideEdges,6,makeTimeline([packet('payment-attempt',400,6),status('gateway-timeout',1500,'payment-client','failed'),packet('retry',2200,6,'retry'),status('recovered',3550,'payment-client','healthy')]),
    visual('Failure states','One service','Validation · state · retries','Error-state design',['Retries need idempotency','Remote timeouts do not imply rollback'],'Describe a recoverable failure without duplicate side effects')),
  lesson('commerce-06','Contracts connect both levels','solution',
    'Write a request/response contract with stable fields, status codes and ownership rules. The public endpoint might accept an order idempotency key; the repository guarantees uniqueness; the payment integration reports an explicit outcome. The external promise must match the internal state machine.',
    'An HLD dependency becomes reliable only when its LLD contract is precise.',
    inside,insideEdges,5,makeTimeline([packet('controller',450,0),packet('validate',1500,1),packet('write',2600,5),packet('reply',3900,3,'response')]),
    visual('Contracts','Service & interfaces','APIs · schemas · errors','Contract specification',['Record input and output schemas','Make failure semantics explicit'],'Translate a service boundary into a verifiable contract')),
  lesson('commerce-07','Avoid choosing the wrong zoom level','tradeoff',
    'Starting with class diagrams hides scaling and data ownership problems; stopping at a high-level map hides duplication and failure recovery. Move between views deliberately: review resilience at service level, then test detailed behavior within each boundary.',
    'Use the highest abstraction that answers the decision, and zoom in when it no longer does.',
    whole,wholeEdges,6,makeTimeline([emphasis('focus-payment',300,'payments'),status('payment-down',1350,'payments','failed'),packet('failed-call',2400,6,'error'),status('payment-up',3900,'payments','healthy')]),
    visual('Pick the level','Whole system','Boundaries · failure domains','Review checklist',['Architecture review locates risk','Component review validates behavior'],'Know when to switch between HLD and LLD')),
  lesson('commerce-08','Review the two views together','recap',
    'Finish by tracing one user request from entry through ownership boundaries and then inside the order service. Confirm that the API contract, data rules, retry policy and availability requirements agree. A diagram is useful when it improves decisions.',
    'HLD maps responsibilities; LLD makes each responsibility testable; production feedback keeps both accurate.',
    whole,wholeEdges,0,makeTimeline([packet('customer',350,0),packet('orders',1400,1),packet('notify',2600,3),packet('settle',3800,6)]),
    visual('Recap','Whole system','Architecture + implementation','Design review',['Trace one end-to-end journey','Reconcile reliability and data guarantees'],'Review architecture and implementation as one system')),
]
