import { NextConfig } from 'next';
import { Rewrite } from 'next/dist/lib/load-custom-routes';
import { config, isEdgeRuntime, isVercelIntegration } from './config';
import { LogLevel, Logger, RequestReport } from './logger';
import { type NextRequest, type NextResponse } from 'next/server';
import { EndpointType, RequestJSON, requestToJSON } from './shared';

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

type AxiomRouteHandlerConfig = {
  logRequestDetails?: boolean | (keyof RequestJSON)[];
  // override default log levels for notFound and redirect
  NotFoundLogLevel?: LogLevel; // defaults to LogLevel.warn
  RedirectLogLevel?: LogLevel; // defaults to LogLevel.info
};

export function withAxiomRouteHandler(handler: NextHandler, config?: AxiomRouteHandlerConfig): NextHandler {
  return async (req: Request | NextRequest, arg: any) => {
    let region = '';
    if ('geo' in req) {
      region = req.geo?.region ?? '';
    }

    let pathname = '';
    if ('nextUrl' in req) {
      pathname = req.nextUrl.pathname;
    } else if (req instanceof Request) {
      // pathname = req.url.substring(req.headers.get('host')?.length || 0)
      pathname = new URL(req.url).pathname;
    }

    const requestDetails =
      Array.isArray(config?.logRequestDetails) || config?.logRequestDetails === true
        ? await requestToJSON(req)
        : undefined;

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
      details: Array.isArray(config?.logRequestDetails)
        ? (Object.fromEntries(
            Object.entries(requestDetails as RequestJSON).filter(([key]) =>
              (config?.logRequestDetails as (keyof RequestJSON)[]).includes(key as keyof RequestJSON)
            )
          ) as RequestJSON)
        : requestDetails,
    };

    // main logger, mainly used to log reporting on the incoming HTTP request
    const logger = new Logger({ req: report, source: isEdgeRuntime ? 'edge' : 'lambda' });
    // child logger to be used by the users within the handler
    const log = logger.with({});
    log.config.source = `${isEdgeRuntime ? 'edge' : 'lambda'}${!isVercelIntegration ? '-log' : ''}`;
    const axiomContext = req as AxiomRequest;
    const args = arg;
    axiomContext.log = log;

    try {
      const result = await handler(axiomContext, args);
      report.endTime = new Date().getTime();

      // report log record
      report.statusCode = result.status;
      report.durationMs = report.endTime - report.startTime;
      // record the request
      if (!isVercelIntegration) {
        logger.logHttpRequest(
          LogLevel.info,
          `${req.method} ${report.path} ${report.statusCode} in ${report.endTime - report.startTime}ms`,
          report,
          {}
        );
      }

      // attach the response status to all children logs
      log.attachResponseStatus(result.status);

      // flush the logger along with the child logger
      await logger.flush();
      return result;
    } catch (error: any) {
      // capture request endTime first for more accurate reporting
      report.endTime = new Date().getTime();
      // set default values for statusCode and logLevel
      let statusCode = 500;
      let logLevel = LogLevel.error;
      // handle navigation errors like notFound and redirect
      if (error instanceof Error) {
        if (error.message === 'NEXT_NOT_FOUND') {
          logLevel = config?.NotFoundLogLevel ?? LogLevel.warn;
          statusCode = 404;
        } else if (error.message === 'NEXT_REDIRECT') {
          logLevel = config?.RedirectLogLevel ?? LogLevel.info;
          // according to Next.js docs, values are: 307 (Temporary) or 308 (Permanent)
          // see: https://nextjs.org/docs/app/api-reference/functions/redirect#why-does-redirect-use-307-and-308
          // extract status code from digest, if exists
          const e: Error & { digest?: string } = error;
          if (e.digest) {
            const d = e.digest.split(';');
            statusCode = parseInt(d[3]);
          } else {
            statusCode = 307;
          }
        }
      }

      // report log record
      report.statusCode = statusCode;
      report.durationMs = report.endTime - report.startTime;

      // record the request
      if (!isVercelIntegration) {
        logger.logHttpRequest(
          logLevel,
          `${req.method} ${report.path} ${report.statusCode} in ${report.endTime - report.startTime}ms`,
          report,
          {}
        );
      }

      // forward the error message as a log event
      log.log(logLevel, error.message, { error });
      log.attachResponseStatus(statusCode);

      await logger.flush();
      throw error;
    }
  };
}

type WithAxiomParam = NextConfig | NextHandler;

function isNextConfig(param: WithAxiomParam): param is NextConfig {
  return typeof param == 'object';
}

// withAxiom can be called either with NextConfig, which will add proxy rewrites
// to improve deliverability of Web-Vitals and logs.
export function withAxiom(param: NextHandler, config?: AxiomRouteHandlerConfig): NextHandler;
export function withAxiom(param: NextConfig): NextConfig;
export function withAxiom(param: WithAxiomParam, config?: AxiomRouteHandlerConfig) {
  if (typeof param == 'function') {
    return withAxiomRouteHandler(param, config);
  } else if (isNextConfig(param)) {
    return withAxiomNextConfig(param);
  }

  return withAxiomRouteHandler(param, config);
}
