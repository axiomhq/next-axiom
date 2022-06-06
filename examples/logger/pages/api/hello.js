// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { log } from 'next-axiom'

export default async function handler(req, res) {
  await log.info('Hello from function', { url: req.url });
  res.status(200).json({ name: 'John Doe' })
}
