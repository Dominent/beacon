import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IssuesBoard } from './feature-board';

describe('IssuesBoard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssuesBoard],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('renders one drop-list column per status', () => {
    const fixture = TestBed.createComponent(IssuesBoard);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.board__col').length).toBe(5);
  });
});
