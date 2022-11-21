import GenericConfig from './platform/generic';
import VercelConfig from './platform/vercel';
import NetlifyConfig from './platform/netlify';
import { EndpointType } from './shared';

export const isVercel = process.env.AXIOM_INGEST_ENDPOINT || process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT;
export const isNetlify = process.env.NETLIFY == 'true';

console.debug('config:vercel', isVercel)
console.debug('config:generic', !isVercel && !isNetlify)

const config = isVercel ? new VercelConfig() : isNetlify ? new NetlifyConfig() : new GenericConfig();
console.log(config.getIngestURL(EndpointType.logs))
export default config;
