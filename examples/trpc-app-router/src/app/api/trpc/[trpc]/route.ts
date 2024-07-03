import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { withAxiomRouteHandler } from 'next-axiom';
import { type NextRequest } from 'next/server';

import { appRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const handler = withAxiomRouteHandler((req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
            );
          }
        : undefined,
  }),
);

export { handler as GET, handler as POST };
