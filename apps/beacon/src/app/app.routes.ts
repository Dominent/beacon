import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'issues' },
  {
    // Lazy, component-level code splitting — the issues feature is its own chunk.
    path: 'issues',
    loadComponent: () =>
      import('@beacon/issues-feature-list').then((m) => m.IssuesList),
  },
  {
    path: 'issues/:id',
    loadComponent: () =>
      import('@beacon/issues-feature-detail').then((m) => m.IssueDetail),
  },
  {
    path: 'board',
    loadComponent: () =>
      import('@beacon/issues-feature-board').then((m) => m.IssuesBoard),
  },
];
