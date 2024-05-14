import { Logger } from 'next-axiom'
import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'

const logger = new Logger({ source: 'traffic' });

export async function middleware(request: NextRequest, event: NextFetchEvent) {
    const req = {
        ip: request.ip,
        region: request.geo?.region,
        method: request.method,
        host: request.nextUrl.hostname,
        path: request.nextUrl.pathname,
        scheme: request.nextUrl.protocol.split(":")[0],
        referer: request.headers.get('Referer'),
        userAgent: request.headers.get('user-agent'),
    }

    const message = `[${request.method}] [middleware: "middleware"] ${request.nextUrl.pathname}`

    logger.logHttpRequest(message, req, {})


    event.waitUntil(logger.flush())
    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
}