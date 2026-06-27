/**
 * Builds the Beacon API express app (without listening), so it can be reused by
 * both the standalone server (main.ts) and the Vercel serverless function.
 *
 */
// Relative import so the Vercel serverless bundle inlines @beacon/util (a
// tsconfig alias isn't a real package, so esbuild would externalize it).
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  EMPTY_FILTER,
  filterIssues,
  Issue,
  IssueFilter,
  IssuePriority,
  IssueStatus,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
} from '../../../../libs/shared/util/src';
import express, { Express, Request, Response } from 'express';
import { db, labels, projects, users } from './data';

export function createBeaconApi(): Express {
  const app = express();
  app.use(express.json());

  // Permissive CORS (same-origin in prod, cross-origin in local dev).
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  // ---- Reference data ----
  app.get('/api/users', (_req, res) => res.json(users));
  app.get('/api/labels', (_req, res) => res.json(labels));
  app.get('/api/projects', (_req, res) => res.json(projects));

  // ---- Issues ----
  app.get('/api/issues', (req, res) => {
    const filter: IssueFilter = {
      ...EMPTY_FILTER,
      search: String(req.query.search ?? ''),
      statuses: asArray<IssueStatus>(req.query.status),
      priorities: asArray<IssuePriority>(req.query.priority),
      assigneeId: req.query.assigneeId ? String(req.query.assigneeId) : null,
    };
    res.json(filterIssues(db.issues, filter));
  });

  app.get('/api/issues/:id', (req, res) => {
    const issue = db.issues.find((i) => i.id === req.params.id);
    return issue ? res.json(issue) : res.status(404).json({ message: 'Not found' });
  });

  app.patch('/api/issues/:id', (req, res) => {
    const issue = db.issues.find((i) => i.id === req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Not found' });
    }
    const patch = req.body as Partial<Issue>;
    Object.assign(issue, patch, { updatedAt: new Date().toISOString() });
    broadcast({ type: 'issue.updated', issue });
    return res.json(issue);
  });

  // ---- Dashboard aggregates ----
  app.get('/api/stats', (_req, res) => {
    res.json({
      total: db.issues.length,
      byStatus: countBy(ISSUE_STATUSES, (s) => db.issues.filter((i) => i.status === s).length),
      byPriority: countBy(ISSUE_PRIORITIES, (p) => db.issues.filter((i) => i.priority === p).length),
    });
  });

  // ---- SSE live stream (no-op broadcaster on serverless) ----
  app.get('/api/events', (req: Request, res: Response) => {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.flushHeaders();
    res.write(`event: ready\ndata: "connected"\n\n`);
    clients.add(res);
    req.on('close', () => clients.delete(res));
  });

  // Background activity only off-serverless (Vercel functions aren't long-lived).
  if (!process.env.VERCEL) {
    setInterval(() => {
      if (!db.issues.length) return;
      const issue = db.issues[Math.floor(Math.random() * db.issues.length)];
      issue.updatedAt = new Date().toISOString();
      broadcast({ type: 'issue.updated', issue });
    }, 5000).unref();
  }

  return app;
}

const clients = new Set<Response>();

function broadcast(payload: unknown): void {
  const frame = `event: message\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of clients) {
    client.write(frame);
  }
}

function asArray<T extends string>(value: unknown): T[] {
  if (value == null) return [];
  return (Array.isArray(value) ? value : [value]).map((v) => String(v) as T);
}

function countBy<T extends string>(
  keys: readonly T[],
  count: (key: T) => number
): Record<T, number> {
  return keys.reduce((acc, key) => {
    acc[key] = count(key);
    return acc;
  }, {} as Record<T, number>);
}
