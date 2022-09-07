import { withAxiom } from 'next-axiom'

export const config = {
    runtime: 'experimental-edge',
};

function handler(req) {
    req.log.debug("message from edge", { foo: 'bar' })

    throw new Error('Hello from edge error');

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


export default withAxiom(handler);
