import {
  CreateNodesContextV2,
  CreateNodesV2,
  createNodesFromFiles,
  readJsonFile,
} from '@nx/devkit';
import { existsSync } from 'fs';
import { dirname, join } from 'path';

interface SizeBudget {
  maxKb?: number;
  outputPath?: string;
}

/**
 * Task inference (Nx "Crystal"): any project containing a `size-budget.json`
 * automatically gets a `size-check` target wired to our executor — no manual
 * `project.json` edits. Drop the config file, get the target. This removes a
 * real workflow bottleneck (per-project target boilerplate).
 */
export const createNodesV2: CreateNodesV2 = [
  '**/size-budget.json',
  async (configFiles, _options, context) => {
    return createNodesFromFiles(
      (configFile, _opts, ctx) => createTargetForBudget(configFile, ctx),
      configFiles,
      _options,
      context
    );
  },
];

function createTargetForBudget(configFile: string, context: CreateNodesContextV2) {
  const projectRoot = dirname(configFile);

  // Only attach to actual project roots.
  const isProject =
    existsSync(join(context.workspaceRoot, projectRoot, 'project.json')) ||
    existsSync(join(context.workspaceRoot, projectRoot, 'package.json'));
  if (!isProject) {
    return {};
  }

  const budget = readJsonFile<SizeBudget>(join(context.workspaceRoot, configFile));

  return {
    projects: {
      [projectRoot]: {
        targets: {
          'size-check': {
            executor: '@beacon/plugin:size-check',
            options: {
              outputPath: budget.outputPath ?? `dist/${projectRoot}`,
              budgetFile: configFile,
            },
            cache: true,
            inputs: ['production'],
            dependsOn: ['build'],
          },
        },
      },
    },
  };
}
