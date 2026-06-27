import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PriorityPill, RelativeTimePipe, StatusBadge, Tooltip } from '@beacon/ui';
import { Issue } from '@beacon/util';

/**
 * Pure presentational row. No router, no store — the feature decides what a
 * click means. Reused by the list (virtual scrolled) and could back the board.
 */
@Component({
  selector: 'bc-issue-card',
  imports: [StatusBadge, PriorityPill, RelativeTimePipe, Tooltip],
  templateUrl: './issue-card.html',
  styleUrl: './issue-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueCard {
  readonly issue = input.required<Issue>();
}
