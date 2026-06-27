import {
  Issue,
  IssuePriority,
  IssueStatus,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  Label,
  Project,
  User,
} from '@beacon/util';

/**
 * In-memory seed data for the mock API. The API imports the SAME domain model
 * as the Angular app (`@beacon/util`) — one source of truth for the contract.
 */

export const users: User[] = [
  { id: 'u1', name: 'Ada Lovelace' },
  { id: 'u2', name: 'Grace Hopper' },
  { id: 'u3', name: 'Alan Turing' },
  { id: 'u4', name: 'Katherine Johnson' },
];

export const labels: Label[] = [
  { id: 'l1', name: 'bug', color: '#ef4444' },
  { id: 'l2', name: 'feature', color: '#2563eb' },
  { id: 'l3', name: 'chore', color: '#64748b' },
  { id: 'l4', name: 'design', color: '#a855f7' },
];

export const projects: Project[] = [
  { id: 'p1', key: 'BCN', name: 'Beacon Core' },
];

const TITLES = [
  'Fix login redirect loop',
  'Add dark mode toggle',
  'Virtualize the issue list',
  'Optimistic status updates on the board',
  'Stream live updates over SSE',
  'Reduce initial bundle size',
  'Improve INP on the dashboard',
  'Defer the analytics charts',
  'Add keyboard navigation',
  'Persist filter state in the URL',
  'Harden the error interceptor',
  'Write e2e for the board flow',
];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

/** Deterministic seed (no Math.random) so SSR and client agree. */
function buildIssues(count: number): Issue[] {
  const issues: Issue[] = [];
  for (let i = 0; i < count; i++) {
    const status: IssueStatus = pick(ISSUE_STATUSES, i + (i % 3));
    const priority: IssuePriority = pick(ISSUE_PRIORITIES, i);
    const createdAt = new Date(2026, 0, 1 + (i % 120)).toISOString();
    issues.push({
      id: `i${i + 1}`,
      key: `BCN-${100 + i}`,
      title: `${pick(TITLES, i)} (#${100 + i})`,
      description:
        'Auto-generated seed issue used to demonstrate filtering, virtual scroll and the board.',
      status,
      priority,
      assigneeId: i % 5 === 0 ? null : pick(users, i).id,
      labelIds: [pick(labels, i).id, pick(labels, i + 2).id].filter(
        (v, idx, a) => a.indexOf(v) === idx
      ),
      projectId: 'p1',
      createdAt,
      updatedAt: createdAt,
      commentCount: i % 4,
    });
  }
  return issues;
}

/** Mutable store — PATCH endpoints write here. */
export const db = {
  issues: buildIssues(60),
};
