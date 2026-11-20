# Designed to Scale — Product Discovery & Development Reference

**Version:** 1.0  
**Prepared:** 20 November 2026  
**Reference:** https://designed-to-scale.vercel.app/#/hld-lld/1  
**Document purpose:** Standalone, implementation-ready product discovery and requirements baseline for building an independently authored interactive system-design learning platform with comparable behavior.  
**Classification:** Research and product specification — **not** an extraction of the original source code, full text, or copyrighted assets.

---

## 0. READ THIS FIRST: Evidence, confidence, and limitations

This document distinguishes **observed/externally audited reference behavior** from **proposed implementation decisions**. The reference application is JavaScript-rendered, and basic HTTP/web rendering exposes only its fallback. We did **not** personally execute a complete browser walkthrough of all 445 steps in this session. A detailed **independent audit published 18 Nov 2026** reports a headless-browser visit, static analysis of the production JavaScript/CSS, and a complete course taxonomy. Its findings are valuable but should be treated as **secondary-source**, not independently reproduced evidence.

Evidence notation:
- **[S1]** Official app entry point, JS fallback: https://designed-to-scale.vercel.app/
- **[S2]** Independent deep technical investigation, 18 Nov 2026: https://lijianfei.com/post/designed-to-scale-isometric-svg-engine/
- **[S3]** Creator announcement, 16 Nov 2026: https://www.nitter.cf/DilumSanjaya/status/2122373063560110320
- **[S4]** Independent user report, 18 Nov 2026: https://xitter.cf/hqmank/status/2123037878607589780

Confidence levels: **A** directly visible in retrieved app/public creator statement; **B** third-party hands-on/static-analysis report; **C** reasoned product proposal; **U** unknown/unverified. In text, **REFERENCE (B)** means external-audit finding; **BUILD (C)** means our requirement, **NOT a claim about the existing product**.

**Key verification constraint:** No exact per-step narrative transcripts, screenshots for all scenes, timings for each animation, authoritative DOM component catalog, original translation files, or exact lesson-by-lesson route IDs have been independently captured here. These must not be represented as verified. This specification defines **functional equivalents** and a complete development approach, with explicit parity-verification gates.

**IP/rights:** Use independently written educational content and original graphics, design tokens, brand/name, code, animations and translations unless the original owner authorizes reuse. Inspiration and functional comparison do not imply licensing. Do not deploy a misleading clone under the original brand.

---

## 1. Executive brief

### 1.1 What the product is

A browser-first, interactive learning platform for system architecture. A user selects a topic, advances through animated diagrams, observes architecture transitions and illustrative metrics, reads concise explanations, and records completed lessons locally. The platform favors dynamic, visual instruction over slides or static architecture pictures.

### 1.2 Reference snapshot

| Attribute | Audit-based reference finding | Confidence |
|---|---|---|
| Course | 9 modules / 40 lessons / 445 lesson steps | B [S2] |
| Content | System-design foundations through whole-system architecture | B [S2] |
| Player | Next/previous steps, pause, replay, data-packet animations | B [S2], [S4] |
| Diagram | Custom 2.5D isometric SVG scene engine | B [S2] |
| Search | Client-side weighted term/lesson/diagram search; `Ctrl/Cmd+K` | B [S2] |
| Localization | 21 languages including RTL support | B [S2] |
| Progress | Local browser storage; `sdt:done`, `sdt:last` reported | B [S2] |
| Theme | Warm paper/light, dark palette | B [S2] |
| Navigation | Practice, Design Lab, Cheatsheets labeled coming soon | B [S2] |
| Accounts/backend | No backend accounts needed for current core experience | B [S2] |
| Read-aloud | In bundle behind disabled feature flag, not live | B [S2] |
| Technology (original) | Reported vanilla ES modules, SVG, Vite/LightningCSS | B [S2] |

### 1.3 Business goals

- **BG-01** Teach architecture concepts through contextual visual stories.
- **BG-02** Make lessons discoverable, revisitable and self-paced.
- **BG-03** Build one reusable visualization/player engine rather than 40 hardcoded interactive pages.
- **BG-04** Support browser-local progress, international audiences and accessible input.
- **BG-05** Make content authoring, editorial review, and expansion sustainable.
- **BG-06** Reserve a clean expansion path for exercises, a diagram design lab and reference sheets; do **not** accidentally include these in parity MVP.

### 1.4 Stakeholders and personas

| Persona | Job to be done | Product need |
|---|---|---|
| Student / interview candidate | Understand concepts quickly | Structured modules, diagrams, recap |
| Backend engineer | Compare design approaches | Technical fidelity, capacity/latency trade-offs |
| SRE / platform engineer | Understand failure and scaling | Animated error paths, retries, failover, observability |
| Instructor / team lead | Explain architectural progression | Step-by-step teaching mode, usable on big screen |
| Content author (future) | Add correct lessons safely | Declarative scene and step schema, validation |
| Product maintainer | Release stable updates | Tests, content versioning, monitoring |

### 1.5 Scope decisions

**P0 parity-inspired MVP:** curriculum/navigation, all 40 independently authored course topics, step player, diagram engine, response/failure animations, scene-specific metrics, search, keyboard shortcuts, theme, localization architecture, local progress, responsive layout, coming-soon navigation placeholders.

**P1 quality + expansion:** translated content to supported target locales, zoom/pan polish, fullscreen, rich search/indexing, reduced motion, richer authoring workflows, diagram telemetry, content review.

**P2 separate roadmap:** exercises, interactive architecture sandbox, cheatsheet library, accounts, cloud sync, instructor console, assessment, monetization, AI guidance. These are **not established live features**.

---

## 2. Reference information architecture: all nine modules and forty lessons

The names below are **English conceptual reconstructions** of the lesson lists from [S2] (whose table is in Chinese), not verified verbatim English UI titles. Their **order and exact slugs require parity validation**. Counts total **3+5+11+4+4+4+3+2+4=40**.

| ID | Module | Lesson / concept (English working title) | Core animation and teaching goals |
|---|---|---|---|
| F01 | Foundations | Journey of a Request | Client → DNS → TLS → server → data store → response |
| F02 | Foundations | Latency & Throughput | RTT, bottlenecks, queueing, p50/p95, RPS and throughput |
| F03 | Foundations | Back-of-the-Envelope Estimation | DAU→QPS, burst factors, storage and bandwidth |
| S01 | Scaling | Vertical vs Horizontal Scaling | Bigger machine vs more replicas and limitations |
| S02 | Scaling | Load Balancing | Request distribution, algorithms, unhealthy instance |
| S03 | Scaling | Stateless Services | Session affinity problem vs externalized session store |
| S04 | Scaling | Caching | Cache hit/miss, database load, invalidation |
| S05 | Scaling | Content Delivery Networks | Origin→edge→user, latency and cache behavior |
| D01 | Data & Storage | SQL vs NoSQL | Workload/consistency/model trade-offs |
| D02 | Data & Storage | Database Indexes | Full table scan vs indexed lookup |
| D03 | Data & Storage | Storage Engines | B+ tree vs LSM tree, read/write amplification |
| D04 | Data & Storage | Replication | Primary/replica, async lag and failover |
| D05 | Data & Storage | Sharding | Partition key, hotspots, scatter-gather |
| D06 | Data & Storage | Consistent Hashing | Ring, node membership and key movement |
| D07 | Data & Storage | Unique IDs at Scale | Identifier assignment and distributed generation |
| D08 | Data & Storage | CAP & Consistency | Partitions, consistency/availability trade-offs |
| D09 | Data & Storage | Consensus & Leaders | Leader election, term changes, quorum |
| D10 | Data & Storage | Transactions & Isolation | Atomic operations and isolation anomalies |
| D11 | Data & Storage | Files & Media | Object storage, metadata, upload and delivery |
| C01 | Communication | REST vs RPC vs GraphQL | Request patterns and trade-offs |
| C02 | Communication | Message Queues | Producer/broker/worker, backlog, retries, DLQ |
| C03 | Communication | Pub/Sub & Events | Publishers, topics and independent consumers |
| C04 | Communication | Real-Time Updates | Polling vs server push/WebSocket and reconnection |
| R01 | Reliability | Redundancy & Failover | SPOF removal, health checks and takeover |
| R02 | Reliability | Rate Limiting | Token bucket, bursts, rejection/backpressure |
| R03 | Reliability | Timeouts & Retries | Retry storm, exponential backoff, jitter |
| R04 | Reliability | Observability | Metrics/logs/traces and diagnosis |
| A01 | Architecture | Monolith vs Microservices | Team/service split, new network failure modes |
| A02 | Architecture | Service Discovery | Registration, resolving healthy endpoints |
| A03 | Architecture | Sagas & Distributed Transactions | Compensating actions, partial failure |
| A04 | Architecture | Batch vs Stream Processing | Scheduled aggregation vs near-real-time pipeline |
| SEC01 | Security | Authentication | Sessions, tokens, identity verification |
| SEC02 | Security | Authorization | RBAC/ABAC, policy enforcement |
| SEC03 | Security | Encryption & Secrets | TLS, encryption at rest, secret rotation |
| SH01 | Shipping | Testing | Test pyramid, contract/integration/system verification |
| SH02 | Shipping | CI/CD & Deployment | Build pipelines, blue/green, canary, rollback |
| W01 | Whole Systems | HLD vs LLD | Architecture abstraction vs component/API/data detail |
| W02 | Whole Systems | Design a URL Shortener | Redirect path, ID generation, data model, scale |
| W03 | Whole Systems | Design a News Feed | Fan-out push/pull, celebrity skew, timeline read |
| W04 | Whole Systems | Design a Chat System | WebSocket gateways, fan-out, persistence, reconnect |

### 2.1 Specific `#/hld-lld/1` page

The user-provided URL targets a **Whole Systems lesson, High-Level Design vs Low-Level Design**, step or segment `/1` under a hash route. This is strongly suggested by the path and by [S2]'s fourth module list item; exact route serialization and screen content remain **unverified**. Implement direct deep links in the proposed application, including `#/hld-lld/1` as an optional legacy-compatible alias. **Do not assume `/1` is the first indexed step without testing**.

**Original content audit facts from [S2]:** 445 steps distributed across all lessons, including 120 `problem`, 106 `technique`, 97 `solution`, 39 `insight`, 20 `tradeoff`, 23 `setup`, and 40 `recap` steps. These sum to 445. The instructional pattern is problem → intervention/technique → effect/trade-off → recap. Individual step counts by lesson were **not** obtained.

### 2.2 Content-production acceptance gate

For **each** of the forty course topics, a completed implementation must contain independently drafted learning objectives, prerequisites, 6–20+ step scenes as appropriate (not a mandated exact count), state transition descriptions, diagram definitions, fault/edge cases when relevant, at least one trade-off, a recap, and test fixtures. **Do not assert parity with 445 steps until 445 corresponding step records have actually been authored and validated.**

---

## 3. Detailed screen and route register

| Screen ID | Path (proposed unless noted) | Purpose | Mandatory controls/states |
|---|---|---|---|
| SCR-01 | `#/` | Course overview/entry | Module cards/list, continue learning, search, progress |
| SCR-02 | `#/module/:slug` | Optional module view | Lesson list, descriptions, progress, selection |
| SCR-03 | `#/:lessonSlug/:step` | Lesson player | Diagram, step explanation, controls, previous/next, step counter |
| SCR-03a | `#/hld-lld/1` | Reference target | Load HLD/LLD lesson and requested step |
| SCR-04 | search overlay | Discover lesson/concept | Search input, results, empty, keyboard nav, close |
| SCR-05 | coming-soon state | Practice | Nonfunctional informational affordance |
| SCR-06 | coming-soon state | Design Lab | Nonfunctional informational affordance |
| SCR-07 | coming-soon state | Cheatsheets | Nonfunctional informational affordance |
| SCR-08 | theme/language menu | Preferences | Theme, locale, persistence, fallback |
| SCR-09 | invalid URL | Error handling | Valid return route, error description |
| SCR-10 | fullscreen/fit canvas | Visualization | Fit, zoom, pan, reset, keyboard focus |
| SCR-11 | narrow viewport layout | Responsive lesson | Accessible compact nav and legible diagram |

### 3.1 Primary lesson-screen composition (BUILD)

Proposed layout: persistent top application bar → left module/lesson navigation (collapsible) → central scene stage → explanation/pedagogy panel → playback/step toolbar → optional metric/insight HUD. The exact orientation is not independently observed and must be adjusted using screenshots before claiming pixel fidelity.

**Top bar:** distinct brand/product name, curriculum tab, disabled feature tabs or coming-soon affordances, search trigger, theme toggle, locale menu, progress indicator where available.  
**Sidebar:** module grouping, selected lesson, completion marks, current course, collapse behavior, module counts.  
**Stage:** SVG with stable camera, decorative floor/grid, isometric architecture objects, links, moving packets, labels, HUD cards.  
**Explanation panel:** step tag/category, title, concise explanation, terminology annotations, compare/recap where applicable.  
**Footer controls:** previous, play/pause, replay, next, `step X / Y`, optional progress bar, zoom/fit/fullscreen.  
**Overlays:** search, help/shortcuts, accessibility controls, tooltip, completion confirmation, error recovery.

### 3.2 Screen states to specify

Every screen/control must cover initial, loading, empty, selected, playing, paused, transitioning, completed, error, reduced-motion, dark/light, language-pending, small-screen and keyboard-focus states. Show meaningful alternatives when content/translation fails to load.

---

## 4. Behavioral requirements catalogue

Status `R` = derived from reference audit; `B` = build requirement; priority P0/P1/P2.

| ID | Priority | Status | Requirement & acceptance rule |
|---|---|---|---|
| NAV-01 | P0 | R | Present 9 modules / 40 lessons in deterministic curriculum order. |
| NAV-02 | P0 | B | Deep link resolves correct lesson and step; refresh preserves selected URL. |
| NAV-03 | P0 | B | Prev/next lesson navigation respects curriculum boundaries. |
| NAV-04 | P0 | B | Browser Back/Forward updates both URL and visual lesson state. |
| NAV-05 | P0 | B | Invalid route gracefully redirects/offers course selection. |
| NAV-06 | P1 | B | Collapsed sidebar and compact menu remain fully usable on mobile. |
| LES-01 | P0 | R | Each lesson contains ordered animated educational steps. |
| LES-02 | P0 | R | Display active step narrative, tag and relevant diagram. |
| LES-03 | P0 | B | Single source of truth for current lesson ID and step index. |
| LES-04 | P0 | B | Step transition is deterministic and idempotent. |
| LES-05 | P0 | B | Step change atomically syncs explanation, scene and metrics. |
| LES-06 | P0 | B | Last step shows recap and completion affordance. |
| LES-07 | P0 | B | Completion never fires merely on initial navigation. |
| LES-08 | P1 | B | Related-lesson navigation appears on completion. |
| ANM-01 | P0 | R | Previous/next step controls navigate the story. |
| ANM-02 | P0 | R | Pause/resume controls freeze/restart packet animation. |
| ANM-03 | P0 | R | Replay restarts current step scene predictably. |
| ANM-04 | P0 | B | Rapid input does not produce duplicate scene mutations. |
| ANM-05 | P0 | B | Leaving a lesson cancels old animation frames/effects. |
| ANM-06 | P0 | B | Background tab/resume clamps elapsed time to avoid huge jumps. |
| ANM-07 | P1 | R | Arrow-key navigation, R replay, Space pause. |
| ANM-08 | P1 | R | Double-click stage to zoom, pan and Fit restore. |
| ANM-09 | P1 | B | Preserve semantic state when viewport resizes or theme changes. |
| ANM-10 | P1 | B | Reduced motion displays scene end-states without essential movement. |
| VIS-01 | P0 | R | Isometric pseudo-3D nodes, edges, labels, packet animation. |
| VIS-02 | P0 | B | Stable node identity survives transitions and keyframe interpolation. |
| VIS-03 | P0 | B | Z/depth sorting avoids inconsistent overlap. |
| VIS-04 | P0 | B | Edge endpoints terminate at node boundaries, not visual centers. |
| VIS-05 | P0 | B | Camera fit keeps important entities in viewport. |
| VIS-06 | P0 | B | Floating HUD cards do not obscure essential labeled nodes. |
| VIS-07 | P1 | B | Zoom/pan constrained to sensible min/max and recoverable with Fit. |
| VIS-08 | P1 | B | Visualizations expose meaningful text summaries to screen readers. |
| MET-01 | P0 | B | Values have units, definitions, assumptions, and origin type. |
| MET-02 | P0 | B | Metrics change exactly when the related step changes. |
| MET-03 | P0 | B | Clearly label illustrative vs computed vs observed metrics. |
| MET-04 | P1 | B | Can compare baseline versus alternative where lesson supports it. |
| SRCH-01 | P0 | R | Open search with Cmd/Ctrl+K and visible UI trigger. |
| SRCH-02 | P0 | B | Search across topic title, summary, terms and lesson text. |
| SRCH-03 | P1 | R | Weight matches; support aliases and typo tolerance. |
| SRCH-04 | P1 | R | Unicode normalization and CJK tokenization. |
| SRCH-05 | P0 | B | Keyboard results arrow navigation, Enter select, Escape close. |
| PREF-01 | P0 | R | Switch between light and dark themes. |
| PREF-02 | P0 | B | Persist theme and restore before first rendered frame. |
| PREF-03 | P0 | R | Language selection; reference audit says 21 languages. |
| PREF-04 | P0 | B | Translation absence falls back to default language. |
| PREF-05 | P1 | R | RTL support for Arabic/Hebrew and bidirectional technical terms. |
| PREF-06 | P1 | B | Locale change must preserve lesson/step/progress. |
| PROG-01 | P0 | R | Persist completed lessons in browser storage. |
| PROG-02 | P0 | R | Persist last lesson/position where supported. |
| PROG-03 | P0 | B | Version progress schema; survive added/removed lessons safely. |
| PROG-04 | P1 | B | Reset progress action requires confirmation. |
| PROG-05 | P0 | B | Failure/unavailability of localStorage never blocks learning. |
| EXP-01 | P0 | R | Show Practice/Design Lab/Cheatsheets as coming soon for parity. |
| EXP-02 | P2 | B | Design lab and assessments require separate approved specification. |

### 4.1 Playback state machine

States: `unloaded`, `loading`, `ready`, `transitioning`, `playing`, `paused`, `finished`, `error`, `disposed`.

Events: `LOAD_LESSON`, `LOAD_STEP`, `NEXT`, `PREVIOUS`, `PAUSE`, `RESUME`, `REPLAY`, `END_ANIMATION`, `ZOOM`, `FIT`, `UNLOAD_LESSON`, `VISIBILITY_CHANGE`, `ERROR`.

Rules:
1. `NEXT` within `transitioning` should either be queued once or cancel-and-replace; **choose one** deterministic policy (recommended: immediately resolve to target step and cancel stale animation).
2. Every animation loop has a scene generation token; after navigation/dispose, callbacks with stale generation tokens are ignored.
3. `REPLAY` sets time to 0 for the current step's action timeline; no duplicate packet loops.
4. `PAUSE` freezes elapsed-time advancement but retains current interpolation state.
5. `NEXT` from final step triggers recap/completion, not out-of-bounds scene access.
6. `PREVIOUS` from first step is disabled or navigates prior lesson **only if confirmed by UI specification**; default recommendation: disabled.
7. DOM focus remains predictable after keyboard actions, menu closes, and route changes.
8. Metrics and story text update using the same step transaction as scene state.
9. Reduced-motion mode skips nonessential interpolation but preserves cause/effect indicators and narration.

### 4.2 Keyboard shortcuts (audit-reported)

| Action | Shortcut | Notes |
|---|---|---|
| Previous step | Left arrow | Ignore while typing in fields/search |
| Next step | Right arrow | Ignore while typing in fields/search |
| Replay | R | In lesson context |
| Pause/resume | Space | Prevent page scroll when action consumed |
| Search | Ctrl+K / Cmd+K | From most screens |
| Zoom to node | Double-click stage object | Reported smooth 2× zoom, behavior may be adapted |
| Fit stage | Fit control | Returns to complete topology |
| Read-aloud | L/P reportedly exist in disabled module | **Do not expose as shipped feature in MVP** |

---

## 5. Animation/rendering engine: detailed engineering requirements

### 5.1 Reported reference engine behavior [S2]

Third-party source analysis describes a **custom vanilla SVG** engine, not a React Flow or Canvas-based application. It reports:
- 2:1 isometric projection from 3D logical grid to 2D SVG.
- Depth-order/painter sorting.
- Stage auto-fit with HUD avoidance and camera hysteresis.
- Clip connectors at polygon boundaries with numerical search.
- Packet movement based on real SVG path length.
- Browser `requestAnimationFrame` with per-frame delta clamp around 50ms.
- Runtime color transformations to derive dark scene palette.
- Text measurement fallback for CJK/RTL labels.
- Typical semantic packet types: request, heavy, response, slow, poison, ping, and more.

These are reference findings, **not required literal algorithms**. Engineering should reproduce behavior reliably using an implementation selected after profiling.

### 5.2 Logical scene schema (BUILD)

```ts
interface Lesson {
  id: string;
  slug: string;
  moduleId: string;
  order: number;
  title: LocalizedText;
  summary: LocalizedText;
  objectives: LocalizedText[];
  prerequisites: string[];
  tags: string[];
  version: number;
  steps: LessonStep[];
}
interface LessonStep {
  id: string;
  order: number;
  category: 'setup'|'problem'|'technique'|'solution'|'insight'|'tradeoff'|'recap';
  title: LocalizedText;
  body: LocalizedText;
  sceneId: string;
  actions: SceneAction[];
  metrics: MetricState[];
  completionRule: 'immediate'|'timeline-complete'|'explicit-user';
}
interface Scene {
  id: string;
  nodes: SceneNode[];
  edges: SceneEdge[];
  groups?: SceneGroup[];
  cards?: HudCard[];
  camera?: CameraState;
}
interface SceneNode {
  id: string;
  kind: NodeKind;
  label: LocalizedText;
  x: number; y: number; z?: number;
  status?: 'normal'|'busy'|'warning'|'failed'|'healthy';
  attrs?: Record<string, unknown>;
}
interface SceneEdge {
  id: string; from: string; to: string;
  kind: 'request'|'response'|'replication'|'async'|'control'|'bidirectional';
  route?: 'straight'|'elbow'|'bezier';
  label?: LocalizedText;
  attrs?: Record<string, unknown>;
}
interface SceneAction {
  id: string;
  type: 'appear'|'disappear'|'move'|'highlight'|'status'|'packet'|'edge'|'camera'|'metric';
  targetId?: string;
  startMs: number;
  durationMs: number;
  easing?: string;
  params?: Record<string, unknown>;
}
interface MetricState {
  key: string; label: LocalizedText;
  value: number|string; unit?: string;
  kind: 'illustrative'|'computed'|'measured';
  assumptions?: string[];
}
type LocalizedText = string | Record<string,string>;
```

Validation: JSON Schema or Zod must reject duplicate IDs, missing references, invalid step order, negative durations, unknown node types, malformed locales, invalid numeric values and steps without an accessible narrative.

### 5.3 Isometric projection and layering

The independent analysis reports an isometric formula equivalent to:

```ts
function project(x:number,y:number,z=0) {
  return { screenX: Math.round(14*(x+y)), screenY: Math.round(7*(x-y)-z) };
}
```

Implementation requirements: project logical nodes consistently; draw component faces with shared geometry; depth-sort opaque objects; correctly layer edges, floor, packets, labels, ambient shadows, popovers; minimize depth flicker while objects move. Explicitly test objects overlapping in front/behind relationships at every keyframe.

### 5.4 Node primitives and variants

Build a reusable, original asset catalog for at least: user/avatar, desktop browser, phone, server rack/app box, load balancer, gateway, DNS, database cylinder, cache, queue, pub/sub broker, worker, object storage, CDN edge, network link, auth/key, leader/follower, cluster boundary, hash ring, request/response packet, error marker, monitoring panel. Each node supports normal/busy/failing/healthy/disabled/selected states; light/dark themes; translated labels; layout scaling; accessible semantic descriptions.

### 5.5 Edge routing and moving packets

- Maintain stable edge identity and endpoints even when nodes move.
- Compute anchors at rendered node boundaries; prevent arrowheads hidden inside solid nodes.
- Use SVG path interpolation along `getTotalLength()` and `getPointAtLength()` (or equivalent).
- Support reverse direction, two-way traffic, parallel packets, delays, retries, drops, held packets, acknowledgements, and success/failure events.
- Avoid path self-intersections and label collisions where possible; explicit routes for dense scenes.
- Packet animation must remain smooth across zoom, pan and theme switches.
- Do not use random results in teaching comparisons without a deterministic seed and displayed assumptions.

### 5.6 Auto-camera, HUD collision, zoom and pan

Recommended camera algorithm:
1. Compute projected bounding geometry for all important visible nodes, labels and edges.
2. Fit within stage viewport subject to minimum margins and HUD reserved rectangles.
3. Test candidate HUD positions (corners) and progressively reduce scale if overlapping critical topology.
4. Apply hysteresis so tiny topology changes don't cause camera wobble.
5. Smoothly interpolate intentional camera transitions while preserving user-driven zoom if configured.
6. Provide `Fit`, `+/-`, drag-to-pan, zoom limits, touch pinch (if implemented), keyboard-accessible controls.
7. Handle orientation change without resetting step, playback state or accessibility focus.

### 5.7 Simulation semantics

The player is a **pedagogical visual simulator**, not a general-purpose production distributed-system simulator. For each lesson define a `scenario`, fixed assumptions, baseline state, intervention, measurable illustrative effect, error path, recap and comparison. Show why illustrative math is illustrative; do not imply exact real-world latency or reliability outcomes.

### 5.8 Accessibility specifics

- Accessible narration alternative to moving packet trajectories.
- Step title/body changes announce politely, without overwhelming assistive technology.
- Keyboard reachable stage operations and controls.
- Distinguish failed/healthy/busy states using more than color alone.
- Reduce or remove flashes and nonessential animation for `prefers-reduced-motion`.
- Strong focus rings, sufficient contrast, touch targets ≥44×44 CSS pixels where feasible.

---

## 6. Search subsystem

**REFERENCE (B):** The independent code audit reports weighted indexing of concept terms, step copy, diagram labels and metadata. Example relative weights: term 10, title 8, short 6, body 3, callout 2; alias mapping for db/lb/2pc/wal/lsm; Unicode normalization; CJK bigram splitting; multilingual stopwords; Damerau–Levenshtein tolerance of up to two edits for sufficiently long unmatched queries. It also reports Ctrl/Cmd+K.

**BUILD requirements:**
- Index lesson title, module, summary, tags, steps, terms, diagram node/edge labels, key metrics and recap.
- Exact/phrase matches first, weighted field matches next, tolerant matches after, deterministic tie-break.
- Search highlights matched content with XSS-safe rendering.
- Support empty query, no results, keyboard navigation, Escape, highlighted selection, scroll-to-selected result.
- Support latency budget ≤100ms for typical local dataset on target device; debounce or worker if needed.
- Localized search index must match selected locale and fall back gracefully.
- Search results include direct lesson/step link when a match occurs in a step.
- Search must be usable without an account, backend or external network once app assets have loaded.

**Suggested search test corpus:** `cache`, `cahce`, `db`, `shard`, `raft`, `2pc`, `rate limit`, Chinese term, Arabic RTL term, multiword title, obscure node label, no-match string. Test expected ordering with golden fixtures.

---

## 7. Localization and themes

### 7.1 Localization

**REFERENCE (B):** 21 supported locales reported; audit names English, Simplified/Traditional Chinese, Japanese, Korean, Arabic and Hebrew. Remaining exact locale list **unknown** without direct bundle inspection. The audit reports 20×41 lazy-loaded locale chunks (20 non-English × 40 lesson files plus common UI), RTL, first-paint language handling and translated SVG labels.

**BUILD:** Architect for 21 locales but **do not invent the remaining exact reference languages**. Author English first; add locales only with editorial translation QA. Keep `ui` and `lesson` translation domains separate; lazy-load only current lesson. Use locale fallback (regional→language→English), persist selected locale, update root `lang` and `dir`, protect bidirectional code tokens, measure SVG label width after fonts load, and test CJK/RTL line wraps and clipping.

Translation data model: `locale`, `namespace`, `key`, `text`, `version`, `reviewStatus`, `fallback`. All dynamic labels, metrics, aria labels and tooltips must be localized.

### 7.2 Theme

**REFERENCE (B):** Warm-paper aesthetic and dark version; external audit reports light background around `#f4ebe0`, dark ground around `#211e1a`, dark ink around `#1d1b18` and pastel diagram colors. Exact palette across all semantic states requires screenshot/asset verification.

**BUILD:** Define semantic design tokens (surface, text, border, primary, success, warning, failure, selected, packet, highlights, shadow). Ensure all SVG primitives and semantic diagram classes respond to theme changes without losing legibility or needing separately drawn art. Persist user choice and avoid initial light-to-dark flash.

---

## 8. Progress, storage and offline behavior

**REFERENCE (B):** Audit reports `localStorage` keys `sdt:done` and `sdt:last`; no user authentication for the current course. Exact value formats unknown. Do not rely on those exact key values for our implementation unless intentionally mimicking a legacy migration.

**BUILD recommended schema:**

```json
{
  "schemaVersion": 1,
  "lastLessonId": "hld-lld",
  "lastStepId": "step-01",
  "completedLessonIds": ["request-lifecycle"],
  "theme": "system",
  "locale": "en",
  "updatedAt": "ISO-8601"
}
```

- Completion is triggered only by explicit recap completion or reaching a defined end rule.
- Last visited state saved debounced or on navigation/change.
- Validate and migrate storage; ignore unknown IDs, prevent parse errors from crashing app.
- On storage denial, use an in-memory store and show optional nonblocking notice.
- A reset-progress action requires a confirmation and affects only learning state, not unrelated settings (unless user requests full reset).
- Offline behavior: static app should use cached assets if available. Full installable PWA/offline caching is **optional** and not confirmed reference behavior.
- Privacy: no identifiable user data needed for parity MVP. If analytics added, disclose data and obtain required consent.

---

## 9. HLD vs LLD target lesson — fully specified example (original teaching content)

**URL target:** `#/hld-lld/1`  
**Status:** Original proposed lesson content for redevelopment. **NOT a transcription of the reference page**.

**Audience:** Software engineers learning architectural abstraction levels.  
**Objectives:** Distinguish HLD from LLD, choose right artifact for each, connect functional/nonfunctional requirements to component choices, recognize when to shift detail, identify interfaces and failure modes.  
**Prerequisites:** HTTP/client-server, API, database basics.

### 9.1 Suggested 12-step storyline

| Step | Type | Narrative intent | Diagram changes | Takeaway |
|---|---|---|---|---|
| 1 | setup | Product problem: scalable URL shortener | User/client → service as black box | Start from requirements |
| 2 | problem | Ambiguity in “build the backend” | System outline shows unknown gaps | Need architectural boundaries |
| 3 | technique | Introduce HLD | Reveal client, API, services, DB, cache | HLD conveys big-picture components |
| 4 | technique | HLD communication paths | Add edges/request/response arrows | Define component responsibilities |
| 5 | insight | NFR influence | Add load, latency, availability badges | Architecture follows constraints |
| 6 | problem | HLD is not implementation | Zoom to opaque shortening service | Need finer component detail |
| 7 | technique | Introduce LLD | Reveal classes/interfaces, DTOs, schema | LLD specifies internals |
| 8 | technique | Request handling flow | API validation→ID allocation→write→response | Define execution path |
| 9 | solution | Data model and contract | Tables/indexes/unique key/API status codes | Make behavior implementable |
| 10 | tradeoff | Compare alternatives | SQL/NoSQL, sync/async, retry/collision handling | Detail architecture choices |
| 11 | insight | Move between levels | Zoom out to HLD then back into one component | HLD and LLD must remain consistent |
| 12 | recap | Side-by-side decision table | HLD/LLD contrasting cards | Know deliverables at each level |

### 9.2 Suggested HLD diagram

`Browser/Mobile → CDN/Edge → API Gateway → URL Service → {Cache, Primary DB} → (replica / metrics)`.

Highlight: responsibility boundaries, horizontal scaling, availability zones, SPOFs, major storage and communication choices, performance budgets. Avoid exact classes and SQL queries at this level.

### 9.3 Suggested LLD diagram

Within URL service: `Route Handler → Validation → ShortCodeGenerator → Repository Interface → DB` with `CacheService` and `Metrics/Tracing`. Include `POST /shorten`, `GET /:code`, response models, validation errors, uniqueness handling, `urls(code, destination, created_at, expiry_at)`, indexes, idempotency and retry semantics. This is an instructional sample, not a mandated actual stack.

### 9.4 Comparison recap

| Question | HLD | LLD |
|---|---|---|
| Core question | What are major parts and how do they interact? | How will a specific part work internally? |
| Audience | Architects, tech leads, stakeholders | Implementers, reviewers, testers |
| Typical artifact | Component/deployment/traffic diagrams | Classes, sequence diagrams, schema, API contract |
| Focus | Scalability, reliability, boundaries, data flow | Interfaces, methods, edge cases, algorithms |
| Validation | Meets business/NFR constraints | Implements component contract correctly |
| Common pitfall | Too vague to guide implementation | Too detailed before architecture is stable |

### 9.5 Lesson-level UAT

1. Deep link `#/hld-lld/1` resolves page with valid beginning/selected step according to router convention.
2. Each of the 12 sample steps has unique narration and a meaningful diagram delta.
3. Zooming in/out shows HLD and LLD granularity, not merely changes text.
4. Pausing during packet traversal preserves animation position.
5. Back/replay produces reproducible node positions and labels.
6. Final recap visually contrasts HLD and LLD.
7. Users can navigate entire lesson on keyboard and in reduced-motion mode.
8. All terminology and diagrams have accessible descriptions.

---

## 10. Proposed frontend architecture and module boundaries

A static client-first architecture is sufficient for comparable function. Two implementation paths are viable:

**Option A, behavior-fidelity lean:** TypeScript + Vite + native SVG DOM/custom player; minimizes runtime and gives precision for dense procedural animations, mirrors the reported original approach. Requires careful explicit state/lifecycle engineering.

**Option B, maintainability-first:** React + TypeScript + Vite + native SVG scene renderer + small animation scheduler; use UI framework for navigation/preferences, but keep a deterministic imperative SVG animation layer. Avoid using a general diagram library without verifying its node perspective, routing and camera capabilities.

**Recommended:** Option B for a multi-developer long-term product; Option A if premium animation and minimal bundle size are dominant objectives and team has strong low-level frontend expertise. This choice is *our design decision*, not reverse-engineered proof about source architecture.

### 10.1 Suggested folder architecture

```text
src/
  app/             # startup, router, providers, error boundaries
  curriculum/      # modules, lessons, manifest, loading
  lesson-player/   # player reducer/state machine, controls, persistence
  scene-engine/    # schema, geometry, projection, camera, renderer
  animation/       # scheduler, actions, particles, easing
  primitives/      # icons / SVG entities / labels / connectors
  search/          # indexing, tokenization, ranking, aliases
  i18n/            # locale loading, fallback, RTL support
  progress/        # browser persistence and version migrations
  theme/           # tokens and SVG theme mapping
  ui/              # navigation, search dialog, tooltips, settings
  content/         # 9 module manifests, 40 source lessons
  tests/           # unit, integration, E2E, visual, accessibility
public/            # fonts (licensed), static art, metadata
scripts/           # schema validation, content compilation, audits
```

### 10.2 Runtime flow

1. Read theme/locale preference before first paint.
2. Parse hash route; resolve lesson manifest and step.
3. Lazy-load lesson content and selected-language strings.
4. Validate content schema; construct step view-model.
5. Build scene graph; compute geometry and camera fit.
6. Render SVG and explanation/HUD in a synchronized state transaction.
7. Start/pause/resume timeline with cancelable generation token.
8. Handle user controls and update route/history and storage.
9. On navigation or teardown, cancel old loops and release listeners.
10. Capture non-sensitive errors and performance measurements if analytics configured.

### 10.3 Backend/DevOps scope

Parity MVP can be deployed as static assets behind a CDN, with cache-control policy for content JSON and hashed immutable assets. CI validates types, schemas, lesson graph integrity, unit/E2E tests and artifact size, then deploys versioned release. Support staging, production, safe rollback and source maps held separately or protected. Optional backend for accounts/CMS/metrics should use its own approved design and privacy model.

---

## 11. Data dictionary and persistence rules

| Entity | Key fields | Constraints |
|---|---|---|
| Module | id, slug, title, order, icon, color | Unique id/slug/order |
| Lesson | id, moduleId, slug, title, summary, version | Unique globally, referenced module exists |
| Step | id, lessonId, index, kind, sceneId, text | Continuous index, unique per lesson |
| Scene | id, layout/camera, nodes[], edges[], hud[] | Every edge references existing nodes |
| Node | id, kind, x,y,z, label, status | Unique per scene, finite coords |
| Edge | id, from,to,route,kind,label | Valid endpoints, valid type |
| Animation action | id, type, target, start, duration,easing | Target exists, finite nonnegative times |
| Packet | id, edgeId, kind, speed/duration, fail status | Bounded, cancelable lifecycle |
| Metric | id, label, unit, value, provenance, assumptions | Never unexplained units |
| Translation | locale, key, message, status, version | Fallback defined; safe interpolation |
| Progress | schemaVersion, lessonId, stepId, completed | Versioned; ignore missing IDs |
| Preference | theme, locale, reducedMotion | Valid enumerated values |
| Search record | entityId, field, tokens, language, score inputs | Rebuilt on content version change |

Content IDs are stable across localized strings; never use a translated title as a primary key. Step IDs should remain stable across minor editorial revisions; if major structural changes occur, document migration policy for saved positions.

---

## 12. Nonfunctional requirements and service quality

These are **proposed engineering SLOs/targets**, not measured properties of the reference.

| ID | Area | Proposed measurable target |
|---|---|---|
| NFR-01 | Loading | On agreed representative mobile test profile, p75 interactivity <3s after navigation |
| NFR-02 | Animation | Target 60fps on reference desktop; degrade gracefully with complex scenes |
| NFR-03 | Input | Main controls respond within 100ms excluding intentional transition |
| NFR-04 | Search | Client-side query response <100ms for standard corpus on target profile |
| NFR-05 | Asset size | Define and enforce bundle budgets after initial benchmark; separate locale chunks |
| NFR-06 | Availability | Static CDN availability as contracted; content loading failure has retry/fallback |
| NFR-07 | Compatibility | Current and previous major Chrome/Firefox/Edge/Safari releases |
| NFR-08 | Responsive | Key actions usable at viewport width ≥320px and large desktop |
| NFR-09 | Accessibility | WCAG 2.2 AA goal, keyboard + reduced-motion + screen-reader alternative |
| NFR-10 | Security | CSP, escaping/sanitization, dependency scanning, no unsafe dynamic `innerHTML` from user content |
| NFR-11 | Privacy | No accounts required for parity, minimal or no PII; analytics opt-in if required |
| NFR-12 | Resilience | App usable when storage blocked; invalid content isolated and recoverable |
| NFR-13 | Maintainability | Add lesson by schema/content files without editing engine implementation |
| NFR-14 | Observability | Console errors, asset failures, playback exceptions, performance sampling |
| NFR-15 | Internationalization | RTL/CJK display tests, fallback, no first-frame locale flash |
| NFR-16 | Testability | Deterministic seeded animations and stable visual snapshots |

Use reduced-motion, high-DPI, touch/pointer, zoom, browser font loading, dark-mode and orientation changes in the verification matrix.

---

## 13. User stories with acceptance criteria

**US-01 — Browse curriculum**. As a learner I can browse ordered modules and lessons so I know what I can study. **Accept:** all 9 module groups and 40 course records render in configured order; selecting a lesson resolves a stable URL.

**US-02 — Begin at a deep link**. As a learner I can open a shared lesson step directly. **Accept:** a fresh browser session loading `#/hld-lld/1` displays valid HLD/LLD content; browser refresh preserves route; invalid steps show a recovery state.

**US-03 — Follow an evolving diagram**. As a learner I can move from problem to solution. **Accept:** changing steps updates text, scene, metrics and category together; state stays deterministic if step controls are used rapidly.

**US-04 — Pause and replay**. As a learner I can inspect packet flows at my own pace. **Accept:** paused packets do not advance; replay resets elapsed time and stage animations; no stale timers remain after route changes.

**US-05 — Read outcomes**. As a learner I see consequences of architectural decisions. **Accept:** at least one scenario shows baseline/alternative; displayed metrics include units and assumptions; recap identifies trade-offs.

**US-06 — Search concepts**. As a learner I can find a topic quickly. **Accept:** Ctrl/Cmd+K opens search; valid query returns correctly ranked clickable results; no-match and escape handled.

**US-07 — Continue progress**. As a learner I can return later. **Accept:** completed lessons/last state persist through refresh under storage-enabled conditions; disabled storage fails gracefully.

**US-08 — Change language/theme**. As a learner I can adjust reading preferences. **Accept:** UI updates while preserving current lesson/step; text and SVG labels do not clip; preferences persist.

**US-09 — Use keyboard/mobile**. As a learner I can navigate without precision mouse control. **Accept:** accessible controls, logical focus order, reduced motion, touch access at 320px+.

**US-10 — Add course content**. As a content author I can create new scenes without modifying engine internals. **Accept:** schema validator catches missing references, content builds and new lesson appears in navigation/search.

---

## 14. Test matrix and edge cases

| Test | Input / scenario | Expected outcome |
|---|---|---|
| T-001 | Open `/` and hash root | Course loads |
| T-002 | Open `#/hld-lld/1` directly | Correct lesson and valid step load |
| T-003 | Open unknown slug | Friendly lesson-not-found |
| T-004 | Open negative or huge step index | Clamp or explicit error per routing contract |
| T-005 | Click Next during animation 10× | Deterministic final state; no orphan loops |
| T-006 | Click Previous mid-animation | Correct previous scene, no stale packets |
| T-007 | Pause, wait, resume | Elapsed animation continues without jump |
| T-008 | Replay 20× | No duplicate listeners, particles or timers |
| T-009 | Switch lesson mid-animation | Old scene fully disposed |
| T-010 | Hide/reveal tab after long delay | No movement spike or negative time |
| T-011 | Resize while scene is playing | No lost node, readable labels, stable step |
| T-012 | Zoom/pan/fit densely connected graph | All nodes recoverable and camera stable |
| T-013 | Activate reduced motion | Same conceptual states without unnecessary animation |
| T-014 | Switch theme during playback | Correct palette, preserved state |
| T-015 | Switch language to RTL | Correct direction, technical terms, labels |
| T-016 | Font loads late | Labels recompute with no clipping |
| T-017 | Search `db`, typo, CJK term | Relevant result ordering, robust tokenizer |
| T-018 | Search while keyboard shortcuts active | Player shortcuts suppressed in text input |
| T-019 | Disable localStorage | Learning continues; nonblocking warning |
| T-020 | Corrupt saved progress JSON | Reset/migrate safely, no fatal startup |
| T-021 | Complete then refresh | Completion remains recorded |
| T-022 | Finish final lesson | Recap/completion and safe navigation |
| T-023 | Missing translation chunk | Fallback language and recoverable error |
| T-024 | Missing lesson scene asset | Friendly content error; no blank app |
| T-025 | Browser Back and Forward | Route, panel and scene stay in sync |
| T-026 | Scene overlaps HUD | Refit/reposition avoids essential occlusion |
| T-027 | Edge anchored to moving node | Line stays connected to visual boundary |
| T-028 | High-DPI/low-powered mobile | Legible and usable fallback |
| T-029 | XSS-like string in lesson source | Escaped, inert text (unless approved rich-text syntax) |
| T-030 | Content with duplicate IDs | CI/schema validation fails with actionable error |

### 14.1 Acceptance exit criteria

- All P0 features pass UAT and no critical blocker defects.
- All 40 lesson definitions exist, load successfully and pass content validation.
- All authored steps have defined scene and explanation, no broken references.
- Required screen sizes, browser set and accessibility tests pass.
- Measured performance documented, release rollback tested.
- **Reference parity claim is only allowed for interactions with verified evidence**; do not call visual/animation content exact without a reference screenshot/recording comparator.

---

## 15. Content authoring, editorial quality and workflow

Authoring pipeline: **topic brief → learning objectives → problem scenario → step storyboard → scene node/edge plan → action timeline → copywriting → metric assumptions → technical peer review → localization → schema validation → visual snapshot → accessibility review → publish**.

The review template for every lesson includes:
1. What user problem does this teach?
2. What does the visual show *before* and *after* each step?
3. Which packets move and in which direction?
4. What is the failure/hotspot/bottleneck illustration?
5. Which values are examples versus actual calculations?
6. Which alternatives and trade-offs are explained?
7. Is the technical simplification accurate enough to teach safely?
8. Does the recap correspond to all stated objectives?
9. Does the lesson work in dark, mobile, keyboard, reduced-motion, and RTL modes?
10. Are all text and visual assets original or licensed?

Recommended authoring file convention: `content/<module>/<lesson>/manifest.json`, `steps.json`, `scenes/*.json`, `locales/<locale>.json`, `assets/` (original graphics). Include per-lesson version and last-reviewed date.

---

## 16. Release plan and backlog

### Release 0 — Feasibility spike

Build four independent engine demonstrations: request path; load-balancer failover; cache hit/miss; queue backlog/retry. Verify node geometry, camera behavior, 60fps target and scene schema. No user-facing product claim.

### Release 1 — Core foundation

Course shell, route/deep linking, lesson manifests, player state machine, original 2.5D SVG primitives, transitions, local storage, theme, English content, keyboard shortcuts, responsive stage, basic search.

### Release 2 — Curriculum completion

All 40 independently authored lessons, technically reviewed diagrams, recap cards, glossary, simulation assumptions, full content regression tests.

### Release 3 — Polished parity-inspired experience

Zoom/pan, HUD collision avoidance, advanced packet semantics, typo-tolerant multilingual search, additional translations, RTL QA, visual regression, accessibility audits, full browser compatibility.

### Release 4 — Optional business roadmap

Practice engine, Design Lab, cheatsheets, cloud progress sync, instructor mode, authoring CMS, subscriptions or team training. Each requires new approval and separate scope.

### RACI recommendation

| Workstream | Accountable | Responsible | Consulted |
|---|---|---|---|
| Requirements/parity | Product owner | Business analyst | Design, engineering |
| Course accuracy | Curriculum lead | SME/content writers | Senior architects |
| UX/visual system | Design lead | UX designer | Accessibility specialist |
| Scene engine | Engineering lead | Frontend engineers | Performance specialist |
| Localization | Localization lead | Translators | Content lead |
| Quality/release | QA/Engineering lead | QA and CI owner | Product |

---

## 17. Reference audit worksheet for exact-fidelity follow-up

These are the **only material remaining evidence gaps**, not missing fundamental functional architecture. If an exact pixel/word/animation clone is desired, completion requires a JS-capable browser walk-through or captured recordings. The following worksheet is the smallest meaningful parity evidence dataset:

| Field | Per lesson / UI state |
|---|---|
| `reference_url` | Exact hash path |
| `captured_at` | Date/time and app build fingerprint |
| `module_name_ui` | Actual displayed module title |
| `lesson_name_ui` | Exact displayed lesson title |
| `step_index` | Actual visible step index/total |
| `category_ui` | Exact displayed tag |
| `step_title_ui` | Exact text (record privately; reuse only if licensed) |
| `narrative_summary` | Independently authored factual description |
| `scene_nodes` | Kinds, relative positions, labels, appearance |
| `scene_edges` | Links, directions, line styling |
| `packet_events` | Start, route, end, speed and fail/success indication |
| `metric_values` | All UI values, units, transitions, assumption |
| `hud` | Cards, placement, visibility |
| `camera` | Zoom, fit, pan, persistence behavior |
| `controls` | Enabled/disabled/hover/focus and result |
| `evidence` | Screenshot and short video/time marker |
| `confidence` | Direct observation vs secondary report |

Inspect first/last/intermediate scenes in every lesson, all step buttons, search results, a locale switch, dark mode, all disabled tabs, zoom/pan/fit and direct-step route handling. A full 445-step evidence log is **not present in this document**, and its absence must be visible to future developers.

---

## 18. Build-agent implementation brief (copy directly into a future development session)

> Build an independently authored, browser-based interactive system-design learning app using `Designed_to_Scale_Complete_Discovery_Development_Spec_v1.md` as the authoritative requirements baseline. Do not copy the original project's branding, proprietary source, artwork or complete instructional prose. Implement the P0 scope first: nine modules, 40 declared topics, a reusable 2.5D SVG scene graph and deterministic step timeline, lesson browser, deep linking including `/hld-lld/1` compatibility, play/pause/replay/previous/next, packet flows, camera fit/zoom, search, local progress, theme and localization scaffolding. Separate curriculum content from engine and validate all references. Create original examples and diagram art, with dedicated HLD-vs-LLD lesson defined in Section 9. Prioritize state-machine correctness, SVG rendering, responsive UX, keyboard accessibility, reliable storage migrations, and automated tests. Treat all third-party reference findings as secondary evidence. Do not claim exact 445-step/21-language/content parity until implemented and verified. Ship unit tests, browser E2E and schema validation, a reproducible build, an evidence-based gap report and an installation/deployment README.

### Definition of done for agents

1. `npm ci`, build, unit tests, E2E tests and content checks run cleanly.
2. `#/hld-lld/1` and all lesson navigation paths work on direct URL/refresh.
3. All 40 topics have authored content metadata and at least one complete functional lesson step sequence; no empty placeholders passed off as finished lessons.
4. Engine handles pause/replay/rapid navigation/teardown without leaked timers.
5. Diagrams, explanations and metrics update atomically.
6. Theme, progress, search and locale fallback are functional.
7. Desktop/mobile and reduced-motion modes are usable.
8. Known parity gaps are documented and not concealed.

---

## 19. Explicit exclusions, unresolved decisions and factual caveats

### Explicit parity-MVP exclusions
- User registration/sign-in, payments, subscription tiers and payment gateway.
- AI tutor, chatbot, recommendation algorithm or generated lesson text.
- Editable canvas architecture builder, actual Practice/quiz engine or published Cheatsheets content.
- Backend database, admin console, multi-tenant enterprise LMS.
- Browser speech synthesis: **reported dormant/disabled**, not an observed live feature.
- Live network performance measurement, load generation or security testing against real services; example metrics are simulated/illustrative.

### Decisions a product owner should lock before coding

1. Whether the goal is **functional equivalence and independent design** (recommended) versus licensed, close visual parity.
2. Whether to target **40 lesson topics** first or require full 445-step parity before release.
3. Which locales beyond English to ship in v1 (exact reference 21-language list is not established here).
4. Which renderer approach the engineering team will maintain (native TS/SVG or React shell with custom SVG renderer).
5. Whether to require fully offline PWA behavior (not a verified source feature).
6. Whether the site remains free/anonymous, or future auth/monetization is a separate roadmap.

### Accuracy caveats

- The independent audit may describe a specific November 2026 build; features may change afterwards.
- Exact module/lesson English labels and slugs are conceptual translations of the audit, not exact interface transcriptions.
- Exact visual dimensions, breakpoints, shortcuts beyond those reported, camera constants, node art and lesson text require reference UI/asset inspection.
- The user-provided hash URL points to HLD vs LLD by convention, but its exact step indexing and actual on-screen scene were not reproduced.
- This document is **complete as a requirements baseline and implementation blueprint**, **not complete as a proven exhaustive forensic reproduction of every screen and step**.

---

## 20. Sources and provenance

- **[S1]** Designed to Scale, public app and JavaScript fallback. https://designed-to-scale.vercel.app/  (accessed 20 Nov 2026)
- **[S2]** "No React, no Canvas: dissection of Designed to Scale’s native SVG isometric engine and 40-lesson system-design map" (Chinese), published 18 Nov 2026; reports headless-browser and production asset inspection. https://lijianfei.com/post/designed-to-scale-isometric-svg-engine/
- **[S3]** Creator Dilum Sanjaya, public announcement, 16 Nov 2026. https://www.nitter.cf/DilumSanjaya/status/2122373063560110320
- **[S4]** Independent learner summary from Kai (@hqmank), 18 Nov 2026. https://xitter.cf/hqmank/status/2123037878607589780

**Source handling:** External material was summarized and used as factual research; this document does not reproduce the original site's proprietary bundle, page artwork or full lessons. Requirements and example narratives are original working designs.

---

## Appendix A: Inspection and development checkpoints

- [ ] Freeze reference baseline and screenshots for version comparison.
- [ ] Verify exact displayed English course titles and 40 routes.
- [ ] Verify exact step count for each lesson and whether total is still 445.
- [ ] Record all 21 locale choices and theme/keyboard menus.
- [ ] Check `#/hld-lld/1` step semantics directly.
- [ ] Verify search ranking behavior and typo/alias results.
- [ ] Verify lesson completion and persisted-storage schema values.
- [ ] Verify tab placeholders and any shipped feature differences.
- [ ] Compare playback/pause/replay/zoom/fit/keyboard behavior.
- [ ] Approve original artwork and instructional copy.
- [ ] Approve renderer/state-machine proof of concept.
- [ ] Finish all P0 features and original 40-lesson content.
- [ ] Pass all UAT/E2E/accessibility/performance release gates.

## Appendix B: Change log

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-11-20 | Initial comprehensive discovery document, sourced external audit, full 40-topic map, target HLD/LLD lesson, renderer/search/localization/progress requirements, architecture and test plan |
