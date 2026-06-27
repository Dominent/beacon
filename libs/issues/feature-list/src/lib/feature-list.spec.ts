import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IssuesList } from './feature-list';

describe('IssuesList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssuesList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('renders the search toolbar and status filters', () => {
    const fixture = TestBed.createComponent(IssuesList);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.list__search')).toBeTruthy();
    // 5 status + 4 priority filter buttons.
    expect(host.querySelectorAll('.list__filters button').length).toBe(9);
  });
});
