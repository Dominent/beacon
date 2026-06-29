import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IssuesStore } from './issues-store';

describe('IssuesStore', () => {
  let store: InstanceType<typeof IssuesStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(IssuesStore);
  });

  it('defaults to sorting by priority, ascending', () => {
    expect(store.sort()).toEqual({ key: 'priority', dir: 'asc' });
  });

  it('setSort toggles direction on the same column and resets to asc on a new one', () => {
    store.setSort('title');
    expect(store.sort()).toEqual({ key: 'title', dir: 'asc' });

    store.setSort('title');
    expect(store.sort()).toEqual({ key: 'title', dir: 'desc' });

    store.setSort('status');
    expect(store.sort()).toEqual({ key: 'status', dir: 'asc' });
  });

  it('setFilter merges partial changes', () => {
    store.setFilter({ search: 'bug' });
    store.setFilter({ statuses: ['done'] });
    expect(store.filter()).toMatchObject({ search: 'bug', statuses: ['done'] });
  });
});
