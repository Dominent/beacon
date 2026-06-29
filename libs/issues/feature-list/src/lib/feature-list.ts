import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IssuesStore } from '@beacon/issues-data-access';
import { IssueCard } from '@beacon/issues-ui';
import { Button, Skeleton } from '@beacon/ui';
import {
  Issue,
  IssuePriority,
  IssueStatus,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  PRIORITY_LABELS,
  SortKey,
  STATUS_LABELS,
} from '@beacon/util';

/**
 * Smart list page. Holds NO state of its own — filter state lives in the store,
 * derived `visible` issues come from a computed signal. Typing updates a signal;
 * the store's `rxMethod` debounces + switchMaps the server call. CDK virtual
 * scroll renders ~15 rows regardless of result size.
 */
@Component({
  selector: 'bc-issues-list',
  imports: [ScrollingModule, RouterLink, Button, Skeleton, IssueCard],
  templateUrl: './feature-list.html',
  styleUrl: './feature-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuesList {
  protected readonly store = inject(IssuesStore);

  protected readonly statuses = ISSUE_STATUSES;
  protected readonly priorities = ISSUE_PRIORITIES;
  protected readonly skeletons = Array.from({ length: 8 }, (_, i) => i);

  protected statusLabel(status: IssueStatus): string {
    return STATUS_LABELS[status];
  }

  protected priorityLabel(priority: IssuePriority): string {
    return PRIORITY_LABELS[priority];
  }

  protected isStatusActive(status: IssueStatus): boolean {
    return this.store.filter().statuses.includes(status);
  }

  protected isPriorityActive(priority: IssuePriority): boolean {
    return this.store.filter().priorities.includes(priority);
  }

  protected onSearch(event: Event): void {
    this.store.setFilter({ search: (event.target as HTMLInputElement).value });
  }

  protected toggleStatus(status: IssueStatus): void {
    this.store.setFilter({ statuses: toggle(this.store.filter().statuses, status) });
  }

  protected togglePriority(priority: IssuePriority): void {
    this.store.setFilter({ priorities: toggle(this.store.filter().priorities, priority) });
  }

  /** Sort indicator for a column header: ▲ asc, ▼ desc, blank when inactive. */
  protected sortArrow(key: SortKey): string {
    const sort = this.store.sort();
    if (sort.key !== key) return '';
    return sort.dir === 'asc' ? ' ▲' : ' ▼';
  }

  protected readonly trackById = (_: number, issue: Issue) => issue.id;
}

function toggle<T>(values: readonly T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];
}
