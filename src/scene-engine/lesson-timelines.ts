import type { TimelineDefinition } from './timeline.ts'

/** Original examples demonstrating data-driven animations in the HLD/LLD lesson.
 * Existing lesson text and the 39 planned topics are unchanged. */
export const hldLldTimelines: Readonly<Record<string, TimelineDefinition>> = {
  'step-03': {
    durationMs: 3700, loop: true,
    actions: [
      {id:'show-api',type:'appear',nodeId:'api',atMs:150,durationMs:350},
      {id:'show-service',type:'appear',nodeId:'service',atMs:480,durationMs:350},
      {id:'show-cache',type:'appear',nodeId:'cache',atMs:800,durationMs:350},
      {id:'show-db',type:'appear',nodeId:'db',atMs:1100,durationMs:350},
      {id:'request-cache',type:'packet',edgeIndex:2,atMs:1500,durationMs:1200,kind:'request'},
    ],
  },
  'step-04': {
    durationMs: 4800, loop: true,
    actions: [
      {id:'client-to-gateway',type:'packet',edgeIndex:0,atMs:100,durationMs:850},
      {id:'gateway-to-service',type:'packet',edgeIndex:1,atMs:1050,durationMs:850},
      {id:'service-to-cache',type:'packet',edgeIndex:2,atMs:2000,durationMs:850},
      {id:'service-to-db',type:'packet',edgeIndex:3,atMs:3000,durationMs:1100,kind:'retry'},
    ],
  },
  'step-05': {
    durationMs: 4200, loop: true,
    actions: [
      {id:'db-busy',type:'status',nodeId:'db',status:'busy',atMs:400},
      {id:'db-highlight',type:'highlight',nodeId:'db',enabled:true,atMs:400},
      {id:'db-failed',type:'status',nodeId:'db',status:'failed',atMs:1600},
      {id:'failed-path',type:'packet',edgeIndex:3,kind:'error',atMs:1700,durationMs:900},
      {id:'db-restored',type:'status',nodeId:'db',status:'healthy',atMs:2800},
      {id:'db-unhighlight',type:'highlight',nodeId:'db',enabled:false,atMs:3000},
    ],
  },
  'step-07': {
    durationMs: 4100, loop: true,
    actions: [
      {id:'show-validation',type:'appear',nodeId:'validation',atMs:200,durationMs:400},
      {id:'show-generator',type:'appear',nodeId:'generator',atMs:650,durationMs:400},
      {id:'show-repository',type:'appear',nodeId:'repository',atMs:1100,durationMs:400},
      {id:'show-storage',type:'appear',nodeId:'storage',atMs:1550,durationMs:400},
      {id:'walk-flow',type:'packet',edgeIndex:1,atMs:2400,durationMs:1200},
    ],
  },
  'step-09': {
    durationMs: 3200, loop: true,
    actions: [
      {id:'db-write',type:'packet',edgeIndex:3,atMs:250,durationMs:1150},
      {id:'db-active',type:'status',nodeId:'storage',status:'busy',atMs:450},
      {id:'db-healthy',type:'status',nodeId:'storage',status:'healthy',atMs:1500},
      {id:'db-highlight',type:'highlight',nodeId:'storage',enabled:true,atMs:1500},
      {id:'db-highlight-off',type:'highlight',nodeId:'storage',enabled:false,atMs:2400},
    ],
  },
}
