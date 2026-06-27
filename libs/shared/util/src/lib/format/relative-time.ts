const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
  ['second', 1],
];

const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/**
 * Pure, locale-aware relative time ("3 minutes ago", "in 2 days"). Lives in
 * `util` so it stays Angular-free and unit-testable; the RelativeTimePipe is a
 * thin wrapper around it.
 */
export function relativeTime(value: string | number | Date, now: Date = new Date()): string {
  const date = value instanceof Date ? value : new Date(value);
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);

  for (const [unit, secondsInUnit] of UNITS) {
    if (Math.abs(diffSeconds) >= secondsInUnit || unit === 'second') {
      return formatter.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }
  return formatter.format(0, 'second');
}
