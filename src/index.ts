import { NextConfig } from 'next';
import { EndpointType, getIngestURL } from './config';
export { reportWebVitals } from './webVitals';
export { log } from './logger';

export function withAxiom(nextConfig: NextConfig): NextConfig {
  return {
    ...nextConfig,
    rewrites: async () => {
      const rewrites = await nextConfig.rewrites?.();

      const debug = '&projectId=2479f8a6-031a-4582-8ca7-a6b2aa7bf82d&configurationId=icfg_3WhrV6ICara11U1rkAU8aQ26';
      const webVitalsEndpoint = getIngestURL(EndpointType.webVitals);
      console.log(webVitalsEndpoint);
      const logsEndpoint = getIngestURL(EndpointType.logs) + debug;
      console.log(logsEndpoint);
      if (!webVitalsEndpoint && !logsEndpoint) {
        return rewrites || []; // nothing to do
      }

      const axiomRewrites = [
        {
          source: '/axiom/web-vitals',
          destination: webVitalsEndpoint,
        },
        {
          source: '/axiom/logs',
          destination: logsEndpoint,
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
