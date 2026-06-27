import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // SSR on demand: these routes fetch live data, so they render per-request
    // rather than being prerendered at build time (when the API isn't running).
    // P4 revisits this with selective prerender + incremental hydration.
    path: '**',
    renderMode: RenderMode.Server,
  },
];
