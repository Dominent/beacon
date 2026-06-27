import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import { provideBeaconDataAccess } from '@beacon/data-access';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Incremental hydration: @defer (hydrate ...) blocks are SSR-rendered then
    // hydrated on their trigger, shrinking the initial hydration/JS work (INP/LCP).
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    // Bind route params/query directly to component inputs (used by the issue list filter).
    provideRouter(appRoutes, withComponentInputBinding()),
    // HttpClient (fetch) + functional interceptor chain. Base URL is absolute so SSR fetches work.
    provideBeaconDataAccess(),
  ],
};
