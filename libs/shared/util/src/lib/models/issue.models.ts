/**
 * Domain model for the issue tracker.
 *
 * This library is intentionally framework-agnostic (zero Angular imports) so the
 * same types can be shared by the Angular app AND the express API (see apps/api).
 */

export type IssueStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'done';

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Label {
  id: string;
  name: string;
  /** Hex color, e.g. `#2563eb`. */
  color: string;
}

export interface Project {
  id: string;
  key: string;
  name: string;
}

export interface Issue {
  id: string;
  /** Human-facing key, e.g. `BCN-101`. */
  key: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string | null;
  labelIds: string[];
  projectId: string;
  /** ISO 8601 timestamps. */
  createdAt: string;
  updatedAt: string;
  commentCount: number;
}

/** The ordered set of board columns / status values. */
export const ISSUE_STATUSES: readonly IssueStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
] as const;

export const ISSUE_PRIORITIES: readonly IssuePriority[] = [
  'urgent',
  'high',
  'medium',
  'low',
] as const;

export const STATUS_LABELS: Record<IssueStatus, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/** Lower rank sorts first (urgent before low). */
export const PRIORITY_RANK: Record<IssuePriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};
