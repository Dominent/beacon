import { libraryGenerator } from '@nx/angular/generators';
import { formatFiles, names, Tree } from '@nx/devkit';
import { FeatureGeneratorSchema } from './schema';

/**
 * Wraps the Angular library generator but injects the correct tags
 * (`type:feature` + `scope:<domain>`) and naming convention. The architecture
 * is thus enforced *by construction* — a new feature can't be created untagged
 * or in the wrong place, which is how a 10-dev team stays consistent.
 */
export default async function featureGenerator(
  tree: Tree,
  options: FeatureGeneratorSchema
): Promise<void> {
  const domain = names(options.domain).fileName;
  const name = names(options.name).fileName;
  const projectName = `${domain}-feature-${name}`;

  await libraryGenerator(tree, {
    directory: `libs/${domain}/feature-${name}`,
    name: projectName,
    importPath: `@beacon/${projectName}`,
    tags: `type:feature,scope:${domain}`,
    prefix: 'bc',
    unitTestRunner: 'vitest-analog',
    skipFormat: true,
    // The generator's Schema types unitTestRunner as an enum; cast the literal.
  } as Parameters<typeof libraryGenerator>[1]);

  await formatFiles(tree);
}
