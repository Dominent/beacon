import { TestBed } from '@angular/core/testing';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it('renders the human-readable label for a status', async () => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('status', 'in_progress');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('In Progress');
  });

  it('exposes the status hue as a CSS custom property', async () => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('status', 'done');
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.style.getPropertyValue('--dot')).toContain('--bc-status-done');
  });
});
