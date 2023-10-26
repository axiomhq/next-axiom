import { withAxiom } from 'next-axiom';

export const runtime = 'edge';

export const POST = withAxiom((req, { params }: { params: { id: string}}) => {
    req.log.info('axiom dynamic route');
    return new Response(`Hello, Next.js! ${params.id}`);
})