// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { log } from 'next-axiom'

export default async function handler(req, res) {
  log.info('Hello from function', { url: req.url });
  await log.flush()
  res.status(200).json({ name: 'John Doe' })
}
