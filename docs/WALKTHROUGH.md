# Beacon — Walkthrough & Q/A Map

A guide for presenting Beacon: the narrative arc, then each likely question
mapped to the exact file to open and the answer to give.

---

## The narrative (≈15 min)

1. **The domain (1 min).** "It's an issue tracker — boards, a filterable list,
   detail, a dashboard. Small on purpose: I wanted every decision to be
   defensible, not a big surface I can't account for."
2. **The graph (3 min).** Open `pnpm nx graph`. Walk the `domain × layer`
   structure. Show the tag boundaries in [eslint.config.mjs](../eslint.config.mjs).
   Run a probe import to make lint fail live → "this is how 10 devs stay
   consistent."
3. **Data flow (3 min).** Open the issues list. "Data enters as streams, is
   normalized into signal state once, the template only reads signals." Show
   `IssuesStore`, the debounced `rxMethod`, the SSE merge.
4. **The Signals/RxJS boundary (2 min).** Contrast `IssuesStore` (store) with
   `SettingsService` / `DashboardService` (plain-signals services).
5. **Performance (3 min).** Zoneless bootstrap; `@defer` charts; CDK virtual
   scroll; the measured CWV table in [PERFORMANCE.md](PERFORMANCE.md).
6. **Nx productivity (3 min).** The local plugin: generate a feature live, show
   the inferred `size-check` target, the caching config.

---

## Q/A map — question → where to look

### The brief's explicit questions

**"Why Signals over RxJS here?"**
→ [issues-store.ts](../libs/issues/data-access/src/lib/issues-store.ts). Signals
own state and derived views (`visible`, `columns`, `openCount` are `computed`).
RxJS appears only inside `rxMethod`: the **debounced, cancellable** server search
(`debounceTime` + `switchMap`) and the **SSE** push stream. The bridge is
`rxMethod`/`toSignal`, used at exactly those seams.

**"Why a Service over a Store there?"**
→ [settings.service.ts](../libs/shared/data-access/src/lib/settings.service.ts)
and [dashboard-service.ts](../libs/dashboard/data-access/src/lib/dashboard-service.ts).
No entity collection, no optimistic writes — just scalars / read-only derived
streams. A SignalStore would be ceremony. The issues domain earns a store because
it has an entity map + optimistic `move` + shared consumers.

**"Explain your mental model: API → template."**
→ HttpClient/SSE (Observables) → normalized once into the SignalStore (signals +
`computed`) → the template only reads signals. Under zoneless, CD is *pull-based
off signal reads*, not a global tree walk.

**"How does this scale to 100+ routes / 10 devs?"**
→ The graph + tag boundaries + the `feature` generator. New feature = a new
`feature-*` lib (the generator tags it correctly by construction); it composes
existing `ui` + `data-access`; it can't reach into another domain. Lazy routes
keep route count free of bundle cost.

### Angular

**"Explain ChangeDetection."**
→ [app.config.ts](../apps/beacon/src/app/app.config.ts) (zoneless). Old model:
zone.js patches async APIs → dirty-check the tree; `OnPush` prunes unchanged
branches. Zoneless: no patching, CD scheduled on signal change / events →
targeted, fewer long tasks, smaller bundle. Signals make components OnPush-correct
by default.

**"Show idiomatic DI / Pipes / Directives / Routing."**
→ DI: `inject()`, functional interceptors
([base-url.interceptor.ts](../libs/shared/data-access/src/lib/interceptors/base-url.interceptor.ts)),
`provideBeaconDataAccess()`. Pipe:
[relative-time.pipe.ts](../libs/shared/ui/src/lib/pipes/relative-time.pipe.ts)
(pure). Directive:
[tooltip.directive.ts](../libs/shared/ui/src/lib/directives/tooltip.directive.ts)
(Renderer2, host listeners, `ngOnDestroy`). Routing: lazy `loadComponent`,
`withComponentInputBinding()` binds `:id` straight to a signal input
([feature-detail.ts](../libs/issues/feature-detail/src/lib/feature-detail.ts)).

**"Optimistic updates?"**
→ `IssuesStore.move`: `patchState(updateEntity(...))` immediately, `await` the
PATCH, roll back on failure. Demoed on the detail page and the board drop.

### Performance

**"Bundle optimization?"**
→ Lazy routes ([app.routes.ts](../apps/beacon/src/app/app.routes.ts)) +
deferrable views ([dashboard.html](../libs/dashboard/feature/src/lib/dashboard.html)
`@defer`). `nx build beacon --stats-json` to attribute chunks. The `size-check`
executor enforces a budget in CI.

**"Core Web Vitals — what hurts them, how to analyze, how to improve?"**
→ [PERFORMANCE.md](PERFORMANCE.md): the cause→fix table, measured numbers
(LCP ~92 ms, **CLS 0**), and the analysis toolkit (Lighthouse, DevTools, web-vitals,
`PerformanceObserver`). CLS 0 because every `@defer` placeholder is sized.

**"Rendering performance / layout thrashing?"**
→ CDK virtual scroll keeps the list at ~16 DOM nodes; `@for; track`; the board is
data-driven (no array mutation); bars and drag animate transform/width
(compositor), not `top/left`.

### Nx

**"Library structure & boundaries?"**
→ The graph + [eslint.config.mjs](../eslint.config.mjs) `depConstraints`. Live
probe to show the lint failure.

**"Developer productivity / automation — custom executors, task inference?"**
→ The local plugin under [libs/plugin](../libs/plugin):
- **Generator** `@beacon/plugin:feature` — scaffolds a tagged feature lib.
- **Executor** `@beacon/plugin:size-check` — budget gate (cacheable target).
- **Inference** `createNodesV2` — a `size-budget.json` *infers* a `size-check`
  target with no `project.json` edits.

**"How does caching work? Pitfalls? How to tune?"**
→ [nx.json](../nx.json) `namedInputs`. The `production` input excludes specs/md
so changing a test doesn't bust the build cache. Pitfalls to name: wrong
`outputs` (silent cache misses), under-specified `inputs` (stale/false hits),
non-determinism (thrash), caching side-effecting tasks. `nx reset` clears.

**"CI/CD and Nx Cloud?"**
→ [.github/workflows/ci.yml](../.github/workflows/ci.yml): `nx affected` +
`nx-set-shas`; `size-check` runs in the pipeline. **Nx Cloud** (free Hobby tier)
adds the shared remote cache + distributed task execution; the `start-ci-run`
line is staged. Talking point: a self-hosted cache (`actions/cache`) is
branch-scoped and can't be read by local dev — which is *why* the managed remote
cache exists (and the free self-hosted plugins were deprecated May 2026 after
CVE-2025-36852).

**"Nx Agents / task-graph optimization for execution speed?"** *(Nx role)*
→ CI wall-clock = critical path of the task graph across N agents. Shorten it by:
(1) cache hit rate via correct inputs, (2) **atomize** long tasks so they shard
(`@nx/playwright` e2e atomizer), (3) remove false `dependsOn` serialization,
(4) right-size `--distribute-on` to the graph's parallel width. Read the Nx Cloud
Gantt to find idle agents / long-pole tasks / cache misses.
