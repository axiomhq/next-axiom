import GenericConfig from './platform/generic';
import VercelConfig from './platform/vercel';
import NetlifyConfig from './platform/netlify';
import { envVarExists } from './shared';

const isVercel = envVarExists('AXIOM_INGEST_ENDPOINT') || envVarExists('NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT');
const isNetlify = envVarExists('NETLIFY') && process.env.NETLIFY == 'true';

const config = isVercel ? new VercelConfig() : isNetlify ? new NetlifyConfig() : new GenericConfig();
export default config;
