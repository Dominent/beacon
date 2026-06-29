import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Issue } from '@beacon/util';
import { IssuesStore } from './issues-store';

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: 'i1',
    key: 'BCN-1',
    title: 'Issue',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigneeId: null,
    labelIds: [],
    projectId: 'p1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    commentCount: 0,
    ...overrides,
  };
}

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

  it('applyServerUpdate upserts a pushed issue into the entity map', () => {
    store.applyServerUpdate(makeIssue({ id: 'i2', title: 'first' }));
    expect(store.entityMap()['i2'].title).toBe('first');

    store.applyServerUpdate(makeIssue({ id: 'i2', title: 'updated' }));
    expect(store.entityMap()['i2'].title).toBe('updated');
  });

  it('move() updates optimistically and rolls back when the PATCH fails', async () => {
    const http = TestBed.inject(HttpTestingController);
    store.applyServerUpdate(makeIssue({ id: 'i1', status: 'todo' }));

    const moving = store.move('i1', 'done');
    expect(store.entityMap()['i1'].status).toBe('done'); // optimistic

    http
      .expectOne('/api/issues/i1')
      .flush('boom', { status: 500, statusText: 'Server Error' });
    await moving;

    expect(store.entityMap()['i1'].status).toBe('todo'); // rolled back
  });
});
