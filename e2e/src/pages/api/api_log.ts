// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { withAxiom } from 'next-axiom'

async function handler(req, res) {
  req.log.error('NEXT_AXIOM::API_LOG', {filename: 'api_log.ts'})
  res.status(200).json({ name: 'John Doe' })
}

export default withAxiom(handler);
