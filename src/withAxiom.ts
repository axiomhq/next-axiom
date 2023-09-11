import { NextConfig } from 'next';
import { Rewrite } from 'next/dist/lib/load-custom-routes';
import { config } from './config';
import { Logger, RequestReport } from './logger';
import { type NextRequest, type NextResponse } from 'next/server';
import { EndpointType } from './shared';

declare global {
  var EdgeRuntime: string;
}

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

export type AxiomRequest = NextRequest & { log: Logger };
type NextHandler<T = any> = (req: AxiomRequest, routeSegment?: T ) => Promise<Response> | Promise<NextResponse> | NextResponse | Response;

export function withAxiomRouteHandler(handler: NextHandler) {
  return async (req: Request | NextRequest, routeSegment: any) => {
    let region = '';
    if ('geo' in req) {
      region = req.geo?.region ?? '';
    }

    const report: RequestReport = {
      startTime: new Date().getTime(),
      path: req.url,
      method: req.method,
      host: req.headers.get('host'),
      userAgent: req.headers.get('user-agent'),
      scheme: 'https',
      ip: req.headers.get('x-forwarded-for'),
      region,
    };
    const isEdgeRuntime = globalThis.EdgeRuntime ? true : false;

    const logger = new Logger({ req: report, source: isEdgeRuntime ? 'edge' : 'lambda' });
    const axiomContext = req as AxiomRequest;
    const routeSeg = routeSegment
    axiomContext.log = logger;

    try {
      const result = await handler(axiomContext, routeSeg);
      await logger.flush();
      if (isEdgeRuntime) {
        logEdgeReport(report);
      }
      return result;
    } catch (error: any) {
      logger.error('Error in Next route handler', { error });
      logger.attachResponseStatus(500);
      await logger.flush();
      if (isEdgeRuntime) {
        logEdgeReport(report);
      }
      throw error;
    }
  };
}

function logEdgeReport(report: RequestReport) {
  console.log(`AXIOM_EDGE_REPORT::${JSON.stringify(report)}`);
}

type WithAxiomParam = NextConfig | NextHandler;

function isNextConfig(param: WithAxiomParam): param is NextConfig {
  return typeof param == 'object';
}

// withAxiom can be called either with NextConfig, which will add proxy rewrites
// to improve deliverability of Web-Vitals and logs.
export function withAxiom(param: NextConfig): NextConfig;
export function withAxiom(param: NextHandler): NextHandler;
export function withAxiom(param: WithAxiomParam) {
  if (typeof param == 'function') {
    return withAxiomRouteHandler(param);
  } else if (isNextConfig(param)) {
    return withAxiomNextConfig(param);
  }

  return withAxiomRouteHandler(param);
}
