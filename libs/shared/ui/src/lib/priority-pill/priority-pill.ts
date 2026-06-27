import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IssuePriority, PRIORITY_LABELS } from '@beacon/util';

@Component({
  selector: 'bc-priority-pill',
  template: `{{ label() }}`,
  styleUrl: './priority-pill.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bc-priority-pill',
    '[style.--hue]': 'color()',
  },
})
export class PriorityPill {
  readonly priority = input.required<IssuePriority>();

  protected readonly label = computed(() => PRIORITY_LABELS[this.priority()]);
  protected readonly color = computed(() => `var(--bc-priority-${this.priority()})`);
}
