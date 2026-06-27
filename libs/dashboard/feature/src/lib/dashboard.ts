import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DashboardService } from '@beacon/dashboard-data-access';
import { BarChart, BarDatum, RelativeTimePipe, Skeleton, StatusBadge } from '@beacon/ui';
import {
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from '@beacon/util';

@Component({
  selector: 'bc-dashboard',
  imports: [BarChart, Skeleton, StatusBadge, RelativeTimePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected readonly service = inject(DashboardService);

  protected readonly statusData = computed<BarDatum[]>(() => {
    const stats = this.service.stats();
    if (!stats) return [];
    return ISSUE_STATUSES.map((status) => ({
      label: STATUS_LABELS[status],
      value: stats.byStatus[status] ?? 0,
      color: `var(--bc-status-${status})`,
    }));
  });

  protected readonly priorityData = computed<BarDatum[]>(() => {
    const stats = this.service.stats();
    if (!stats) return [];
    return ISSUE_PRIORITIES.map((priority) => ({
      label: PRIORITY_LABELS[priority],
      value: stats.byPriority[priority] ?? 0,
      color: `var(--bc-priority-${priority})`,
    }));
  });

  protected readonly openCount = computed(() => {
    const stats = this.service.stats();
    return stats ? stats.total - (stats.byStatus.done ?? 0) : 0;
  });
}
