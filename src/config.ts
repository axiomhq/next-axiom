import GenericConfig from './platform/generic';
import VercelConfig from './platform/vercel';
import NetlifyConfig from './platform/netlify';

declare global {
  var EdgeRuntime: string; // Edge runtime
  var WorkerGlobalScope: any; // Non-standard global only used on Cloudflare: https://developers.cloudflare.com/workers/runtime-apis/websockets
}

export const Version = require('../package.json').version;
export const isVercel = process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT || process.env.AXIOM_INGEST_ENDPOINT;
export const isNetlify = process.env.NETLIFY == 'true';
export const isWebWorker =
  typeof self !== 'undefined' &&
  typeof globalThis.WorkerGlobalScope !== 'undefined' &&
  self instanceof WorkerGlobalScope;
export const isBrowser = typeof window !== 'undefined' || isWebWorker;
export const isEdgeRuntime = globalThis.EdgeRuntime ? true : false;

// Detect the platform provider, and return the appropriate config
// fallback to generic config if no provider is detected
let config = new GenericConfig();
if (isVercel) {
  config = new VercelConfig();
} else if (isNetlify) {
  config = new NetlifyConfig();
}

export { config };
