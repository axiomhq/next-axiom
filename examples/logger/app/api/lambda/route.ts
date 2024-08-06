import { AxiomRequest, withAxiom } from 'next-axiom';

export const runtime = 'nodejs';

export const GET = withAxiom(async (req: AxiomRequest) => {
  req.log.info('axiom lambda route', {
    method: req.method,
    author: 'Islam Sheata',
    purpose: 'testing',
  });
  return new Response('Hello, Next.js!');
});
