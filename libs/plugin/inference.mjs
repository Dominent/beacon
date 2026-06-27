// Task-inference entry (registered in nx.json `plugins`).
//
// Authored as plain ESM (.mjs) on purpose: Nx loads graph plugins during
// `nx build` graph processing, where a TypeScript loader isn't guaranteed (e.g.
// CI / Vercel). A .mjs file loads natively everywhere. The generator and
// executor stay in TypeScript — they're loaded by Nx's generator/executor
// machinery, not during graph processing.
import { createNodesFromFiles, readJsonFile } from '@nx/devkit';
import { existsSync } from 'fs';
import { dirname, join } from 'path';

export const createNodesV2 = [
  '**/size-budget.json',
  async (configFiles, options, context) => {
    return createNodesFromFiles(
      (configFile, _opts, ctx) => createTargetForBudget(configFile, ctx),
      configFiles,
      options,
      context
    );
  },
];

function createTargetForBudget(configFile, context) {
  const projectRoot = dirname(configFile);

  // Only attach to actual project roots.
  const isProject =
    existsSync(join(context.workspaceRoot, projectRoot, 'project.json')) ||
    existsSync(join(context.workspaceRoot, projectRoot, 'package.json'));
  if (!isProject) {
    return {};
  }

  const budget = readJsonFile(join(context.workspaceRoot, configFile));

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
