import { NextResponse } from 'next/server'
import { log } from 'next-axiom'

export async function middleware(_req, _ev) {
  log.info("Hello from middleware", { 'bar': 'baz' });
  return NextResponse.next()
}