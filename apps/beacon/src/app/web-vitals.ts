import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';

/**
 * Reports Core Web Vitals (LCP, CLS, INP) from real page lifecycle events.
 * Logs to the console for dev visibility — swap the sink for a RUM beacon
 * (`navigator.sendBeacon('/rum', ...)`) to collect field data in production.
 */
export function reportWebVitals(
  report: (metric: Metric) => void = (m) =>
    console.info(`[web-vitals] ${m.name}: ${Math.round(m.value * 100) / 100} (${m.rating})`)
): void {
  onLCP(report);
  onCLS(report);
  onINP(report);
}
