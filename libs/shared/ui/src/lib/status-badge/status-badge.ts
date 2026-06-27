import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IssueStatus, STATUS_LABELS } from '@beacon/util';

@Component({
  selector: 'bc-status-badge',
  template: `<span class="dot" aria-hidden="true"></span>{{ label() }}`,
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bc-status-badge',
    '[style.--dot]': 'color()',
  },
})
export class StatusBadge {
  readonly status = input.required<IssueStatus>();

  protected readonly label = computed(() => STATUS_LABELS[this.status()]);
  protected readonly color = computed(() => `var(--bc-status-${this.status()})`);
}
