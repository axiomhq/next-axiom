import { useLogger } from "next-axiom"

export async function GET(req: Request) {
  const [log] = useLogger()
  log.info('this is axiom')
  return new Response('Hello, Next.js!')
}
