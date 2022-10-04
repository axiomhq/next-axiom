import GenericConfig from './platform/generic';
import VercelConfig from './platform/vercel';
import NetlifyConfig from './platform/netlify';

const isVercel = process.env.AXIOM_INGEST_ENDPOINT || process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT;
const isNetlify = process.env.NETLIFY == 'true';

export const isNoPrettyPrint = process.env.AXIOM_NO_PRETTY_PRINT == 'true' ? true : false;

export enum EndpointType {
  webVitals = 'web-vitals',
  logs = 'logs',
}

export const throttle = (fn: Function, wait: number) => {
  let lastFn: ReturnType<typeof setTimeout>, lastTime: number;
  return function (this: any) {
    const context = this,
      args = arguments;

    // First call, set lastTime
    if (lastTime == null) {
      lastTime = Date.now();
    }

    clearTimeout(lastFn);
    lastFn = setTimeout(() => {
      if (Date.now() - lastTime >= wait) {
        fn.apply(context, args);
        lastTime = Date.now();
      }
    }, Math.max(wait - (Date.now() - lastTime), 0));
  };
};

export const config = isVercel ? new VercelConfig() : isNetlify ? new NetlifyConfig() : new GenericConfig();
