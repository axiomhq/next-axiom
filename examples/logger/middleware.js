import { NextResponse } from 'next/server'
import { withAxiom } from 'next-axiom'

async function middleware(_req, ev) {
  req.log.info("Hello from middleware", { 'bar': 'baz' });
  return NextResponse.next()
}

export default withAxiom(middleware)