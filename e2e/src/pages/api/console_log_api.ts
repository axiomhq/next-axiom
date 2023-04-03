// Next.js API route support: https://nextjs.org/docs/api-routes/introduction


export default function handler(req, res) {
  console.log('CONSOLE_LOG::API_LOG', {filename: 'console_log_edge.ts'})
  res.status(200).json({ name: 'John Doe' })
}
