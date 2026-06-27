/**
 * Standalone Beacon API server (local dev). The route logic lives in
 * `create-app.ts` so the same app can be served by a Vercel function too.
 */
import { createBeaconApi } from './app/create-app';

const port = process.env.PORT || 3333;
const server = createBeaconApi().listen(port, () => {
  console.log(`[ beacon api ] http://localhost:${port}/api`);
});
server.on('error', console.error);
