import { NextConfig } from 'next';
import { NextWebVitalsMetric } from 'next/app';
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
  // TODO: find a way to mock this in tests
  // return window.__NEXT_DATA__.page
  return '/';
}

const debounceSendMetrics = _debounce(sendMetrics, 1000);
let collectedMetrics: NextWebVitalsMetric[] = [];

// Usage:
// import { reportWebVitals } from "@axiomhq/web-vitals";
export function reportWebVitals(metric: NextWebVitalsMetric) {
  metric['route'] = getCurrentPage();
  collectedMetrics.push(metric);
  debounceSendMetrics();
}

function sendMetrics() {
  const url = '/axiom/web-vitals';
  const body = JSON.stringify({
    webVitals: collectedMetrics,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
  // clear collectedMetrics
  collectedMetrics = [];
}
