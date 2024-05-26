import { NextConfig } from 'next';
import { Rewrite } from 'next/dist/lib/load-custom-routes';
import { config, isEdgeRuntime, isVercelIntegration } from './config';
import { LogLevel, Logger, RequestReport } from './logger';
import { NextRequest, type NextResponse } from 'next/server';
import { EndpointType } from './shared';

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
type NextHandler<T = any> = (
  req: AxiomRequest,
  arg?: T
) => Promise<Response> | Promise<NextResponse> | NextResponse | Response;

export function withAxiomRouteHandler(handler: NextHandler): NextHandler {
  return async (req: Request | NextRequest, arg: any) => {
    let region = '';
    if ('geo' in req) {
      region = req.geo?.region ?? '';
    }

    let pathname = '';
    if (req instanceof NextRequest) {
      pathname = req.nextUrl.pathname;
    } else if (req instanceof Request) {
      // pathname = req.url.substring(req.headers.get('host')?.length || 0)
      pathname = new URL(req.url).pathname;
    }

    const report: RequestReport = {
      startTime: new Date().getTime(),
      endTime: new Date().getTime(),
      path: pathname,
      method: req.method,
      host: req.headers.get('host'),
      userAgent: req.headers.get('user-agent'),
      scheme: req.url.split('://')[0],
      ip: req.headers.get('x-forwarded-for'),
      region,
    };

    // main logger, mainly used to log reporting on the incoming HTTP request
    const logger = new Logger({ req: report, source: isEdgeRuntime ? 'edge' : 'lambda' });
    // child logger to be used by the users within the handler
    const log = logger.with({});
    log.config.source = isEdgeRuntime ? 'edge-log' : 'lambda-log';
    const axiomContext = req as AxiomRequest;
    const args = arg;
    axiomContext.log = log;

    try {
      const result = await handler(axiomContext, args);
      report.endTime = new Date().getTime();

      // report log record
      report.statusCode = result.status;
      report.durationMs = report.endTime - report.startTime;
      logger.logHttpRequest(
        LogLevel.info,
        `[${req.method}] ${report.path} ${report.statusCode} ${report.endTime - report.startTime}ms`,
        report,
        {}
      );
      // attach the response status to all children logs
      log.attachResponseStatus(result.status);

      // flush the logger along with the child logger
      await logger.flush();
      if (isEdgeRuntime && isVercelIntegration) {
        logEdgeReport(report);
      }
      return result;
    } catch (error: any) {
      report.endTime = new Date().getTime();
      // report log record
      report.statusCode = 500;
      report.durationMs = report.endTime - report.startTime;
      logger.logHttpRequest(
        LogLevel.error,
        `[${req.method}] ${report.path} ${report.statusCode} ${report.endTime - report.startTime}ms`,
        report,
        {}
      );

      log.error(error.message, { error });
      log.attachResponseStatus(500);

      await logger.flush();
      if (isEdgeRuntime && isVercelIntegration) {
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
export function withAxiom(param: NextHandler): NextHandler;
export function withAxiom(param: NextConfig): NextConfig;
export function withAxiom(param: WithAxiomParam) {
  if (typeof param == 'function') {
    return withAxiomRouteHandler(param);
  } else if (isNextConfig(param)) {
    return withAxiomNextConfig(param);
  }

  return withAxiomRouteHandler(param);
}
