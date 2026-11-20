export interface SceneNode { id: string; label: string; kind: 'client'|'gateway'|'service'|'cache'|'database'|'component'|'monitor'; x: number; y: number; status?: 'active'|'idle'|'failed' }
export interface SceneEdge { from: string; to: string; label?: string }
export interface LessonStep { id: string; title: string; category: 'setup'|'problem'|'technique'|'solution'|'insight'|'tradeoff'|'recap'; body: string; takeaway: string; nodes: SceneNode[]; edges: SceneEdge[]; activeEdge?: number; metric?: string }
export interface Topic { id: string; name: string; available: boolean }
export interface Module { id: string; title: string; topics: Topic[] }
const topics = (items: string) => items.split('|').map((name, i) => ({id: name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),name,available:false,index:i}));
export const modules: Module[] = [
 {id:'foundations',title:'Foundations',topics:topics('Journey of a Request|Latency & Throughput|Back-of-the-Envelope Estimation')},
 {id:'scaling',title:'Scaling',topics:topics('Vertical vs Horizontal Scaling|Load Balancing|Stateless Services|Caching|Content Delivery Networks')},
 {id:'data',title:'Data & Storage',topics:topics('SQL vs NoSQL|Database Indexes|Storage Engines|Replication|Sharding|Consistent Hashing|Unique IDs at Scale|CAP & Consistency|Consensus & Leaders|Transactions & Isolation|Files & Media')},
 {id:'communication',title:'Communication',topics:topics('REST vs RPC vs GraphQL|Message Queues|Pub/Sub & Events|Real-Time Updates')},
 {id:'reliability',title:'Reliability',topics:topics('Redundancy & Failover|Rate Limiting|Timeouts & Retries|Observability')},
 {id:'architecture',title:'Architecture',topics:topics('Monolith vs Microservices|Service Discovery|Sagas & Distributed Transactions|Batch vs Stream Processing')},
 {id:'security',title:'Security',topics:topics('Authentication|Authorization|Encryption & Secrets')},
 {id:'shipping',title:'Shipping',topics:topics('Testing|CI/CD & Deployment')},
 {id:'whole',title:'Whole Systems',topics:[{id:'hld-lld',name:'HLD vs LLD',available:true},...topics('Design a URL Shortener|Design a News Feed|Design a Chat System')]},
]
const client: SceneNode={id:'client',label:'Browser',kind:'client',x:100,y:135};
const api: SceneNode={id:'api',label:'API Gateway',kind:'gateway',x:305,y:135};
const service: SceneNode={id:'service',label:'URL Service',kind:'service',x:510,y:135};
const db: SceneNode={id:'db',label:'Primary DB',kind:'database',x:715,y:220};
const cache: SceneNode={id:'cache',label:'Redis Cache',kind:'cache',x:715,y:62};
const edge=(...xs:[string,string][]):SceneEdge[]=>xs.map(([from,to])=>({from,to}));
const base=[client,api,service];
const full=[client,api,service,cache,db];
const fullEdges=edge(['client','api'],['api','service'],['service','cache'],['service','db']);
const inner:SceneNode[]=[
 {id:'handler',label:'Route Handler',kind:'component',x:90,y:135},
 {id:'validation',label:'Validation',kind:'component',x:245,y:135},
 {id:'generator',label:'Code Generator',kind:'component',x:410,y:135},
 {id:'repository',label:'Repository',kind:'component',x:575,y:135},
 {id:'storage',label:'Database',kind:'database',x:735,y:135},
];
const innerEdges=edge(['handler','validation'],['validation','generator'],['generator','repository'],['repository','storage']);
export const hldLldSteps:LessonStep[]=[
 {id:'step-01',title:'A product request',category:'setup',body:'Imagine a URL shortener: a user submits a long URL, receives a short link, and later visitors are redirected to the original address. Before implementation, clarify required traffic, availability and correctness.',takeaway:'Start with the user journey and constraints.',nodes:[client,service],edges:edge(['client','service']),activeEdge:0,metric:'Example workload: 1 million redirects/day (illustrative)'},
 {id:'step-02',title:'“Build the backend” is ambiguous',category:'problem',body:'A single service box hides important decisions: how traffic enters, where data lives, and what happens when an instance fails. A vague architecture cannot guide deployment or risk review.',takeaway:'Expose boundaries before details.',nodes:base,edges:edge(['client','api'],['api','service']),activeEdge:1},
 {id:'step-03',title:'High-Level Design',category:'technique',body:'HLD identifies major services, boundaries and dependencies. Here the gateway receives requests, the URL service applies business logic, a cache accelerates popular lookups and persistent storage holds mappings.',takeaway:'HLD answers what parts exist and how they connect.',nodes:full,edges:fullEdges,activeEdge:2},
 {id:'step-04',title:'Follow the request path',category:'technique',body:'A browser calls the public endpoint; the gateway forwards it to the service. The service tries a cache, then reads the authoritative database on a miss. The response travels back to the client.',takeaway:'Trace traffic in both directions during design reviews.',nodes:full,edges:fullEdges,activeEdge:0},
 {id:'step-05',title:'Non-functional requirements matter',category:'insight',body:'Latency targets, request bursts, data durability and availability influence where caching, replication and redundancy belong. Record assumptions and distinguish illustrative figures from measurements.',takeaway:'Architecture decisions must follow explicit constraints.',nodes:full,edges:fullEdges,activeEdge:3,metric:'Illustrative target: p95 redirects < 150 ms'},
 {id:'step-06',title:'HLD is not executable detail',category:'problem',body:'The URL Service box still hides how IDs are produced, validated and stored. Engineers cannot reliably implement collision handling, response contracts or idempotency from this box alone.',takeaway:'Zoom into one service when implementation decisions are needed.',nodes:[service],edges:[]},
 {id:'step-07',title:'Low-Level Design',category:'technique',body:'LLD describes a component’s internal responsibilities: route handlers, validation, code generation, repository interfaces and persistence. It makes behavior testable and reviewable.',takeaway:'LLD answers how a component works internally.',nodes:inner,edges:innerEdges,activeEdge:1},
 {id:'step-08',title:'Trace an implementation flow',category:'technique',body:'For POST /shorten: validate input, generate a candidate short code, store it with a uniqueness guarantee, and return a stable API response. Failed validation and collisions require defined outcomes.',takeaway:'Describe both success paths and failure branches.',nodes:inner,edges:innerEdges,activeEdge:2},
 {id:'step-09',title:'Define contracts and data',category:'solution',body:'Example schema: urls(code UNIQUE, destination, created_at, expiry_at). Specify POST /shorten and GET /:code contracts, input limits, expected status codes and transactional uniqueness checks.',takeaway:'Make interface, data and error semantics unambiguous.',nodes:inner,edges:innerEdges,activeEdge:3},
 {id:'step-10',title:'Make trade-offs explicit',category:'tradeoff',body:'A sequential ID is simple but may reveal volume; random IDs reduce predictability but need collision handling. Cache improves common reads but requires expiration strategy. Document the decision and assumptions.',takeaway:'Choices always come with costs and failure modes.',nodes:inner,edges:innerEdges,activeEdge:1},
 {id:'step-11',title:'Connect the two levels',category:'insight',body:'The service in HLD is the boundary that contains the LLD components. Public APIs, data ownership, availability objectives and deployment assumptions must agree across both views.',takeaway:'HLD and LLD are complementary, not competing diagrams.',nodes:full,edges:fullEdges,activeEdge:1},
 {id:'step-12',title:'Recap: architecture to implementation',category:'recap',body:'HLD: components, dependencies, scaling and failure domains. LLD: handlers, data structures, API contracts and edge cases. Validate HLD against requirements, then validate LLD against component behavior.',takeaway:'Choose the level of detail appropriate to the decision.',nodes:full,edges:fullEdges},
]
export const isValidStep=(value:number)=>Number.isInteger(value)&&value>=1&&value<=hldLldSteps.length;
export function parseRoute(hash:string):{view:'home'|'lesson'|'not-found';step:number}{
 const path=hash.replace(/^#\/?/,'').replace(/\/$/,'');
 if (!path) return {view:'home',step:1};
 const m=path.match(/^hld-lld\/(\d+)$/);
 if(m && isValidStep(Number(m[1])))return {view:'lesson',step:Number(m[1])};
 return {view:'not-found',step:1};
}
