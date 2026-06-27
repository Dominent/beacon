import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { API_BASE_URL } from './api-config';
import { baseUrlInterceptor } from './interceptors/base-url.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

/**
 * Single composition-root entry that wires the data-access layer: HttpClient
 * with `fetch` (SSR-friendly + supports request abortion) and the functional
 * interceptor chain. The app calls this once in `app.config.ts`.
 */
export function provideBeaconDataAccess(baseUrl?: string): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(
      withFetch(),
      withInterceptors([baseUrlInterceptor, errorInterceptor])
    ),
    ...(baseUrl ? [{ provide: API_BASE_URL, useValue: baseUrl }] : []),
  ]);
}
