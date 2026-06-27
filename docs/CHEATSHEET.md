# Q&A Cheat-Sheet — ecosystem & fundamentals

Prep for the "be ready to discuss the wider ecosystem" part of the interview.
Terse on purpose — talking points, not essays.

## Angular ecosystem

- **Signals** — fine-grained reactive primitives (`signal`, `computed`, `effect`,
  `linkedSignal`, `resource`). Glitch-free, lazy, pull-based. Replace most
  `BehaviorSubject` + `async` pipe usage.
- **Zoneless** — stable in v20/21. CD scheduled by signal changes / events /
  `markForCheck`, not zone.js. Drops zone.js; better INP; requires OnPush-friendly
  patterns (which signals give for free).
- **New control flow** — `@if/@for/@switch` (built-in, no `*ngIf`), `@defer` for
  deferrable views, `@let` for template locals. `@for` requires `track`.
- **Hydration** — full, then **incremental** (`@defer (hydrate ...)`) and event
  replay. Reduces TBT/INP by deferring JS work.
- **DI** — `inject()`, functional guards/resolvers/interceptors, `provideX()`
  pattern, `EnvironmentProviders`, injection tokens with `factory`.
- **State libraries** — NgRx (classic Redux), **NgRx SignalStore** (signal-native,
  no boilerplate), Elf, `@rx-angular/state`. Pick by need: entities/optimistic →
  store; scalars → signals service.
- **RxJS still matters** for: debounce/throttle, cancellation (`switchMap`), retry,
  combining streams, websockets/SSE. Bridge with `toSignal`/`toObservable`/`rxMethod`.
- **Standalone** is the default; NgModules effectively legacy.

## Browser / web platform

- **Event loop** — call stack → microtasks (Promises, `queueMicrotask`,
  `MutationObserver`) drained fully → one macrotask (timers, events, I/O) →
  render. `requestAnimationFrame` runs before paint; `requestIdleCallback` when idle.
- **Rendering pipeline** — JS → Style → Layout → Paint → Composite. Mutating
  geometry (`top/left/width`) triggers Layout (reflow); `transform`/`opacity` stay
  on the **compositor** (cheap). Reading layout after writing = forced
  synchronous reflow ("layout thrash") → batch reads then writes.
- **Core Web Vitals** — **LCP** < 2.5 s (largest element paint), **CLS** < 0.1
  (unexpected layout shift), **INP** < 200 ms (interaction→next-paint; replaced FID
  in 2024). Field data (CrUX/RUM) vs lab (Lighthouse).
- **Networking** — HTTP/2 multiplexing, HTTP/3 over QUIC; `preconnect`/`preload`/
  `dns-prefetch`; caching via `Cache-Control`/`ETag`; SSE (one-way, auto-reconnect)
  vs WebSocket (bidirectional).
- **Security** — CSP, CORS, SameSite cookies, XSS/CSRF, Subresource Integrity.

## JavaScript

- **Concurrency** — single-threaded + event loop; Web Workers for parallelism;
  microtask vs macrotask ordering.
- **Closures, prototypes, `this`** — lexical scope; prototype chain; `this` by
  call-site (arrow = lexical).
- **Modules** — ESM (static, tree-shakeable, async) vs CommonJS (dynamic,
  synchronous `require`); dual-package hazards.
- **Memory** — GC by reachability; leaks from lingering listeners, closures,
  detached DOM, unbounded caches. (`DestroyRef`/`takeUntilDestroyed` in Angular.)
- **Equality/coercion**, `Map/Set/WeakMap`, generators, `structuredClone`.

## TypeScript

- **Structural typing** (shape, not name). `interface` (declaration-merge,
  extends) vs `type` (unions/intersections/mapped). `satisfies` to validate
  without widening.
- **Generics**, conditional/mapped/template-literal types, `infer`, utility types
  (`Partial`, `Record`, `Pick`, `ReturnType`, `Parameters`).
- **Strictness** — `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- **moduleResolution** — `node10` (legacy) can't read `exports` maps; `node16`/
  `nodenext` honor them and pair with the matching `module`; `bundler` for
  bundled apps. (Hit this authoring the Nx plugin — needed `node16`.)
- Types are erased — no runtime guarantees; validate external data (zod, etc.).

## Package managers

- **npm** — flat `node_modules`, `package-lock.json`. **yarn** (Berry: PnP,
  zero-installs). **pnpm** — **content-addressable global store** + symlinked
  `node_modules`; strict (no phantom deps), fast, disk-efficient. **bun** — fast
  all-in-one.
- **Workspaces / monorepos** — `pnpm-workspace.yaml`; hoisting vs isolation;
  `workspace:*` protocol; lockfile is the source of truth (`--frozen-lockfile` in CI).
- **Dependency types** — deps vs devDeps vs **peerDependencies** (host provides;
  Angular libs peer-depend on `@angular/core`) vs optional.
- **SemVer** — `^` minor, `~` patch; overrides/resolutions to pin transitive deps.

## AI in the dev workflow

- **LLM-assisted coding** — Claude Code / Copilot / Cursor; agentic loops (plan →
  edit → run → verify); MCP for tool/context integration.
- **RAG** — embeddings + vector search to ground answers; chunking, hybrid
  (vector + keyword) retrieval, re-ranking.
- **Patterns** — structured output (JSON schema / tool use), evals, prompt caching,
  guardrails/grounding, cross-model verification.
- **In Angular** — could add an AI "summarize this thread" panel behind a `@defer`
  block; kept out of Beacon to stay focused on the Angular/Nx rubric.

## Nx — quick facts

- **Computation caching** keyed on hash(inputs + task). **Affected** from the
  project graph + git base. **Crystal** = inference plugins (`createNodesV2`).
- **Cache pitfalls** — wrong `outputs` (nothing restored), under-specified
  `inputs` (stale hits), non-deterministic builds (thrash), caching side effects.
- **Nx Cloud** — remote cache shared across machines + **DTE / Nx Agents**
  (distributed, atomized e2e, flaky retry). Free Hobby tier covers a solo repo.
