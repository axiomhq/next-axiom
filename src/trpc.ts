import { experimental_standaloneMiddleware } from '@trpc/server';
import { Logger, type RequestReport } from './logger';
import { type NextRequest } from 'next/server';

export type axiomTRPCMiddlewareCtx = {
  /**
   * TODO:
   * I think it's probably better to pass req at the root instead of axiomTRPCMeta
   * so that it can also be used in other places instead of possibly needing to be passed twice
   */
  req: Request | NextRequest;
  /**
   * TODO:
   * figure out the best name for this - it's anything you want to stick on all logs
   * that are sent throughout the duration of this procedure.
   */
  axiomTRPCMeta: Record<string, unknown>;
};

export const axiomTRPCMiddleware = experimental_standaloneMiddleware<{
  ctx: axiomTRPCMiddlewareCtx;
}>().create((opts) => {
  const { req } = opts.ctx;

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

  const log = new Logger({
    args: {
      input: opts.rawInput, // TODO: put something if nullish?
      axiomTRPCMeta: opts.ctx.axiomTRPCMeta,
    },
    req: report,
  });

  return opts.next({
    ctx: { log },
  });
});
