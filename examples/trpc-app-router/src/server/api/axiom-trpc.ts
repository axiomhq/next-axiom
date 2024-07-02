import { initTRPC } from "@trpc/server";
import { type NextRequest } from "next/server";
import { type AxiomRequest, Logger } from "next-axiom";
import { type createTRPCContext } from "./trpc";

export type NextAxiomTRPCMiddlewareCtx = {
  /**
   * We are passing the entire req object. This means:
   * - we have access to it in the procedure
   * - because it's typed as NextRequest, the logger will be visible to TS at `ctx.log` but not on `ctx.res`
   */
  req: NextRequest;
  /**
   * Anything you want to stick on all logs that are sent throughout the duration of the current procedure
   * This is currently not optional, but can pass an empty object.
   */
  axiomTRPCMeta: Record<string, unknown>;
};

function isAxiomRequest(req: unknown): req is AxiomRequest {
  return (req as NextRequest & { log: Logger }).log instanceof Logger;
}

export function createAxiomPlugin() {
  const t = initTRPC
    .context<typeof createTRPCContext>()
    // Add meta if required
    // .meta<{}>()
    .create();

  return {
    axiomProcedure: t.procedure.use((opts) => {
      const req = opts.ctx.req;

      if (!isAxiomRequest(req)) {
        throw new Error(
          "`nextAxiomTRPCMiddleware` could not find logger. Did you forget to wrap your route handler in `withAxiom`? See: TODO: link to docs"
        );
      }

      const log = req.log.with({ axiomTRPCMeta: opts.ctx.axiomTRPCMeta });

      return opts.next({
        ctx: { log },
      });
    }),
  };
}
