import { NextConfig } from 'next';
import { NextWebVitalsMetric } from 'next/app';
import sendMetrics from './sendMetrics';
const _debounce = require('lodash/debounce');

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

export function getCurrentPage() {
  return window.__NEXT_DATA__.page
}

const debounceSendMetrics = _debounce(() => sendMetrics(collectedMetrics), 1000);
let collectedMetrics: NextWebVitalsMetric[] = [];

// Usage:
// export { reportWebVitals } from "@axiomhq/web-vitals";
export function reportWebVitals(metric: NextWebVitalsMetric) {
  metric['route'] = getCurrentPage();
  collectedMetrics.push(metric);
  debounceSendMetrics();
}
