import { log, withAxiom } from 'next-axiom'

export const config = {
    runtime: 'experimental-edge',
};

function handler(req) {
    
    log.debug("message from edge", { foo: 'bar' })

    return new Response(
        JSON.stringify({
            req,
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
