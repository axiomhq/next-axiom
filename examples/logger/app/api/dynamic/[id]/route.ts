import { AxiomRequest, withAxiom } from 'next-axiom';

export const runtime = 'edge';

export const POST = withAxiom(
  (req: AxiomRequest, { params }: { params: { id: string } }) => {
    req.log.info('axiom dynamic route');
    return new Response(`Hello, Next.js! ${params.id}`);
  },
);
