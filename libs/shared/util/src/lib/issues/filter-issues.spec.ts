import { Issue } from '../models/issue.models';
import {
  EMPTY_FILTER,
  filterIssues,
  isActive,
  sortByPriority,
} from './filter-issues';

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: 'i1',
    key: 'BCN-1',
    title: 'Default issue',
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

describe('filterIssues', () => {
  const issues = [
    makeIssue({ id: 'a', key: 'BCN-1', title: 'Login bug', status: 'todo', priority: 'high', assigneeId: 'u1' }),
    makeIssue({ id: 'b', key: 'BCN-2', title: 'Dark mode', status: 'done', priority: 'low', assigneeId: 'u2' }),
    makeIssue({ id: 'c', key: 'BCN-3', title: 'Crash on save', status: 'in_progress', priority: 'urgent', assigneeId: 'u1' }),
  ];

  it('returns everything for the empty filter', () => {
    expect(filterIssues(issues, EMPTY_FILTER)).toHaveLength(3);
  });

  it('matches search against title and key, case-insensitively', () => {
    expect(filterIssues(issues, { ...EMPTY_FILTER, search: 'dark' }).map((i) => i.id)).toEqual(['b']);
    expect(filterIssues(issues, { ...EMPTY_FILTER, search: 'bcn-3' }).map((i) => i.id)).toEqual(['c']);
  });

  it('filters by status and priority', () => {
    expect(filterIssues(issues, { ...EMPTY_FILTER, statuses: ['done'] }).map((i) => i.id)).toEqual(['b']);
    expect(filterIssues(issues, { ...EMPTY_FILTER, priorities: ['urgent', 'high'] }).map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('filters by assignee', () => {
    expect(filterIssues(issues, { ...EMPTY_FILTER, assigneeId: 'u1' }).map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('combines predicates (AND semantics)', () => {
    const result = filterIssues(issues, { ...EMPTY_FILTER, assigneeId: 'u1', statuses: ['in_progress'] });
    expect(result.map((i) => i.id)).toEqual(['c']);
  });
});

describe('sortByPriority', () => {
  it('orders urgent → low and does not mutate the input', () => {
    const input = [
      makeIssue({ id: 'a', priority: 'low' }),
      makeIssue({ id: 'b', priority: 'urgent' }),
      makeIssue({ id: 'c', priority: 'medium' }),
    ];
    expect(sortByPriority(input).map((i) => i.id)).toEqual(['b', 'c', 'a']);
    expect(input[0].id).toBe('a'); // original untouched
  });
});

describe('isActive', () => {
  it('is false only for done issues', () => {
    expect(isActive(makeIssue({ status: 'done' }))).toBe(false);
    expect(isActive(makeIssue({ status: 'in_progress' }))).toBe(true);
  });
});
