import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Sized placeholder used by `@defer` blocks and loading states. Reserving the
 * final dimensions up-front keeps Cumulative Layout Shift (CLS) at zero.
 */
@Component({
  selector: 'bc-skeleton',
  template: '',
  styleUrl: './skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bc-skeleton',
    role: 'presentation',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[style.border-radius]': 'radius()',
  },
})
export class Skeleton {
  readonly width = input('100%');
  readonly height = input('1rem');
  readonly radius = input('var(--bc-radius-sm)');
}
