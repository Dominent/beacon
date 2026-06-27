import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

/**
 * Thin RxJS wrapper around the browser `EventSource`. SSE is a push stream over
 * time — RxJS's home turf — so it's modelled as an Observable and bridged into
 * signals at the call site via `toSignal`. No-ops during SSR.
 */
@Injectable({ providedIn: 'root' })
export class SseClient {
  private readonly base = inject(API_BASE_URL);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  connect<T>(path: string): Observable<T> {
    // Guard SSR and any environment without EventSource (e.g. jsdom under test).
    if (!this.isBrowser || typeof EventSource === 'undefined') {
      return EMPTY;
    }
    return new Observable<T>((subscriber) => {
      const source = new EventSource(`${this.base}${path}`);
      source.onmessage = (event) => {
        try {
          subscriber.next(JSON.parse(event.data) as T);
        } catch {
          /* ignore malformed frames (e.g. the initial `ready` event) */
        }
      };
      source.onerror = () => source.close();
      return () => source.close();
    });
  }
}
