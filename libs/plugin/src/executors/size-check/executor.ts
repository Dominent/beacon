import { ExecutorContext, logger } from '@nx/devkit';
import { Dirent, promises as fs } from 'fs';
import { join } from 'path';
import { SizeCheckExecutorSchema } from './schema';

/**
 * Reads the build output, sums the JS, and fails if it exceeds the budget.
 * A first-class Nx target (cacheable, affected-aware, shows in the graph) —
 * which a plain shell script wouldn't be.
 */
export default async function runExecutor(
  options: SizeCheckExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  const root = context.root;
  const dir = join(root, options.outputPath);

  let maxKb = options.maxKb;
  if (options.budgetFile) {
    try {
      const raw = await fs.readFile(join(root, options.budgetFile), 'utf8');
      const parsed = JSON.parse(raw) as { maxKb?: number };
      if (typeof parsed.maxKb === 'number') {
        maxKb = parsed.maxKb;
      }
    } catch {
      logger.warn(`[size-check] could not read budget file ${options.budgetFile}`);
    }
  }

  const totalBytes = await sumJsBytes(dir);
  const totalKb = Math.round((totalBytes / 1024) * 10) / 10;

  // Guard the false-pass: no JS means the build didn't produce output, not that
  // we're comfortably under budget.
  if (totalBytes === 0) {
    logger.error(
      `[size-check] FAILED — no JS found at ${options.outputPath}. Did the build run?`
    );
    return { success: false };
  }

  logger.info(
    `[size-check] ${options.outputPath}: ${totalKb} KB JS (budget ${maxKb ?? '∞'} KB)`
  );

  if (maxKb != null && totalKb > maxKb) {
    logger.error(
      `[size-check] FAILED — ${totalKb} KB exceeds the ${maxKb} KB budget by ${(
        totalKb - maxKb
      ).toFixed(1)} KB.`
    );
    return { success: false };
  }

  return { success: true };
}

async function sumJsBytes(dir: string): Promise<number> {
  let total = 0;
  let entries: Dirent[] = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      total += await sumJsBytes(full);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
      total += (await fs.stat(full)).size;
    }
  }
  return total;
}
