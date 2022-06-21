import { NextConfig } from 'next';
import { proxyPath, EndpointType, getIngestURL } from './shared';
export { reportWebVitals } from './webVitals';
export { log } from './logger';

export function withAxiom(nextConfig: NextConfig): NextConfig {
  return {
    ...nextConfig,
    rewrites: async () => {
      const rewrites = await nextConfig.rewrites?.();

      const webVitalsEndpoint = getIngestURL(EndpointType.webVitals);
      const logsEndpoint = getIngestURL(EndpointType.logs);
      if (!webVitalsEndpoint && !logsEndpoint) {
        console.warn(
          'axiom - Envvars not detected. If this is production please see https://github.com/axiomhq/next-axiom for help'
        );
        console.warn('axiom - Sending Web Vitals to /dev/null');
        console.warn('axiom - Sending logs to console');
        return rewrites || []; // nothing to do
      }

      const axiomRewrites = [
        {
          source: `${proxyPath}/web-vitals`,
          destination: webVitalsEndpoint,
        },
        {
          source: `${proxyPath}/logs`,
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
