import { NextConfig } from 'next';
import { Rewrite } from 'next/dist/lib/load-custom-routes';
import { EndpointType, config, Logger } from 'next-axiom-core';

export function withAxiomNextConfig(nextConfig: NextConfig): NextConfig {
  return {
    ...nextConfig,
    rewrites: async () => {
      const rewrites = await nextConfig.rewrites?.();

      const webVitalsEndpoint = config.getIngestURL(EndpointType.webVitals);
      const logsEndpoint = config.getIngestURL(EndpointType.logs);
      if (!webVitalsEndpoint && !logsEndpoint) {
        const log = new Logger();
        log.warn(
          'axiom: Envvars not detected. If this is production please see https://github.com/axiomhq/next-axiom for help'
        );
        log.warn('axiom: Sending Web Vitals to /dev/null');
        log.warn('axiom: Sending logs to console');
        return rewrites || []; // nothing to do
      }

      const axiomRewrites: Rewrite[] = [
        {
          source: `${config.proxyPath}/web-vitals`,
          destination: webVitalsEndpoint,
          basePath: false,
        },
        {
          source: `${config.proxyPath}/logs`,
          destination: logsEndpoint,
          basePath: false,
        },
      ];

      if (!rewrites) {
        return axiomRewrites;
      } else if (Array.isArray(rewrites)) {
        return rewrites.concat(axiomRewrites);
      } else {
        rewrites.afterFiles = (rewrites.afterFiles || []).concat(axiomRewrites);
        return rewrites;
      }
    },
  };
}

type WithAxiomParam = NextConfig;

function isNextConfig(param: WithAxiomParam): param is NextConfig {
  return typeof param == 'object';
}

// withAxiom can be called either with NextConfig, which will add proxy rewrites
// to improve deliverability of Web-Vitals and logs.
export function withAxiom(param: NextConfig): NextConfig;
export function withAxiom(param: WithAxiomParam) {
  if (isNextConfig(param)) {
    return withAxiomNextConfig(param);
  }

  return withAxiomNextConfig;
}
