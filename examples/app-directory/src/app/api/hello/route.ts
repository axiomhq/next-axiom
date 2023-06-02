import { useLogger } from "next-axiom"
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const [log] = useLogger({req})
  log.info('this is axiom')
  
  await log.flush();
  return new Response('Hello, Next.js!')
}
