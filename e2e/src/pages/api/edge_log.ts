// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { withAxiom } from 'next-axiom'

// this runs on vercel, should be no need for async/await
async function handler(req, _ev) {
    req.log.warn('NEXT_AXIOM::EDGE_LOG', {filename: 'edge_log.ts', req: req.geo})
    
    return new Response(
        JSON.stringify({
            message: 'Hello, world!',
        }),
        {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
        }
    )
}

export const config = {
    runtime: 'experimental-edge',
};
  
export default withAxiom(handler);
