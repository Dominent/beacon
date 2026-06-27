import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('renders the stat cards (placeholders before data loads)', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    const caps = [...fixture.nativeElement.querySelectorAll('.dash__cap')].map(
      (el: HTMLElement) => el.textContent?.trim()
    );
    expect(caps).toEqual(['Total issues', 'Open', 'Done']);
  });
});
