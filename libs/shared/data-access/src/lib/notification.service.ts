import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  kind: 'error' | 'info';
  message: string;
}

/**
 * Tiny transient-notification store. Plain signals — no RxJS, no store library —
 * because the state is trivial and read straight from a template.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private seq = 0;
  readonly notifications = signal<readonly Notification[]>([]);

  error(message: string): void {
    this.push('error', message);
  }

  info(message: string): void {
    this.push('info', message);
  }

  dismiss(id: number): void {
    this.notifications.update((list) => list.filter((n) => n.id !== id));
  }

  private push(kind: Notification['kind'], message: string): void {
    const id = ++this.seq;
    this.notifications.update((list) => [...list, { id, kind, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
