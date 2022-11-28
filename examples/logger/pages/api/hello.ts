// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next'
import { withAxiom, AxiomAPIRequest } from 'next-axiom'

async function handler(req: AxiomAPIRequest, res: NextApiResponse) {
  req.log.info('Hello from function', { url: req.url });
  res.status(200).json({ name: 'John Doe' })
}

export default withAxiom(handler)
