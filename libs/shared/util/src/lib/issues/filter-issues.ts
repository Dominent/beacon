import {
  Issue,
  IssuePriority,
  IssueStatus,
  ISSUE_STATUSES,
  PRIORITY_RANK,
} from '../models/issue.models';

export interface IssueFilter {
  /** Free-text query matched against title + key. */
  search: string;
  statuses: IssueStatus[];
  priorities: IssuePriority[];
  assigneeId: string | null;
}

export const EMPTY_FILTER: IssueFilter = {
  search: '',
  statuses: [],
  priorities: [],
  assigneeId: null,
};

/**
 * Pure, dependency-free filtering. Lives in `util` so it can be unit-tested in
 * isolation and reused by the list, the board and (potentially) the API.
 */
export function filterIssues(issues: readonly Issue[], filter: IssueFilter): Issue[] {
  const q = filter.search.trim().toLowerCase();

  return issues.filter((issue) => {
    if (q && !matchesText(issue, q)) {
      return false;
    }
    if (filter.statuses.length && !filter.statuses.includes(issue.status)) {
      return false;
    }
    if (filter.priorities.length && !filter.priorities.includes(issue.priority)) {
      return false;
    }
    if (filter.assigneeId && issue.assigneeId !== filter.assigneeId) {
      return false;
    }
    return true;
  });
}

function matchesText(issue: Issue, query: string): boolean {
  return (
    issue.title.toLowerCase().includes(query) ||
    issue.key.toLowerCase().includes(query)
  );
}

/** Stable sort by priority (urgent → low), then by most recently updated. */
export function sortByPriority(issues: readonly Issue[]): Issue[] {
  return [...issues].sort((a, b) => {
    const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    return byPriority !== 0
      ? byPriority
      : b.updatedAt.localeCompare(a.updatedAt);
  });
}

export type SortKey = 'key' | 'title' | 'priority' | 'status' | 'updatedAt';
export type SortDir = 'asc' | 'desc';

export interface IssueSort {
  key: SortKey;
  dir: SortDir;
}

export const DEFAULT_SORT: IssueSort = { key: 'priority', dir: 'asc' };

/** Pure, configurable sort over any column. `asc` = natural order per column. */
export function sortIssues(issues: readonly Issue[], sort: IssueSort): Issue[] {
  const factor = sort.dir === 'asc' ? 1 : -1;
  return [...issues].sort((a, b) => factor * compareBy(a, b, sort.key));
}

function compareBy(a: Issue, b: Issue, key: SortKey): number {
  switch (key) {
    case 'key':
      return a.key.localeCompare(b.key, undefined, { numeric: true });
    case 'title':
      return a.title.localeCompare(b.title);
    case 'priority': // urgent → low
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    case 'status': // backlog → done
      return ISSUE_STATUSES.indexOf(a.status) - ISSUE_STATUSES.indexOf(b.status);
    case 'updatedAt': // oldest → newest
      return a.updatedAt.localeCompare(b.updatedAt);
  }
}

export function isActive(issue: Issue): boolean {
  return issue.status !== 'done';
}
