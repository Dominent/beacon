# Performance & Core Web Vitals

How Beacon addresses runtime performance and Core Web Vitals (INP, CLS, LCP),
how to analyze them, and what was measured.

## Change detection — the foundation

Beacon is **zoneless** (`provideZonelessChangeDetection` is the default in this
Angular 21 app; zone.js is absent from the bundle). Change detection is driven by
**signal reads in templates + bound events**, not a global zone-triggered tree
walk after every async task.

- **Old model:** zone.js monkey-patches async APIs; after any async event Angular
  dirty-checks from the root. `OnPush` prunes branches whose `@Input` refs are
  unchanged.
- **Zoneless (here):** no monkey-patching, ~13 kB smaller, and CD runs are
  targeted to components whose signals changed → fewer long tasks → better **INP**.

Every component is `ChangeDetectionStrategy.OnPush` and reads signals, so it's
CD-correct by construction.

## Core Web Vitals: cause → fix in Beacon

| Metric | What hurts it | What Beacon does |
|---|---|---|
| **LCP** | Late hero render, render-blocking JS | SSR (`@angular/ssr`) renders content server-side; small initial bundle; lazy routes keep the critical path short |
| **CLS** | Unsized/late-injected content | Every `@defer` block has a **sized** `@placeholder`/`@loading` skeleton (`bc-skeleton` with explicit height) → no reflow when content arrives |
| **INP** | Long main-thread tasks on interaction | Zoneless (less CD work), `@defer` shrinks initial work, CDK **virtual scroll** keeps the issue list at ~16 DOM nodes, signal updates touch only affected views |
| **TBT / bundle** | Big initial JS | Route-level lazy loading + **deferrable views**; charts never enter the initial bundle |

## Techniques applied (with locations)

- **Lazy routes** — every feature via `loadComponent` ([app.routes.ts](../apps/beacon/src/app/app.routes.ts)); the issues feature is a separate chunk from the shell.
- **Deferrable views** — `@defer (on viewport; hydrate on viewport)` around the dashboard charts ([dashboard.html](../libs/dashboard/feature/src/lib/dashboard.html)); the chart code is a distinct lazy chunk.
- **Incremental hydration** — `withIncrementalHydration()` ([app.config.ts](../apps/beacon/src/app/app.config.ts)); deferred blocks are SSR-rendered then hydrated on viewport, cutting initial hydration/JS work.
- **Virtual scroll** — CDK `*cdkVirtualFor` over the issue list ([feature-list.html](../libs/issues/feature-list/src/lib/feature-list.html)); ~16 rows rendered regardless of result count.
- **Efficient DOM updates** — `@for ... track` everywhere; the board is data-driven (no manual array mutation on drag).
- **No layout thrash** — bar chart animates `width` only; CDK drag uses transforms (compositor), not `top/left`.
- **Sized placeholders** — `bc-skeleton` reserves final dimensions → CLS 0.

## Measured (local dev server, dashboard route)

> Local, unthrottled numbers — illustrative of the techniques, **not** production
> field data. Real numbers need Lighthouse / throttling / field RUM.

| Metric | Value | "Good" threshold |
|---|---|---|
| LCP | ~92 ms | < 2500 ms |
| CLS | **0** | < 0.1 |
| FCP | ~92 ms | < 1800 ms |
| TTFB | ~53 ms | < 800 ms |
| Dashboard route JS (transfer) | ~33 kB | — |

CLS 0 is the headline: the sized `@defer` skeletons mean the charts don't shift
the layout when they hydrate.

## Before / after (the argument)

- **Eager dashboard charts** → chart code in the initial bundle, parsed/executed
  before first paint, hydrated up-front. **Deferred + hydrate-on-viewport** →
  charts excluded from the initial bundle and only hydrated when scrolled to,
  reducing initial JS execution (INP/TBT) with zero CLS thanks to the placeholder.
- **Zone-based** → CD after every async task. **Zoneless** → CD only on signal
  change/events, plus a smaller bundle.

## How to analyze

- **Lighthouse** (LCP/CLS/TBT) and the **DevTools Performance panel** (long-task
  flame chart) to find INP offenders.
- **`web-vitals`** library wired to log field-style metrics (LCP/CLS/INP).
- **`PerformanceObserver`** (`largest-contentful-paint`, `layout-shift`) for ad-hoc
  measurement — used to capture the numbers above.
- **Bundle attribution** — `nx build beacon --stats-json` + `source-map-explorer`
  (or the esbuild metafile) to see what's in each chunk.
