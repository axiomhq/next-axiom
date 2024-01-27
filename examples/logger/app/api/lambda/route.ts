import { withAxiom } from 'next-axiom';

export const runtime = 'nodejs';

export const GET = withAxiom(async (req) => {
  req.log.info('axiom lambda route');
  return new Response('Hello, Next.js!');
});
