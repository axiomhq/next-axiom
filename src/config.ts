import GenericConfig from './platform/generic';
import VercelConfig from './platform/vercel';
import NetlifyConfig from './platform/netlify';

export const isVercel = process.env.AXIOM_INGEST_ENDPOINT || process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT;
export const isNetlify = process.env.NETLIFY == 'true';

const config = isVercel ? new VercelConfig() : isNetlify ? new NetlifyConfig() : new GenericConfig();
export default config;
