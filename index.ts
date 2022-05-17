import { NextConfig } from 'next';
import { NextWebVitalsMetric } from 'next/app';

export function withAxiomProxy(nextConfig: NextConfig): NextConfig {
  return {
    ...nextConfig,
    rewrites: async () => {
      const rewrites = await nextConfig.rewrites?.();

      const ingestEndpoint = process.env.AXIOM_INGEST_ENDPOINT || process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT;
      if (!ingestEndpoint) {
        return rewrites || []; // nothing to do
      }

      const axiomRewrites = [
        {
          source: '/axiom/web-vitals',
          destination: ingestEndpoint,
        },
      ];

      if (!rewrites) {
        return axiomRewrites;
      } else if (Array.isArray(rewrites)) {
        return rewrites.concat(axiomRewrites);
      } else {
        rewrites.afterFiles = rewrites.afterFiles.concat(axiomRewrites);
        return rewrites;
      }
    },
  };
}

let collectedMetrics: any[] = [];

// Usage:
// export { reportWebVitals } from "@axiomhq/web-vitals";
export function reportWebVitals(metric: NextWebVitalsMetric) {
  
  collectedMetrics.push(metric)
  debounce(sendMetrics)
}

function sendMetrics () {
  const url = '/axiom/web-vitals';
  const body = JSON.stringify({
    route: window.__NEXT_DATA__.page,
    ...collectedMetrics,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
  // clear collectedMetrics
  collectedMetrics = []
}

function debounce(func: Function, timeout = 1000) {
  let timer: NodeJS.Timeout;
  
  return (...args: any) => {
    clearTimeout(timer);
    
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}
