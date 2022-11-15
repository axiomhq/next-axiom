import GenericConfig from './platform/generic';
import VercelConfig from './platform/vercel';
import NetlifyConfig from './platform/netlify';

const isVercel = process.env.AXIOM_INGEST_ENDPOINT || process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT;
const isNetlify = process.env.NETLIFY == 'true';

if (isVercel) {
  console.log('vercel is used');
} else if (isNetlify) {
  console.log('netlify is used');
} else {
  console.log('fallback to generic');
}

const config = isVercel ? new VercelConfig() : isNetlify ? new NetlifyConfig() : new GenericConfig();
export default config;
