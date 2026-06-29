import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface BarDatum {
  label: string;
  value: number;
  /** CSS color or custom property; falls back to the accent token. */
  color?: string;
}

/**
 * Hand-rolled bar chart — no charting dependency (one fewer thing to justify,
 * smaller bundle). Bars animate via `transform: scaleX` (compositor-only), not
 * `width`, so updates never trigger layout/paint — zero layout thrash.
 */
@Component({
  selector: 'bc-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart">
      @for (d of data(); track d.label) {
        <div class="chart__row">
          <span class="chart__label">{{ d.label }}</span>
          <div class="chart__track">
            <div
              class="chart__fill"
              [style.transform]="'scaleX(' + fraction(d.value) + ')'"
              [style.background]="d.color || 'var(--bc-color-accent)'"
            ></div>
          </div>
          <span class="chart__value">{{ d.value }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .chart {
      display: flex;
      flex-direction: column;
      gap: var(--bc-space-2);
    }
    .chart__row {
      display: grid;
      grid-template-columns: 96px 1fr 32px;
      align-items: center;
      gap: var(--bc-space-3);
      font-size: var(--bc-font-size-sm);
    }
    .chart__label {
      color: var(--bc-color-text-muted);
    }
    .chart__track {
      height: 10px;
      border-radius: var(--bc-radius-pill);
      background: var(--bc-color-surface-hover);
      overflow: hidden;
    }
    .chart__fill {
      width: 100%;
      height: 100%;
      border-radius: var(--bc-radius-pill);
      transform-origin: left center;
      transition: transform 0.4s ease;
    }
    .chart__value {
      text-align: right;
      font-variant-numeric: tabular-nums;
      color: var(--bc-color-text);
    }
  `,
})
export class BarChart {
  readonly data = input.required<BarDatum[]>();

  private readonly max = computed(() =>
    Math.max(1, ...this.data().map((d) => d.value))
  );

  /** 0–1 scale factor for the bar's `scaleX`. */
  protected fraction(value: number): number {
    return value / this.max();
  }
}
