import { withAxiom } from 'next-axiom';

export const runtime = 'edge';

export const GET = withAxiom(async (req) => {
  req.log.info('fired from edge route');
  return new Response('Hello, Next.js!');
});
