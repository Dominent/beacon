import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IssuesStore } from '@beacon/issues-data-access';
import { Button, PriorityPill, RelativeTimePipe, StatusBadge } from '@beacon/ui';
import { IssueStatus, ISSUE_STATUSES, STATUS_LABELS } from '@beacon/util';

/**
 * Detail page. `id` is bound straight from the `:id` route param via
 * `withComponentInputBinding()` — no manual ActivatedRoute plumbing. The issue
 * is read from the shared store (instant if already loaded, and it stays live
 * via SSE). Status changes are optimistic with rollback (see store.move).
 */
@Component({
  selector: 'bc-issue-detail',
  imports: [RouterLink, Button, PriorityPill, StatusBadge, RelativeTimePipe],
  templateUrl: './feature-detail.html',
  styleUrl: './feature-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueDetail {
  readonly id = input.required<string>();

  private readonly store = inject(IssuesStore);

  protected readonly statuses = ISSUE_STATUSES;
  protected readonly issue = computed(() => this.store.entityMap()[this.id()]);
  /** Distinguish "still loading" from "loaded, but no such issue" (404). */
  protected readonly notFound = computed(
    () => this.store.loaded() && !this.issue()
  );

  protected statusLabel(status: IssueStatus): string {
    return STATUS_LABELS[status];
  }

  protected changeStatus(status: IssueStatus): void {
    void this.store.move(this.id(), status);
  }
}
