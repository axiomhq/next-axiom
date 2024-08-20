import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { config as axiomConfig } from './config';
import { EndpointType } from './shared';

const webVitalsEndpoint = axiomConfig.getIngestURL(EndpointType.webVitals);
const logsEndpoint = axiomConfig.getIngestURL(EndpointType.logs);

const headers = {
  authorization: 'Bearer ' + axiomConfig.token,
  'Content-Type': 'application/json',
};

export async function middleware(request: NextRequest, event: NextFetchEvent): Promise<NextResponse<unknown> | void> {
  // If the request is not for axiom, do nothing
  // This is a safety check, as users may add a custom matcher
  if (!request.nextUrl.pathname.startsWith('/_axiom')) return;

  // Web vitals
  if (request.nextUrl.pathname.startsWith('/_axiom/web-vitals')) {
    // Forward the request to the axiom ingest endpoint
    event.waitUntil(
      fetch(webVitalsEndpoint, {
        body: request.body,
        method: 'POST',
        headers,
      }).catch(console.error)
    );

    // Return a 204 to the client
    return new NextResponse(null, { status: 204 });
  }

  // Logs
  if (request.nextUrl.pathname.startsWith('/_axiom/logs')) {
    // Forward the request to the axiom ingest endpoint
    event.waitUntil(
      fetch(logsEndpoint, {
        body: request.body,
        method: 'POST',
        headers,
      }).catch(console.error)
    );

    // Return a 204 to the client
    return new NextResponse(null, { status: 204 });
  }
}

export const config = {
  matcher: '/_axiom/:path*',
};
