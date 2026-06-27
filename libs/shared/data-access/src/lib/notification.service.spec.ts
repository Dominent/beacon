import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = TestBed.inject(NotificationService);
  });

  it('starts empty', () => {
    expect(service.notifications()).toHaveLength(0);
  });

  it('adds an error notification and dismisses it by id', () => {
    service.error('boom');
    expect(service.notifications()).toHaveLength(1);
    expect(service.notifications()[0]).toMatchObject({ kind: 'error', message: 'boom' });

    service.dismiss(service.notifications()[0].id);
    expect(service.notifications()).toHaveLength(0);
  });

  it('assigns unique ids', () => {
    service.info('a');
    service.info('b');
    const [a, b] = service.notifications();
    expect(a.id).not.toBe(b.id);
  });
});
