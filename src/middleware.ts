import { NextMiddleware, NextResponse } from 'next/server';
import { config as axiomConfig } from './config';
import { EndpointType } from './shared';

const webVitalsEndpoint = axiomConfig.getIngestURL(EndpointType.webVitals);
const logsEndpoint = axiomConfig.getIngestURL(EndpointType.logs);

export const axiomMiddleware =
  (middleware?: NextMiddleware): NextMiddleware =>
  async (request, event) => {
    // If the request is not for axiom, do nothing
    // This is a safety check, as users may add a custom matcher
    if (!request.nextUrl.pathname.startsWith('/_axiom') || typeof axiomConfig.customEndpoint !== 'undefined') {
      return middleware ? middleware(request, event) : undefined;
    }

    const headers = new Headers(request.headers);

    // If we send the host and referrer headers, the request will fail
    headers.delete('host');
    headers.delete('referrer');

    // Add the authorization header
    headers.set('Authorization', 'Bearer ' + axiomConfig.token);
    headers.set('Content-Type', 'application/json');

    let endpoint: string | null = null;

    if (request.nextUrl.pathname.startsWith('/_axiom/web-vitals')) {
      endpoint = webVitalsEndpoint;
    } else if (request.nextUrl.pathname.startsWith('/_axiom/logs')) {
      endpoint = logsEndpoint;
    }

    // Web vitals
    if (endpoint) {
      const response = fetch(endpoint, {
        body: request.body,
        method: 'POST',
        headers: headers,
      }).catch(console.error);
      if (typeof event.waitUntil !== 'undefined') {
        // Forward the request to the axiom ingest endpoint
        event.waitUntil(response);
        // Return a 204 to the client because we are not waiting for the response
        return new NextResponse(null, { status: 204 });
      } else {
        const res = await response;
        if (res) {
          return new NextResponse(res.body, { status: res.status });
        }
        return new NextResponse(null, { status: 500 });
      }
    }
  };
