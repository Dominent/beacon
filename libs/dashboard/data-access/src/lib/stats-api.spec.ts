import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StatsApi } from './stats-api';

describe('StatsApi', () => {
  let api: StatsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(StatsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches aggregate stats', () => {
    let result: unknown;
    api.get().subscribe((r) => (result = r));

    const req = http.expectOne('/api/stats');
    expect(req.request.method).toBe('GET');
    req.flush({ total: 3, byStatus: {}, byPriority: {} });

    expect(result).toEqual({ total: 3, byStatus: {}, byPriority: {} });
  });
});
