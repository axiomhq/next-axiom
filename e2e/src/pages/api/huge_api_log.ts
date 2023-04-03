// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { withAxiom } from 'next-axiom'

async function handler(req, res) {
  for(let i = 0; i <= 20; i++) {
    req.log.error('NEXT_AXIOM::HUGE_API_LOG', {filename: 'huge_api_log.ts', count: i})
  }
  res.status(200).json({ name: 'John Doe' })
}

export default withAxiom(handler);
