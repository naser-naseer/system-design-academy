import type { LessonStep, SceneNode, SceneEdge } from './lessons.ts'
import type { TimelineDefinition, TimelineAction } from '../scene-engine/timeline'

type Kind = SceneNode['kind']
type Category = LessonStep['category']
const node=(id:string,label:string,kind:Kind,x:number,y:number):SceneNode=>({id,label,kind,x,y})
const edge=(...pairs:[string,string][]):SceneEdge[]=>pairs.map(([from,to])=>({from,to}))
const base=(id:string,title:string,category:Category,body:string,takeaway:string,nodes:SceneNode[],edges:SceneEdge[],activeEdge?:number,metric?:string):LessonStep=>({id,title,category,body,takeaway,nodes,edges,activeEdge,metric})
const action=(id:string,type:TimelineAction['type'],atMs:number,details:Partial<TimelineAction>):TimelineAction=>({id,type,atMs,...details})
const packet=(id:string,atMs:number,edgeIndex:number,kind: 'request'|'response'|'retry'|'error'='request',durationMs=900)=>action(id,'packet',atMs,{edgeIndex,kind,durationMs})
const status=(id:string,atMs:number,nodeId:string,value:'idle'|'active'|'busy'|'failed'|'healthy')=>action(id,'status',atMs,{nodeId,status:value})
const timeline=(actions:TimelineAction[],durationMs=4600):TimelineDefinition=>({durationMs,loop:true,actions})
const scene=(step:LessonStep, actions:TimelineAction[]):LessonStep=>({...step,timeline:timeline(actions)})

const browser=node('browser','Browser','client',100,147)
const dns=node('dns','DNS Resolver','service',306,65)
const edgeServer=node('edge','CDN / Edge','gateway',306,215)
const gateway=node('gateway','API Gateway','gateway',506,147)
const app=node('app','Application','service',705,147)
const observability=node('obs','Telemetry','monitor',705,8)
const requestNodes=[browser,dns,edgeServer,gateway,app,observability]
const requestEdges=edge(['browser','dns'],['browser','edge'],['edge','gateway'],['gateway','app'],['app','obs'])
export const requestSteps:LessonStep[]=[
 scene(base('request-01','A user enters a URL','setup','A page load is not a single network hop. The browser resolves a hostname, negotiates a secure connection, sends an HTTP request and receives a response. Follow those distinct stages before measuring performance.','Describe the full request lifecycle, not only the backend.',[browser,dns,edgeServer],edge(['browser','dns'],['browser','edge']),0),[packet('dns-query',250,0),packet('page-request',1750,1)]),
 scene(base('request-02','DNS chooses a destination','technique','DNS maps a hostname to a destination record, often behind a managed traffic or CDN layer. Client and resolver caches affect lookup timing. DNS is not an HTTP load balancer and record changes are not instantaneous.','Separate name resolution from application routing.',[browser,dns,edgeServer],edge(['browser','dns'],['browser','edge']),0),[status('resolve',700,'dns','busy'),packet('lookup',950,0),status('cached',2200,'dns','healthy'),packet('connect',2600,1)]),
 scene(base('request-03','Connection and TLS handshake','technique','The client establishes a transport connection and negotiates TLS with the endpoint. Certificate validation, connection reuse, latency and redirects influence the journey. The edge may terminate TLS before communicating with origin.','Identify where encryption terminates and whether upstream traffic remains protected.',[browser,edgeServer,gateway],edge(['browser','edge'],['edge','gateway']),0),[packet('handshake',500,0),status('tls-ready',1700,'edge','healthy'),packet('origin',2300,1)]),
 scene(base('request-04','The gateway routes to a service','technique','Once the request reaches the gateway, host/path rules, authentication, rate limits and timeouts affect its route. A healthy gateway does not guarantee a healthy application dependency.','Trace the request across each explicit service boundary.',requestNodes,requestEdges,3),[packet('edge-gateway',300,2),packet('gateway-app',1550,3),status('serve',2700,'app','busy'),packet('telemetry',3050,4)]),
 scene(base('request-05','Measure the critical path','insight','Capture DNS lookup, TCP/TLS connect, time to first byte and complete response timing. Correlate client trace identifiers with gateway and service spans. Distinguish high tail latency from average response time.','Measure per-hop latency before optimizing a component.',requestNodes,requestEdges,4,'Illustrative budget: DNS 20 ms + connection 50 ms + backend 80 ms; not production measurements'),[status('busy-app',800,'app','busy'),packet('service-span',950,4),status('span-ok',2200,'obs','healthy')]),
 scene(base('request-06','Failure and recovery recap','recap','A stale DNS answer, unavailable edge, gateway timeout or saturated application may produce similar user symptoms. Use traces, logs and metrics to isolate the failing hop, and apply retries only where they are safe.','Design observability around the end-to-end journey.',requestNodes,requestEdges,3),[status('app-failed',800,'app','failed'),packet('failed-call',1050,3,'error'),status('app-recovered',3000,'app','healthy')]),
]

const user=node('user','Clients','client',93,151)
const lb=node('lb','Load Balancer','gateway',294,151)
const svcA=node('svcA','App A','service',508,61)
const svcB=node('svcB','App B','service',508,147)
const svcC=node('svcC','App C','service',508,233)
const health=node('health','Health Checks','monitor',731,151)
const lbNodes=[user,lb,svcA,svcB,svcC,health]
const lbEdges=edge(['user','lb'],['lb','svcA'],['lb','svcB'],['lb','svcC'],['health','lb'])
export const loadBalancingSteps:LessonStep[]=[
 scene(base('lb-01','Why load balancing exists','setup','A single application instance caps throughput and creates one failure domain. A load balancer presents a stable entry point and distributes requests across healthy targets. It is not a replacement for backend capacity planning.','Scale capacity and remove unnecessary single-instance dependencies.',[user,lb,svcA,svcB,svcC],lbEdges.slice(0,4),0),[packet('client',300,0),packet('to-a',1650,1)]),
 scene(base('lb-02','Algorithms are trade-offs','technique','Round robin is simple when request costs are similar. Least-connections can help with uneven connection lifetimes but does not always reflect per-request load. Weighted policies account for different capacities.','Match the scheduling algorithm to observed workload characteristics.',lbNodes,lbEdges,1),[packet('first',250,1),packet('second',1450,2),packet('third',2700,3)]),
 scene(base('lb-03','Health checks prevent bad routing','technique','Health checks identify targets that should stop receiving new traffic. A TCP accept check proves less than an end-to-end readiness endpoint. Use thresholds and cooldowns to avoid flapping.','Separate process liveness from application readiness.',lbNodes,lbEdges,4),[packet('probe',200,4),status('b-fail',1200,'svcB','failed'),status('a-ok',1800,'svcA','healthy'),status('b-ok',3350,'svcB','healthy')]),
 scene(base('lb-04','Fail traffic away from a target','solution','When App B fails, the load balancer must stop selecting it after health detection. Existing sessions may still fail. Clients need bounded timeouts, and connection draining should protect in-flight work during planned deployments.','Failover is a timed operational process, not an instantaneous guarantee.',lbNodes,lbEdges,2),[status('b-busy',400,'svcB','busy'),status('b-failed',1050,'svcB','failed'),packet('reroute',1600,1,'retry'),status('b-healthy',3500,'svcB','healthy')]),
 scene(base('lb-05','Avoid overload and hidden SPOFs','tradeoff','A front-end VIP is only resilient if the balancing tier itself is redundant. Add connection limits, autoscaling signals and sensible queueing policies; avoid routing too much traffic to slow instances.','Capacity, failure handling and load balancing must be designed together.',lbNodes,lbEdges,3,'Illustrative: three equally sized targets, not measured throughput'),[status('c-busy',400,'svcC','busy'),packet('overflow',1300,3),status('a-busy',2300,'svcA','busy'),status('c-ok',3500,'svcC','healthy')]),
 scene(base('lb-06','Production validation checklist','recap','Load-test uneven request sizes, simulate target failure, inspect error rates during draining and verify recovery. Monitor per-target connections, queue time, health-check transitions and tail latency.','A successful health check is necessary but not sufficient for healthy traffic.',lbNodes,lbEdges,4),[packet('health-probe',250,4),status('targets-ok',1700,'svcA','healthy'),status('targets-ok2',1900,'svcB','healthy'),status('targets-ok3',2100,'svcC','healthy')]),
]

const viewer=node('viewer','Viewer','client',94,148)
const api=node('api','API Service','service',300,148)
const cache=node('cache','Redis Cache','cache',516,77)
const database=node('db','Database','database',724,148)
const worker=node('worker','Refresh Worker','component',516,234)
const cacheNodes=[viewer,api,cache,database,worker]
const cacheEdges=edge(['viewer','api'],['api','cache'],['api','db'],['db','cache'],['worker','db'])
export const cachingSteps:LessonStep[]=[
 scene(base('cache-01','Why cache reads','setup','Popular reads repeatedly query the same data. A cache keeps frequently used results closer to the application, lowering latency and reducing primary database load. A cache adds another stateful system to operate.','Cache the costly and frequently reused work, not every response.',cacheNodes,cacheEdges,1),[packet('request',250,0),packet('lookup',1550,1)]),
 scene(base('cache-02','Cache hit','technique','On a hit, the API reads a valid cached value and responds without consulting the database. Measure hit ratio, item age and actual latency savings across cold and warm traffic; a high hit ratio alone does not prove user benefit.','Keep hit-path semantics and expiration explicit.',cacheNodes,cacheEdges,1),[packet('client',250,0),status('cache-busy',900,'cache','busy'),packet('hit',1150,1),status('cache-ok',2800,'cache','healthy')]),
 scene(base('cache-03','Cache miss and fill','technique','On a miss, the application queries the authoritative database, validates the result and populates the cache with a finite TTL. Handle absent results carefully; negative caching can reduce repeated bad requests.','Define who owns the authoritative record and how cache entries are filled.',cacheNodes,cacheEdges,2),[packet('miss',200,1),packet('database-read',1600,2),packet('fill',2900,3,'response')]),
 scene(base('cache-04','Invalidation and stale data','problem','A database update can leave an old cache value behind. TTL expiry bounds staleness only approximately. Invalidation, versioned keys, write-through and event-driven refresh have different failure modes.','Freshness requirements determine the invalidation policy.',cacheNodes,cacheEdges,3),[status('stale',500,'cache','failed'),packet('new-value',1300,3),status('fresh',3000,'cache','healthy')]),
 scene(base('cache-05','Stampedes, hot keys and outages','tradeoff','Many concurrent misses for one hot key can overwhelm the database. Consider request coalescing, jittered TTLs, stale-while-revalidate and hot-key detection. An unavailable cache must not cause unbounded origin traffic.','Protect the origin during both expiry and cache failure.',cacheNodes,cacheEdges,2),[status('cache-fail',450,'cache','failed'),status('db-busy',1100,'db','busy'),packet('fallback',1350,2,'retry'),status('cache-recovers',3400,'cache','healthy')]),
 scene(base('cache-06','Operational recap','recap','Track cache hit/miss rate, evictions, memory pressure, key cardinality, latency and database fallback volume. Test cold starts, invalidation races and abrupt cache loss under production-like request rates.','A reliable cache strategy includes a controlled miss path.',cacheNodes,cacheEdges,4),[packet('refresh',300,4),packet('cache-fill',1800,3,'response'),status('filled',3200,'cache','healthy')]),
]

const producer=node('producer','Producer','service',88,145)
const broker=node('broker','Message Broker','gateway',302,145)
const consumerA=node('consumerA','Worker A','component',519,73)
const consumerB=node('consumerB','Worker B','component',519,220)
const store=node('store','Database','database',734,145)
const queueNodes=[producer,broker,consumerA,consumerB,store]
const queueEdges=edge(['producer','broker'],['broker','consumerA'],['broker','consumerB'],['consumerA','store'],['consumerB','store'])
export const queueSteps:LessonStep[]=[
 scene(base('queue-01','Why decouple work','setup','An API can publish an event or job instead of waiting for downstream processing. A durable broker buffers work and lets consumers scale independently, but end-to-end completion is now asynchronous.','Define the acknowledgment boundary between accepting and completing work.',queueNodes,queueEdges,0),[packet('publish',350,0),packet('consume',1800,1)]),
 scene(base('queue-02','Produce, persist and consume','technique','A producer publishes a message with a key, payload and correlation ID. The broker persists or forwards it according to configured durability guarantees. A consumer processes the message and acknowledges success.','Understand what publish success and consumer acknowledgment actually guarantee.',queueNodes,queueEdges,1),[packet('producer',200,0),packet('worker',1500,1),packet('commit',2800,3)]),
 scene(base('queue-03','Scale consumers without losing control','technique','Additional consumers can raise throughput when partitions or queue semantics permit parallelism. Prefetch, concurrency and ordering rules determine the effective ceiling. Capacity should follow queue age and service time.','Scaling workers does not automatically preserve global ordering.',queueNodes,queueEdges,2),[packet('worker-a',350,1),packet('worker-b',1200,2),packet('save-a',2550,3),packet('save-b',3200,4)]),
 scene(base('queue-04','Retries and poison messages','problem','A failed consumer should not acknowledge unprocessed work. Retries require backoff and a maximum attempt policy; poison messages should reach a dead-letter queue for inspection rather than blocking progress indefinitely.','Make retries finite, observable and safe for downstream dependencies.',queueNodes,queueEdges,1),[status('worker-failure',650,'consumerA','failed'),packet('retry',1750,2,'retry'),status('recovered',3250,'consumerA','healthy')]),
 scene(base('queue-05','At-least-once requires idempotency','tradeoff','Redelivery can happen after a worker commits the database change but before its acknowledgment is recorded. Use idempotency keys, unique constraints or a deduplication record; exactly-once effects require carefully defined boundaries.','Assume duplicate delivery unless your end-to-end design proves otherwise.',queueNodes,queueEdges,3),[packet('write',300,3),status('busy',1550,'store','busy'),packet('redeliver',2100,3,'retry'),status('done',3500,'store','healthy')]),
 scene(base('queue-06','Monitor the backlog','recap','Track ready/in-flight messages, oldest-message age, consumer count, processing rate, failed attempts and dead-letter volume. Alert on sustained backlog growth alongside real downstream success rates.','A queue with zero consumers is a capacity or availability incident, not a healthy buffer.',queueNodes,queueEdges,2,'Illustrative queue backlog only; no live messaging metrics connected'),[status('workers-down',450,'consumerA','failed'),status('workers-down2',550,'consumerB','failed'),status('worker-back',2600,'consumerB','healthy'),packet('drain',3100,2)]),
]
