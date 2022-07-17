import { NextConfig, NextApiHandler, NextApiResponse } from 'next';
import { proxyPath, EndpointType, getIngestURL } from './shared';
import { NextMiddleware } from 'next/server';

import { log } from './logger';

function withAxiomNextConfig(nextConfig: NextConfig): NextConfig {
  return {
    ...nextConfig,
    rewrites: async () => {
      const rewrites = await nextConfig.rewrites?.();

      const webVitalsEndpoint = getIngestURL(EndpointType.webVitals);
      const logsEndpoint = getIngestURL(EndpointType.logs);
      if (!webVitalsEndpoint && !logsEndpoint) {
        log.warn(
          'axiom: Envvars not detected. If this is production please see https://github.com/axiomhq/next-axiom for help'
        );
        log.warn('axiom: Sending Web Vitals to /dev/null');
        log.warn('axiom: Sending logs to console');
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
        rewrites.afterFiles = (rewrites.afterFiles || []).concat(axiomRewrites);
        return rewrites;
      }
    },
  };
}

// Sending logs after res.{json,send,end} is very unreliable.
// This function overwrites these functions and makes sure logs are sent out
// before the response is sent.
function interceptNextApiResponse(res: NextApiResponse): [NextApiResponse, Promise<void>[]] {
  const allPromises: Promise<void>[] = [];

  const resSend = res.send;
  res.send = (body: any) => {
    allPromises.push(
      (async () => {
        await log.flush();
        resSend(body);
      })()
    );
  };

  const resJson = res.json;
  res.json = (json: any) => {
    allPromises.push(
      (async () => {
        await log.flush();
        resJson(json);
      })()
    );
  };

  const resEnd = res.end;
  res.end = (cb?: () => undefined): NextApiResponse => {
    allPromises.push(
      (async () => {
        await log.flush();
        resEnd(cb);
      })()
    );
    return res;
  };

  return [res, allPromises];
}

function withAxiomNextApiHandler(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const [wrappedRes, allPromises] = interceptNextApiResponse(res);

    try {
      await handler(req, wrappedRes);
      await log.flush();
      await Promise.all(allPromises);
    } catch (error) {
      log.error('Error in API handler', { error });
      await log.flush();
      await Promise.all(allPromises);
      throw error;
    }
  };
}

function withAxiomNextMiddleware(handler: NextMiddleware): NextMiddleware {
  return async (req, ev) => {
    try {
      const res = await handler(req, ev);
      ev.waitUntil(log.flush());
      return res;
    } catch (error) {
      log.error('Error in middleware', { error });
      ev.waitUntil(log.flush());
      throw error;
    }
  };
}

type WithAxiomParam = NextConfig | NextApiHandler | NextMiddleware;

function isNextConfig(param: WithAxiomParam): param is NextConfig {
  return typeof param == 'object';
}

function isApiHandler(param: WithAxiomParam): param is NextApiHandler {
  // This is pretty hacky, but if you call withAxiom in a serverless function,
  // the environment variable will be set.
  // The middleware runs on CloudFlare workers which doesn't expose that env.
  return typeof param == 'function' && !!process.env.LAMBDA_TASK_ROOT;
}

// withAxiom can be called either with NextConfig, which will add proxy rewrites
// to improve deliverability of Web-Vitals and logs, or with NextApiRequest or
// NextMiddleware which will automatically log exceptions and flush logs.
export function withAxiom<T extends WithAxiomParam>(param: T): T {
  if (isNextConfig(param)) {
    return withAxiomNextConfig(param) as T;
  } else if (isApiHandler(param)) {
    return withAxiomNextApiHandler(param) as T;
  } else {
    return withAxiomNextMiddleware(param) as T;
  }
}
