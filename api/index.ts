// Vercel serverless function: serves the Beacon API.
// A `vercel.json` rewrite sends every /api/* request here; the express app's
// own /api/* routes then match. Self-contained (relative imports) so esbuild
// bundles it without tsconfig path resolution.
import { createBeaconApi } from '../apps/api/src/app/create-app';

export default createBeaconApi();
