import { type NextRequest } from 'next/server';

export const isNoPrettyPrint = process.env.AXIOM_NO_PRETTY_PRINT == 'true' ? true : false;

export enum EndpointType {
  webVitals = 'web-vitals',
  logs = 'logs',
}

export interface RequestJSON {
  method: string;
  url: string;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  nextUrl?: {
    basePath: string;
    buildId?: string;
    defaultLocale?: string;
    domainLocale?: {
      defaultLocale: string;
      domain: string;
      locales?: string[];
    };
    hash: string;
    host: string;
    hostname: string;
    href: string;
    locale?: string;
    origin: string;
    password: string;
    pathname: string;
    port: string;
    protocol: string;
    search: string;
    searchParams: Record<string, string>;
    username: string;
  };
  ip?: string;
  geo?: {
    city?: string;
    country?: string;
    region?: string;
    latitude?: string;
    longitude?: string;
  };
  body?: any;
  cache: {
    mode: RequestCache;
    credentials: RequestCredentials;
    redirect: RequestRedirect;
    referrerPolicy: ReferrerPolicy;
    integrity: string;
  };
  mode: RequestMode;
  destination: RequestDestination;
  referrer: string;
  keepalive: boolean;
  signal: {
    aborted: boolean;
    reason: any;
  };
}

/**
 * Transforms a NextRequest or Request object into a JSON-serializable object
 */
export async function requestToJSON(request: Request | NextRequest): Promise<RequestJSON> {
  // Get all headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let cookiesData: Record<string, string> = {};
  if ('cookies' in request) {
    request.cookies.getAll().forEach((cookie) => {
      cookiesData[cookie.name] = cookie.value;
    });
  } else {
    const cookieHeader = headers['cookie'];
    if (cookieHeader) {
      cookiesData = Object.fromEntries(
        cookieHeader.split(';').map((cookie) => {
          const [key, value] = cookie.trim().split('=');
          return [key, value];
        })
      );
    }
  }

  let nextUrlData: RequestJSON['nextUrl'] | undefined;
  if ('nextUrl' in request) {
    const nextUrl = request.nextUrl;
    nextUrlData = {
      basePath: nextUrl.basePath,
      buildId: nextUrl.buildId,
      hash: nextUrl.hash,
      host: nextUrl.host,
      hostname: nextUrl.hostname,
      href: nextUrl.href,
      origin: nextUrl.origin,
      password: nextUrl.password,
      pathname: nextUrl.pathname,
      port: nextUrl.port,
      protocol: nextUrl.protocol,
      search: nextUrl.search,
      searchParams: Object.fromEntries(nextUrl.searchParams.entries()),
      username: nextUrl.username,
    };
  }

  let body: RequestJSON['body'] | undefined;
  if (request.body) {
    try {
      const clonedRequest = request.clone();
      try {
        body = await clonedRequest.json();
        clonedRequest.body?.getReader;
      } catch {
        body = await clonedRequest.text();
      }
    } catch (error) {
      console.warn('Could not parse request body:', error);
    }
  }

  const cache: RequestJSON['cache'] = {
    mode: request.cache,
    credentials: request.credentials,
    redirect: request.redirect,
    referrerPolicy: request.referrerPolicy,
    integrity: request.integrity,
  };

  let ip: string | undefined;
  if ('ip' in request) {
    ip = request.ip;
  }

  let geo: NextRequest['geo'] | undefined;
  if ('geo' in request) {
    geo = request.geo;
  }

  return {
    method: request.method,
    url: request.url,
    headers,
    cookies: cookiesData,
    nextUrl: nextUrlData,
    ip,
    geo,
    body,
    cache,
    mode: request.mode,
    destination: request.destination,
    referrer: request.referrer,
    keepalive: request.keepalive,
    signal: {
      aborted: request.signal.aborted,
      reason: request.signal.reason,
    },
  };
}

export const throttle = (fn: Function, wait: number) => {
  let lastFn: ReturnType<typeof setTimeout>, lastTime: number;
  return function (this: any) {
    const context = this,
      args = arguments;

    // First call, set lastTime
    if (lastTime == null) {
      lastTime = Date.now();
    }

    clearTimeout(lastFn);
    lastFn = setTimeout(
      () => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      },
      Math.max(wait - (Date.now() - lastTime), 0)
    );
  };
};
