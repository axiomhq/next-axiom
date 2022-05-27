import { NextConfig } from 'next';
import { NextWebVitalsMetric } from 'next/app';
import { EndpointType, getIngestURL } from './config';
export { log } from './logger';
const _debounce = require('lodash/debounce');

export declare type WebVitalsMetric = NextWebVitalsMetric & { route: string };

export function withAxiom(nextConfig: NextConfig): NextConfig {
  return {
    ...nextConfig,
    rewrites: async () => {
      const rewrites = await nextConfig.rewrites?.();

      const ingestEndpoint = getIngestURL(EndpointType.webVitals);
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

const debounceSendMetrics = _debounce(() => sendMetrics(), 1000);
let collectedMetrics: WebVitalsMetric[] = [];

export function reportWebVitals(metric: NextWebVitalsMetric) {
  collectedMetrics.push({ route: window.__NEXT_DATA__?.page, ...metric });
  debounceSendMetrics();
}

function sendMetrics() {
  const url = '/axiom/web-vitals';
  const body = JSON.stringify({
    webVitals: collectedMetrics,
  });

  if (typeof window !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
  // clear collectedMetrics
  collectedMetrics = [];
}
