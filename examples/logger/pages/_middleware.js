import { NextResponse } from 'next/server'
import { log } from 'next-axiom'

export async function middleware(_req, ev) {
  log.info("Hello from middleware", { 'bar': 'baz' });
  // if the middleware function is not running on Vercel, flush 
  // to ensure log delivery.
  ev.waitUntil(log.flush());
  return NextResponse.next()
}