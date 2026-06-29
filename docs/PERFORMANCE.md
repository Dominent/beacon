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
- **`content-visibility` / containment** — applied *where it helps*: the **board** renders all cards (no virtualization), so `content-visibility: auto` + `contain-intrinsic-size` skip rendering off-screen cards; the **list** is already virtual-scrolled, so its rows use `contain: layout paint` for per-row isolation instead (content-visibility would be redundant there).
- **Efficient DOM updates** — `@for ... track` everywhere; the board is data-driven (no manual array mutation on drag).
- **No layout thrash** — the bar chart animates `transform: scaleX` (compositor-only, no layout/paint); CDK drag uses transforms, not `top/left`.
- **Sized placeholders** — `bc-skeleton` reserves final dimensions → CLS 0.

## How it's instrumented (and a caveat on numbers)

`web-vitals` is wired in [main.ts](../apps/beacon/src/main.ts) →
[web-vitals.ts](../apps/beacon/src/app/web-vitals.ts): `onLCP/onCLS/onINP` log
each metric (with its rating) to the console — swap the sink for
`navigator.sendBeacon('/rum', …)` to collect field data.

> ⚠️ **I'm not quoting headline CWV numbers, on purpose.** Anything I can measure
> here is a localhost, unthrottled dev-server read — that tells you the
> instrumentation works, *not* that the app is fast in the field. LCP≈FCP on
> localhost is the tell. Real numbers require **Lighthouse with 4× CPU / Slow-4G
> throttling** or **field RUM** (CrUX / the `web-vitals` beacon above) — happy to
> run that live during the walkthrough.
>
> What I'll stand behind without a number: **CLS is structurally 0** on the
> deferred charts because the `@defer` placeholders are sized (`bc-skeleton` +
> `contain-intrinsic-size`), so nothing reflows when content hydrates.

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
