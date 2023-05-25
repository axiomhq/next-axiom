import GenericConfig from './platform/generic';
import VercelConfig from './platform/vercel';
import NetlifyConfig from './platform/netlify';

export const Version = require('../package.json').version;
export const isVercel = process.env.AXIOM_INGEST_ENDPOINT || process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT;
export const isNetlify = process.env.NETLIFY == 'true';

// Detect the platform provider, and return the appropriate config
// fallback to generic config if no provider is detected
let config = new GenericConfig();
if (isVercel) {
  config = new VercelConfig();
} else if (isNetlify) {
  config = new NetlifyConfig();
}

export { config };
