import { AxiomRequest, withAxiom } from 'next-axiom';

export const runtime = 'edge';

export const GET = withAxiom(async (req: AxiomRequest) => {
  req.log.info('fired from edge route', {
    method: req.method,
    author: 'Islam Sheata',
    purpose: 'testing',
  });
  return new Response('Hello, Next.js!');
});
