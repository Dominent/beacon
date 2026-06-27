import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EMPTY_FILTER } from '@beacon/util';
import { IssuesApi } from './issues-api';

describe('IssuesApi', () => {
  let api: IssuesApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(IssuesApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('encodes the filter as query params', () => {
    api
      .list({ ...EMPTY_FILTER, search: 'bug', statuses: ['todo'], priorities: ['high'] })
      .subscribe();

    const req = http.expectOne((r) => r.url === '/api/issues');
    expect(req.request.params.get('search')).toBe('bug');
    expect(req.request.params.getAll('status')).toEqual(['todo']);
    expect(req.request.params.getAll('priority')).toEqual(['high']);
    req.flush([]);
  });

  it('PATCHes a single issue', () => {
    api.patch('i1', { status: 'done' }).subscribe();

    const req = http.expectOne('/api/issues/i1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'done' });
    req.flush({});
  });
});
