import { withAxiom, AxiomRequest } from 'next-axiom';

export const config = {
  runtime: 'edge',
};

function handler(req: AxiomRequest) {
  req.log.debug('message from edge', { foo: 'bar' });

  return new Response(
    JSON.stringify({
      message: 'Hello, world!',
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    },
  );
}

export default withAxiom(handler);
