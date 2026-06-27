import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Attribute-selector button so consumers keep native `<button>` semantics:
 *   <button bc-button variant="primary">Save</button>
 */
@Component({
  selector: 'button[bc-button]',
  template: `<ng-content />`,
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"bc-button bc-button--" + variant()',
    '[attr.data-size]': 'size()',
  },
})
export class Button {
  readonly variant = input<'primary' | 'ghost' | 'danger'>('primary');
  readonly size = input<'sm' | 'md'>('md');
}
