import { AxiomRouteHandlerContext, withAxiom } from 'next-axiom';

export const runtime = 'edge';

export const GET = withAxiom(async (req: AxiomRouteHandlerContext) => {
  req.log.info('this is axiom', {runtime: 'edge'});

  return new Response('Hello, Next.js!');
});
