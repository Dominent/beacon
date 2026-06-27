import { Pipe, PipeTransform } from '@angular/core';
import { relativeTime } from '@beacon/util';

/**
 * Pure pipe (the default) — memoized by Angular on its input, so it recomputes
 * only when the timestamp reference changes, not on every change-detection pass.
 */
@Pipe({ name: 'bcRelativeTime' })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | number | Date | null | undefined): string {
    return value ? relativeTime(value) : '';
  }
}
