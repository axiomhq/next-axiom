import { NextConfig } from 'next';
import { Rewrite } from 'next/dist/lib/load-custom-routes';
import { config, isEdgeRuntime, isVercelIntegration } from './config';
import { LogLevel, Logger, RequestReport } from './logger';
import { type NextRequest, type NextResponse } from 'next/server';
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

export interface RequestJSON {
  method: string;
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  cookies: Record<string, string>;
  nextUrl?: {
    basePath: string;
    buildId?: string;
    defaultLocale?: string;
    domainLocale?: {
      defaultLocale: string;
      domain: string;
      locales?: string[];
    };
    hash: string;
    host: string;
    hostname: string;
    href: string;
    locale?: string;
    origin: string;
    password: string;
    pathname: string;
    port: string;
    protocol: string;
    search: string;
    searchParams: Record<string, string>;
    username: string;
  };
  ip?: string;
  geo?: {
    city?: string;
    country?: string;
    region?: string;
    latitude?: string;
    longitude?: string;
  };
  body?: any;
  cache: {
    mode: RequestCache;
    credentials: RequestCredentials;
    redirect: RequestRedirect;
    referrerPolicy: ReferrerPolicy;
    integrity: string;
  };
  mode: RequestMode;
  destination: RequestDestination;
  referrer: string;
  keepalive: boolean;
  signal: {
    aborted: boolean;
    reason: any;
  };
}

/**
 * Transforms a Next.js Request object into a JSON-serializable object
 */
export async function requestToJSON(request: Request | NextRequest): Promise<RequestJSON> {
  // Get all headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const url = new URL(request.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  let cookiesData: Record<string, string> = {};
  if ('cookies' in request) {
    request.cookies.getAll().forEach((cookie) => {
      cookiesData[cookie.name] = cookie.value;
    });
  } else {
    const cookieHeader = headers['cookie'];
    if (cookieHeader) {
      cookiesData = Object.fromEntries(
        cookieHeader.split(';').map((cookie) => {
          const [key, value] = cookie.trim().split('=');
          return [key, value];
        })
      );
    }
  }

  let nextUrlData: RequestJSON['nextUrl'] | undefined;
  if ('nextUrl' in request) {
    const nextUrl = request.nextUrl;
    nextUrlData = {
      basePath: nextUrl.basePath,
      buildId: nextUrl.buildId,
      hash: nextUrl.hash,
      host: nextUrl.host,
      hostname: nextUrl.hostname,
      href: nextUrl.href,
      origin: nextUrl.origin,
      password: nextUrl.password,
      pathname: nextUrl.pathname,
      port: nextUrl.port,
      protocol: nextUrl.protocol,
      search: nextUrl.search,
      searchParams: Object.fromEntries(nextUrl.searchParams.entries()),
      username: nextUrl.username,
    };
  }

  let body: RequestJSON['body'] | undefined;
  if (request.body) {
    try {
      const clonedRequest = request.clone();
      try {
        body = await clonedRequest.json();
      } catch {
        body = await clonedRequest.text();
      }
    } catch (error) {
      console.warn('Could not parse request body:', error);
    }
  }

  const cache: RequestJSON['cache'] = {
    mode: request.cache,
    credentials: request.credentials,
    redirect: request.redirect,
    referrerPolicy: request.referrerPolicy,
    integrity: request.integrity,
  };

  let ip: string | undefined;
  if ('ip' in request) {
    ip = request.ip;
  }

  let geo: NextRequest['geo'] | undefined;
  if ('geo' in request) {
    geo = request.geo;
  }

  return {
    method: request.method,
    url: request.url,
    headers,
    params,
    cookies: cookiesData,
    nextUrl: nextUrlData,
    ip,
    geo,
    body,
    cache,
    mode: request.mode,
    destination: request.destination,
    referrer: request.referrer,
    keepalive: request.keepalive,
    signal: {
      aborted: request.signal.aborted,
      reason: request.signal.reason,
    },
  };
}

export type AxiomRequest = NextRequest & { log: Logger };
type NextHandler<T = any> = (
  req: AxiomRequest,
  arg?: T
) => Promise<Response> | Promise<NextResponse> | NextResponse | Response;

type AxiomRouteHandlerConfig = {
  logReq?: boolean | (keyof RequestJSON)[];
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

    const logReq = Array.isArray(config?.logReq) || config?.logReq === true ? await requestToJSON(req) : undefined;

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
      logReq: Array.isArray(config?.logReq)
        ? (Object.fromEntries(
            Object.entries(logReq as RequestJSON).filter(([key]) =>
              (config?.logReq as (keyof RequestJSON)[]).includes(key as keyof RequestJSON)
            )
          ) as RequestJSON)
        : logReq,
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
