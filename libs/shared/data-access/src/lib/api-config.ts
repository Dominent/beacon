import { InjectionToken } from '@angular/core';

/**
 * Origin of the Beacon API. Overridable per-environment via
 * `provideBeaconDataAccess(baseUrl)` — and importantly an absolute URL so the
 * same code works during SSR (where relative URLs have no origin).
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:3333',
});
