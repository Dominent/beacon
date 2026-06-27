import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SseClient } from '@beacon/data-access';
import { Issue, IssueStats } from '@beacon/util';
import {
  debounceTime,
  filter,
  merge,
  of,
  scan,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
import { StatsApi } from './stats-api';

/**
 * Dashboard read-model. Deliberately a SERVICE with plain signals (not a
 * SignalStore): there's no entity collection, no optimistic writes — just two
 * read-only derived streams. RxJS does the heavy lifting (merge / debounce /
 * switchMap / scan), then `toSignal` hands the template plain signals.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(StatsApi);
  private readonly sse = inject(SseClient);

  private readonly live$ = this.sse
    .connect<{ type: string; issue: Issue }>('/api/events')
    .pipe(
      filter((event) => !!event?.issue),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  /** Stats snapshot, refetched (debounced) whenever the live stream ticks. */
  readonly stats = toSignal<IssueStats | null>(
    merge(of(null), this.live$.pipe(debounceTime(1000))).pipe(
      switchMap(() => this.api.get())
    ),
    { initialValue: null }
  );

  /** Rolling feed of the last 8 issues touched by the live stream. */
  readonly activity = toSignal(
    this.live$.pipe(
      scan((acc, event) => [event.issue, ...acc].slice(0, 8), [] as Issue[]),
      startWith([] as Issue[])
    ),
    { initialValue: [] as Issue[] }
  );
}
