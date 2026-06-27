import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IssuesStore } from '@beacon/issues-data-access';
import { PriorityPill, StatusBadge } from '@beacon/ui';
import { Issue, IssueStatus } from '@beacon/util';

/**
 * Kanban board. Columns come from the store's `columns` computed (the same
 * filtered set the list uses). Drag-drop is purely DATA-driven: on drop we only
 * call `store.move()` — the optimistic patch re-renders the card into its new
 * column, so we never manually mutate arrays or fight CDK over the DOM.
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

  protected onDrop(event: CdkDragDrop<IssueStatus>): void {
    // Reordering within a column isn't persisted (no manual-order field).
    if (event.previousContainer === event.container) {
      return;
    }
    const issue = event.item.data as Issue;
    void this.store.move(issue.id, event.container.data);
  }
}
