# next-axiom

<a href="https://axiom.co">
<picture>
  <source media="(prefers-color-scheme: dark) and (min-width: 600px)" srcset="https://axiom.co/assets/github/axiom-github-banner-light-vertical.svg">
  <source media="(prefers-color-scheme: light) and (min-width: 600px)" srcset="https://axiom.co/assets/github/axiom-github-banner-dark-vertical.svg">
  <source media="(prefers-color-scheme: dark) and (max-width: 599px)" srcset="https://axiom.co/assets/github/axiom-github-banner-light-horizontal.svg">
  <img alt="Axiom.co banner" src="https://axiom.co/assets/github/axiom-github-banner-dark-horizontal.svg" align="right">
</picture>
</a>
&nbsp;

[![build](https://img.shields.io/github/actions/workflow/status/axiomhq/next-axiom/ci.yml?branch=main&ghcache=unused)](https://github.com/axiomhq/next-axiom/actions?query=workflow%3ACI)
[![Latest release](https://img.shields.io/github/release/axiomhq/next-axiom.svg)](https://github.com/axiomhq/next-axiom/releases/latest)
[![License](https://img.shields.io/github/license/axiomhq/next-axiom.svg?color=blue)](https://opensource.org/licenses/MIT)

[Axiom](https://axiom.co) unlocks observability at any scale.

- **Ingest with ease, store without limits:** Axiom’s next-generation datastore enables ingesting petabytes of data with ultimate efficiency. Ship logs from Kubernetes, AWS, Azure, Google Cloud, DigitalOcean, Nomad, and others.
- **Query everything, all the time:** Whether DevOps, SecOps, or EverythingOps, query all your data no matter its age. No provisioning, no moving data from cold/archive to “hot”, and no worrying about slow queries. All your data, all. the. time.
- **Powerful dashboards, for continuous observability:** Build dashboards to collect related queries and present information that’s quick and easy to digest for you and your team. Dashboards can be kept private or shared with others, and are the perfect way to bring together data from different sources.

For more information, check out the [official documentation](https://axiom.co/docs).

## Introduction

This library allows you to send Web Vitals as well as structured logs from your Next.js application to Axiom.

> Using the Pages Router? Use version `0.*` which continues to receive security patches. Here's the [README for `0.x`](https://github.com/axiomhq/next-axiom/blob/v0.x/README.md).

## Prerequisites

- [Create an Axiom account](https://app.axiom.co/).
- [Create a dataset in Axiom](/docs/reference/datasets) where you send your data.
- [Create an API token in Axiom](/docs/reference/tokens) with permissions to create, read, update, and delete datasets.
- [A new or existing Next.js app](https://nextjs.org/).

## Install next-axiom

1. In your terminal, go to the root folder of your Next.js app, and then run `npm install --save next-axiom` to install the latest version of next-axiom.
2. Add the following environment variables to your Next.js app. For more information, see the [Vercel documentation](https://vercel.com/docs/projects/environment-variables).
    - `NEXT_PUBLIC_AXIOM_DATASET` is the name of the Axiom dataset where you want to send data.
    - `NEXT_PUBLIC_AXIOM_TOKEN` is the Axiom API token you have generated.
3. In the `next.config.ts` file, wrap your Next.js configuration in `withAxiom`:

```js
const { withAxiom } = require('next-axiom');

module.exports = withAxiom({
  // Your existing configuration.
});
```

## Capture traffic requests

To capture traffic requests, create a `middleware.ts` file in the root folder of your Next.js app:

```ts
import { Logger } from 'next-axiom'
import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'

export async function middleware(request: NextRequest, event: NextFetchEvent) {
    const logger = new Logger({ source: 'middleware' }); // traffic, request
    logger.middleware(request)

    event.waitUntil(logger.flush())
    return NextResponse.next()

// For more information, see Matching Paths below
export const config = {
}
```

`logger.middleware` accepts a configuration object as the second argument. This object can contain the following properties:

- `logRequestDetails`: Accepts a boolean or an array of keys. If you pass `true`, it will add all the request details to the log (method, URL, headers, etc.). If you pass an array of strings, it will only add the specified keys. See [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request/url) and [NextRequest](https://nextjs.org/docs/app/api-reference/functions/next-request) for documentation on the available keys. If `logRequestDetails` is enabled the function will return a Promise that needs to be awaited.

```ts
export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const logger = new Logger({ source: "middleware" });
  await logger.middleware(request, { logRequestDetails: ["body", "nextUrl"] });

  event.waitUntil(logger.flush());
  return NextResponse.next();
}
```

## Web Vitals

To send Web Vitals to Axiom, add the `AxiomWebVitals` component from next-axiom to the `app/layout.tsx` file:

```ts
import { AxiomWebVitals } from 'next-axiom';

export default function RootLayout() {
  return (
    <html>
      ...
      <AxiomWebVitals />
      <div>...</div>
    </html>
  );
}
```

Web Vitals are only sent from production deployments.

## Logs

Send logs to Axiom from different parts of your app. Each log function call takes a message and an optional `fields` object.

```ts
log.debug('Login attempt', { user: 'j_doe', status: 'success' }); // Results in {"message": "Login attempt", "fields": {"user": "j_doe", "status": "success"}}
log.info('Payment completed', { userID: '123', amount: '25USD' });
log.warn('API rate limit exceeded', { endpoint: '/users/1', rateLimitRemaining: 0 });
log.error('System Error', { code: '500', message: 'Internal server error' });
```

### Route handlers

Wrap your route handlers in `withAxiom` to add a logger to your request and log exceptions automatically:

```ts
import { withAxiom, AxiomRequest } from 'next-axiom';

export const GET = withAxiom((req: AxiomRequest) => {
  req.log.info('Login function called');

  // You can create intermediate loggers
  const log = req.log.with({ scope: 'user' });
  log.info('User logged in', { userId: 42 });

  return NextResponse.json({ hello: 'world' });
});
```

Route handlers accept a configuration object as the second argument. This object can contain the following properties:

- `logRequestDetails`: Accepts a boolean or an array of keys. If you pass `true`, it will add all the request details to the log (method, URL, headers, etc.). If you pass an array of strings, it will only add the specified keys. See [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request/url) and [NextRequest](https://nextjs.org/docs/app/api-reference/functions/next-request) for documentation on the available keys.


- `NotFoundLogLevel`: Override the log level for NOT_FOUND errors. Defaults to `warn`.

- `RedirectLogLevel`: Override the log level for NEXT_REDIRECT errors. Defaults to `info`.


Config example: 

```ts
export const GET = withAxiom(
  async () => {
    return new Response("Hello World!");
  },
  { 
    logRequestDetails: ['body', 'nextUrl'], // { logRequestDetails: true } is also valid
    NotFoundLogLevel: 'error',
    RedirectLogLevel: 'debug',
  }
);
```

### Client components

To send logs from client components, add `useLogger` from next-axiom to your component:

```ts
'use client';
import { useLogger } from 'next-axiom';

export default function ClientComponent() {
  const log = useLogger();
  log.debug('User logged in', { userId: 42 });
  return <h1>Logged in</h1>;
}
```

### Server components

To send logs from server components, add `Logger` from next-axiom to your component, and call flush before returning:

```ts
import { Logger } from 'next-axiom';

export default async function ServerComponent() {
  const log = new Logger();
  log.info('User logged in', { userId: 42 });

  // ...

  await log.flush();
  return <h1>Logged in</h1>;
}
```

### Log levels

The log level defines the lowest level of logs sent to Axiom. Choose one of the following levels (from lowest to highest):

- `debug` is the default setting. It means that you send all logs to Axiom.
- `info`
- `warn`
- `error` means that you only send the highest-level logs to Axiom.
- `off` means that you don't send any logs to Axiom.

For example, to send all logs except for debug logs to Axiom:

```sh
export NEXT_PUBLIC_AXIOM_LOG_LEVEL=info
```

## Middleware tunneling (beta)

Axiom supports using `middleware.ts` files to proxy logs and webVitals to Axiom, this avoids the need to declare the `AXIOM_TOKEN` as a public environment variable.

To enable this feature, add the following code to your `middleware.ts` file:

```ts
import { axiomMiddleware } from 'next-axiom';

export const middleware = axiomMiddleware();

export const config = {
  matcher: '/_axiom/:path*', // Makes it so that the middleware only fires for requests that match this path, if you are using a custom middleware, see the example below
};
```

You can also pass your own middleware to the Axiom Middleware:

```ts
import { axiomMiddleware } from 'next-axiom';

const myMiddleware = (request, event) => {
  // Do something with the request
  return NextResponse.next();
};

export const middleware = axiomMiddleware(myMiddleware);

export const config = {
  /** This is an example matcher you might want to use if you are using a custom middleware reference the [Next.js docs](https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher) for more information */
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)', 
};
```
and in your environment variables, change the `NEXT_PUBLIC_AXIOM_TOKEN` to `AXIOM_TOKEN`.

This will proxy all requests to `/_axiom/logs` and `/_axiom/web-vitals` to Axiom using the middleware as a proxy layer.

## Capture errors

To capture routing errors, use the [error handling mechanism of Next.js](https://nextjs.org/docs/app/building-your-application/routing/error-handling):

1. Go to the `app` folder.
2. Create an `error.tsx` file.
3. Inside your component function, add `useLogger` from next-axiom to send the error to Axiom. For example:

```ts
"use client";

import { useLogger, LogLevel } from "next-axiom";
import { usePathname } from "next/navigation";

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const pathname = usePathname()
  const log = useLogger({ source: "error.tsx" });
  let status =  error.message == 'Invalid URL' ? 404 : 500;

  log.logHttpRequest(
    LogLevel.error,
    error.message,
    {
      host: window.location.href,
      path: pathname,
      statusCode: status,
    },
    {
      error: error.name,
      cause: error.cause,
      stack: error.stack,
      digest: error.digest,
    },
  );

  return (
    <div className="p-8">
      Ops! An Error has occurred:{" "}
      <p className="text-red-400 px-8 py-2 text-lg">`{error.message}`</p>
      <div className="w-1/3 mt-8">
        <NavTable />
      </div>
    </div>
  );
}
```

## Upgrade to the App Router

next-axiom switched to support the App Router starting with version 1.0. If you are upgrading a Pages Router app with next-axiom v0.x to the App Router, you will need to make the following changes:

- Upgrade next-axiom to version 1.0.0 or higher
- Make sure that exported variables has `NEXT_PUBLIC_` prefix, e.g: `NEXT_PUBLIC_AXIOM_TOKEN`
- Use `useLogger` hook in client components instead of `log` prop
- For server side components, you will need to create an instance of `Logger` and flush the logs before component returns.
- For web-vitals, remove `reportWebVitals()` and instead add the `AxiomWebVitals` component to your layout.

## FAQ

### How can I send logs from Vercel preview deployments?

The Axiom Vercel integration sets up an environment variable called `NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT`, which by default is only enabled for the production environment. To send logs from preview deployments, go to your site settings in Vercel and enable preview deployments for that environment variable.

### How can I extend the logger?

You can use `log.with` to create an intermediate logger, for example:

```typescript
const logger = userLogger().with({ userId: 42 });
logger.info('Hi'); // will ingest { ..., "message": "Hi", "fields" { "userId": 42 }}
```

## License

Distributed under the [MIT License](LICENSE).
