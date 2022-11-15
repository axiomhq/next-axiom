import GenericConfig from './platform/generic';
import VercelConfig from './platform/vercel';
import NetlifyConfig from './platform/netlify';
import { envVarExists } from './shared';

const isVercel = envVarExists('AXIOM_INGEST_ENDPOINT') || envVarExists('NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT');
const isNetlify = envVarExists('NETLIFY') && process.env.NETLIFY == 'true';

console.log(process.env)

if (isVercel) {
    console.log('vercel is used')
} else if (isNetlify) {
    console.log('netlify is used')
} else {
    console.log('fallback to generic')
}

const config = isVercel ? new VercelConfig() : isNetlify ? new NetlifyConfig() : new GenericConfig();
export default config;
