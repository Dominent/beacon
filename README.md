# Beacon — an Angular + Nx showcase

A small but deliberately-built **issue tracker**, used to showcase modern Angular
(21, **zoneless**, signals) inside a scalable **Nx 23** monorepo. The app is
intentionally modest in surface so that *every architectural decision is
explainable* — which is the point of the exercise.

> Built for the Push-Based technical interview. See
> [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md) for the guided tour and Q&A map,
> and [docs/PERFORMANCE.md](docs/PERFORMANCE.md) for the Core Web Vitals story.

---

## Quick start

```sh
pnpm install

# Terminal 1 — the mock API (REST + SSE) on :3333
pnpm nx serve api          # or: node dist/apps/api/main.js after `nx build api`

# Terminal 2 — the Angular app (SSR) on :4200
pnpm nx serve beacon
```

Open http://localhost:4200 → Issues list, Board, Detail, Dashboard.

Everyday commands:

```sh
pnpm nx run-many -t lint test build   # everything
pnpm nx affected -t lint test build   # only what changed
pnpm nx graph                          # explore the project graph
pnpm nx g @beacon/plugin:feature --domain=issues --name=timeline   # scaffold a feature
```

---

## Architecture at a glance

A **domain × layer** library structure with **lint-enforced** boundaries.

```
apps/
  beacon        # thin SSR shell: routes, providers, layout
  api           # express mock API (REST + aggregates + SSE)
libs/
  issues/       feature-list · feature-detail · feature-board · data-access · ui
  dashboard/    feature · data-access
  shared/       ui (design system) · data-access (http/sse/settings) · util (model)
  plugin/       local Nx plugin (generator + executor + inference)
```

Two tag dimensions drive the rules (see [eslint.config.mjs](eslint.config.mjs)):

- **type:** `app → feature → ui / data-access → util` — a `ui` lib physically
  cannot import a store; lint fails in CI if it tries.
- **scope:** `issues`, `dashboard`, `shared`, `shell` — domains are isolated;
  cross-domain reuse only goes through `shared`.

```mermaid
flowchart TD
  app["type:app<br/>(beacon shell)"] --> feature["type:feature"]
  feature --> ui["type:ui"]
  feature --> da["type:data-access"]
  feature --> util["type:util"]
  ui --> util
  da --> util
  classDef l fill:#1e293b,stroke:#475569,color:#e2e8f0;
  class app,feature,ui,da,util l;
```

Arrows are the *only* allowed dependencies. `ui → data-access` is absent by
design — and enforced. That single ruleset is the answer to *"how does this
scale to 100+ routes and 10 developers?"* — run `pnpm nx graph` to explore the
full project graph interactively.

| Boundary rule | Proven by |
|---|---|
| `ui` cannot depend on `data-access` | lint error on a probe import |
| `dashboard` cannot import `issues` | lint error on a probe import |

---

## Key decisions (the "why")

| Decision | Why |
|---|---|
| **Zoneless** change detection | No zone.js (~13 kB lighter); CD driven by signal reads + events → fewer long tasks, better INP |
| **NgRx SignalStore** for issues | Entity collection + derived selectors + optimistic writes shared across list/board/detail — what a store is *for* |
| **Plain-signals service** for dashboard & settings | Read-only derived state / two scalars — a store would be ceremony |
| **RxJS** only for typeahead + SSE | Debounce/cancellation and push-streams are RxJS's home turf; bridged to signals via `rxMethod`/`toSignal` |
| **SSR + incremental hydration** | Real LCP/INP story; `@defer (hydrate on viewport)` charts |
| **SCSS design tokens** (no Tailwind) | Semantic CSS custom properties → runtime theming as a data-attribute swap; `ui` libs stay framework-pure |
| **Angular 21, not 22** | `@nx/angular@23` + `@ngrx/signals@21` peer-cap at Angular 21; "latest" is a property of the whole dependency graph |

---

## What's demonstrated

- **Architecture** — layered libs, enforced boundaries, standalone + `inject()`,
  lazy routes, custom **pipe** (`bcRelativeTime`) & **directive** (`bcTooltip`).
- **Reactivity & state** — Signals, `computed`, `effect`, NgRx SignalStore, RxJS
  (`debounceTime`/`switchMap`/`scan`), the Signals↔RxJS bridge.
- **Performance** — zoneless CD, `@defer`, lazy loading, CDK virtual scroll,
  `@for; track`, sized placeholders (CLS 0). See [docs/PERFORMANCE.md](docs/PERFORMANCE.md).
- **Nx** — domain/layer libraries, tag boundaries, a local **plugin**
  (generator + executor + **task inference**), cache-correct inputs, `affected`
  CI. See [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md#nx).

---

## Stack

Angular 21.2 (zoneless, SSR) · Nx 23.0.1 · NgRx Signals 21 · Angular CDK 21 ·
TypeScript 5.9 · Vitest · Playwright · express · pnpm.
