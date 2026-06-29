import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IssuesStore } from '@beacon/issues-data-access';
import { PriorityPill, StatusBadge } from '@beacon/ui';
import { Issue, ISSUE_STATUSES, IssueStatus, STATUS_LABELS } from '@beacon/util';

/**
 * Kanban board. Columns come from the store's `columns` computed (the same
 * filtered set the list uses). Drag-drop is purely DATA-driven: on drop we only
 * call `store.move()` — the optimistic patch re-renders the card into its new
 * column, so we never manually mutate arrays or fight CDK over the DOM.
 *
 * Accessible: cards are focusable and movable with ←/→ (a keyboard-only
 * alternative to drag), with each move announced to assistive tech.
 */
@Component({
  selector: 'bc-issues-board',
  imports: [DragDropModule, RouterLink, PriorityPill, StatusBadge],
  templateUrl: './feature-board.html',
  styleUrl: './feature-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuesBoard {
  protected readonly store = inject(IssuesStore);
  private readonly announcer = inject(LiveAnnouncer);

  protected onDrop(event: CdkDragDrop<IssueStatus>): void {
    // Reordering within a column isn't persisted (no manual-order field).
    if (event.previousContainer === event.container) {
      return;
    }
    const issue = event.item.data as Issue;
    void this.moveTo(issue, event.container.data);
  }

  /** Keyboard alternative to drag: ←/→ moves the focused card between columns. */
  protected onCardKeydown(event: KeyboardEvent, issue: Issue): void {
    const direction =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!direction) {
      return;
    }
    event.preventDefault();
    const next = ISSUE_STATUSES[ISSUE_STATUSES.indexOf(issue.status) + direction];
    if (next) {
      void this.moveTo(issue, next);
    }
  }

  private async moveTo(issue: Issue, status: IssueStatus): Promise<void> {
    if (issue.status === status) {
      return;
    }
    await this.store.move(issue.id, status);
    void this.announcer.announce(`${issue.key} moved to ${STATUS_LABELS[status]}`);
  }

  protected ariaLabel(issue: Issue): string {
    return `${issue.key}: ${issue.title}. ${STATUS_LABELS[issue.status]}. Use left and right arrows to move.`;
  }
}
