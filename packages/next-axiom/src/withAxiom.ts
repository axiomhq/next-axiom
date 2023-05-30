import { NextConfig } from 'next';
import { NextMiddleware, NextRequest, NextResponse } from 'next/server';
import { Rewrite } from 'next/dist/lib/load-custom-routes';
import { EndpointType, config, Logger, RequestReport } from 'next-axiom-core';
import { generateRequestMeta } from './lib';

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

// Sending logs after res.{json,send,end} is very unreliable.
// This function overwrites these functions and makes sure logs are sent out
// before the response is sent.
// function interceptNextRouteResponse(req: AxiomRequest, res: NextResponse): [NextResponse, Promise<void>[]] {
//   const allPromises: Promise<void>[] = [];

//   const resSend = res.send;
//   res.send = (body: any) => {
//     allPromises.push(
//       (async () => {
//         req.log.attachResponseStatus(res.statusCode);
//         await req.log.flush();
//         resSend(body);
//       })()
//     );
//   };

//   const resJson = res.json;
//   res.json = (json: any) => {
//     allPromises.push(
//       (async () => {
//         req.log.attachResponseStatus(res.statusCode);
//         await req.log.flush();
//         resJson(json);
//       })()
//     );
//   };

//   const resEnd = res.end;
//   res.end = (cb?: () => undefined): NextResponse => {
//     allPromises.push(
//       (async () => {
//         req.log.attachResponseStatus(res.statusCode);
//         await req.log.flush();
//         resEnd(cb);
//       })()
//     );
//     return res;
//   };

//   return [res, allPromises];
// }

export type AxiomRequest = NextRequest & { log: Logger };
export type AxiomRouteHandler = (request: AxiomRequest) => NextResponse | Promise<NextResponse> | void | Promise<void>;

export function withAxiomNextRouteHandler(handler: AxiomRouteHandler): any {
  return async (req: NextRequest) => {
    const report: RequestReport = generateRequestMeta(req);
    const logger = new Logger({}, report, false, 'lambda');
    const axiomRequest = req as AxiomRequest;
    axiomRequest.log = logger;
    // const [wrappedRes, allPromises] = interceptNextRouteResponse(axiomRequest, res);

    try {
      await handler(axiomRequest);
      await logger.flush();
      // await Promise.all(allPromises);
    } catch (error: any) {
      logger.error('Error in API handler', { error });
      logger.attachResponseStatus(500);
      await logger.flush();
      // await Promise.all(allPromises);
      throw error;
    }
  };
}

type WithAxiomParam = NextConfig | AxiomRouteHandler;

function isNextConfig(param: WithAxiomParam): param is NextConfig {
  return typeof param == 'object';
}

function isApiHandler(param: WithAxiomParam): param is AxiomRouteHandler {
  const isFunction = typeof param == 'function';

  // Vercel defines EdgeRuntime for edge functions, but Netlify defines NEXT_RUNTIME = 'edge'
  return isFunction && typeof globalThis.EdgeRuntime === 'undefined' && process.env.NEXT_RUNTIME != 'edge';
}

// withAxiom can be called either with NextConfig, which will add proxy rewrites
// to improve deliverability of Web-Vitals and logs, or with NextApiRequest or
// NextMiddleware which will automatically log exceptions and flush logs.
export function withAxiom(param: NextConfig): NextConfig;
export function withAxiom(param: AxiomRouteHandler): any;
export function withAxiom(param: NextMiddleware): NextMiddleware;
export function withAxiom(param: WithAxiomParam) {
  if (isNextConfig(param)) {
    return withAxiomNextConfig(param);
  } else if (isApiHandler(param)) {
    return withAxiomNextRouteHandler(param);
  }
}
