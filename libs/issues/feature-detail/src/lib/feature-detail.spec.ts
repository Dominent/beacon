import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IssueDetail } from './feature-detail';

describe('IssueDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueDetail],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('shows a loading state while the issue is not yet in the store', () => {
    const fixture = TestBed.createComponent(IssueDetail);
    fixture.componentRef.setInput('id', 'i999');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Loading issue i999'
    );
  });
});
