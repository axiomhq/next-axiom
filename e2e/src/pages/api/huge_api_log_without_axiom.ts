// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
async function handler(req, res) {
  for(let i = 0; i <= 20; i++) {
    console.log('CONSOLE_LOG::HUGE_API_LOG', {filename: 'huge_api_log.ts', count: i})
  }
  res.status(200).json({ name: 'Huge Console Log' })
}

export default handler;
