import { computed, inject } from '@angular/core';
import { SseClient } from '@beacon/data-access';
import {
  EMPTY_FILTER,
  filterIssues,
  isActive,
  Issue,
  IssueFilter,
  IssueStatus,
  ISSUE_STATUSES,
  sortByPriority,
  STATUS_LABELS,
} from '@beacon/util';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  setAllEntities,
  updateEntity,
  upsertEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  firstValueFrom,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { IssuesApi } from './issues-api';

interface IssuesState {
  filter: IssueFilter;
  loading: boolean;
  loaded: boolean;
}

/**
 * Why a SignalStore here (and not a plain signal service)?
 *  - an entity COLLECTION with derived selectors (board columns, open count)
 *  - OPTIMISTIC writes with rollback
 *  - shared across the list, the board and the detail page
 * That's exactly the shape a store is for. RxJS earns its place inside
 * `rxMethod`: debounced, cancellable server search (debounceTime + switchMap)
 * and the SSE live stream — both bridged to signals by `rxMethod`.
 */
export const IssuesStore = signalStore(
  { providedIn: 'root' },
  withEntities<Issue>(),
  withState<IssuesState>({ filter: EMPTY_FILTER, loading: false, loaded: false }),
  withComputed((store) => {
    // One client-side filter pass feeds BOTH the list and the board, and guards
    // the view against live SSE upserts that don't match the active filter.
    const filtered = computed(() => filterIssues(store.entities(), store.filter()));
    return {
      visible: computed(() => sortByPriority(filtered())),
      openCount: computed(() => filtered().filter(isActive).length),
      columns: computed(() =>
        ISSUE_STATUSES.map((status) => ({
          status,
          label: STATUS_LABELS[status],
          issues: filtered().filter((issue) => issue.status === status),
        }))
      ),
    };
  }),
  withMethods((store, api = inject(IssuesApi), sse = inject(SseClient)) => ({
    setFilter(partial: Partial<IssueFilter>): void {
      patchState(store, { filter: { ...store.filter(), ...partial } });
    },

    /** Reactive, debounced, cancellable load — fed the filter SIGNAL on init. */
    load: rxMethod<IssueFilter>(
      pipe(
        debounceTime(250),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        tap(() => patchState(store, { loading: true })),
        switchMap((filter) =>
          api.list(filter).pipe(
            tap((issues) =>
              patchState(store, setAllEntities(issues), { loading: false, loaded: true })
            ),
            catchError(() => {
              patchState(store, { loading: false });
              return EMPTY;
            })
          )
        )
      )
    ),

    /** Merge server-pushed updates (SSE) into the entity map. */
    connectLive: rxMethod<void>(
      pipe(
        switchMap(() => sse.connect<{ type: string; issue: Issue }>('/api/events')),
        tap((event) => {
          if (event?.issue) {
            patchState(store, upsertEntity(event.issue));
          }
        })
      )
    ),

    /** Optimistic status change with rollback on failure. */
    async move(id: string, status: IssueStatus): Promise<void> {
      const current = store.entityMap()[id];
      if (!current || current.status === status) {
        return;
      }
      patchState(store, updateEntity({ id, changes: { status } }));
      try {
        await firstValueFrom(api.patch(id, { status }));
      } catch {
        patchState(store, updateEntity({ id, changes: { status: current.status } }));
      }
    },
  })),
  withHooks({
    onInit(store) {
      // rxMethod accepts a Signal → re-runs (debounced) whenever the filter changes.
      store.load(store.filter);
      store.connectLive();
    },
  })
);
