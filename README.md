![next-axiom: The official Next.js library for Axiom](.github/images/banner-dark.svg#gh-dark-mode-only)
![next-axiom: The official Next.js library for Axiom](.github/images/banner-light.svg#gh-light-mode-only)

<div align="center">

[![build](https://img.shields.io/github/actions/workflow/status/axiomhq/next-axiom/ci.yml?branch=main&ghcache=unused)](https://github.com/axiomhq/next-axiom/actions?query=workflow%3ACI)
[![Latest release](https://img.shields.io/github/release/axiomhq/next-axiom.svg)](https://github.com/axiomhq/next-axiom/releases/latest)
[![License](https://img.shields.io/github/license/axiomhq/next-axiom.svg?color=blue)](https://opensource.org/licenses/MIT)

</div>

> **info** This documentation is for Nextjs 13 with app directory support, if you are looking for Nextjs 12 support, please check out the [next12-axiom docs](./packages/next12-axiom/README.md). If you want to migrate to Nextjs 13, please check out the [upgrade guide](#upgrade-to-nextjs-13).


## Installation

### Using Vercel Integration

Make sure you have the [Axiom Vercel integration](https://www.axiom.co/vercel) installed. Once it is done, perform the steps below: 

- In your Next.js project, run install `next-axiom` as follows:

```sh
npm install --save next-axiom
```

- In the `next.config.js` file, wrap your Next.js config in `withAxiom` as follows:

```js
const { withAxiom } = require('next-axiom');

module.exports = withAxiom({
  // ... your existing config
});
```

### Using Any Other Platform

Create an API token in [Axiom settings](https://cloud.axiom.co/settings/profile) and export it as `NEXT_PUBLIC_AXIOM_TOKEN`, as well as the Axiom dataset name as `NEXT_PUBLIC_AXIOM_DATASET`. Once it is done, perform the steps below:

- In your Next.js project, run install `next-axiom` as follows:

```sh
npm install --save next-axiom
```

- In the `next.config.js` file, wrap your Next.js config in `withAxiom` as follows:

```js
const { withAxiom } = require('next-axiom');

module.exports = withAxiom({
  // ... your existing config
});
```

## Usage

### Web Vitals

Go to `app/layout.tsx` and add the following line to import web vitals component:

```js
export { AxiomWebVitals } from 'next-axiom';
```

then add the component to your layout:

```js
return (
  <html>
    ...
    <AxiomWebVitals />
    <div>...</div>
  </html>
);
```

> **Note**: WebVitals are only sent from production deployments.

Wrapping your handlers in `withAxiom` will make `req.log` available and log
exceptions:

```ts
import { withAxiom, AxiomRequest } from 'next-axiom';

export const GET = withAxiom((req: AxiomRequest) => {
  req.log.info('Login function called');

  // You can create intermediate loggers
  const log = req.log.with({ scope: 'user' });
  log.info('User logged in', { userId: 42 });

  return NextResponse.json({ hello: 'world' });
})

```

Import and use `useLogger` hook in **client components** like this:

```js
'use client';
import { useLogger } from `next-axiom`;

// pages/index.js
function home() {
    const log = useLogger();
    log.debug('User logged in', { userId: 42 })
    ...
}
```

For **server side components** you will have to create an instance  make sure to flush the logs before component returns

```js
import { Logger } from `next-axiom`;

function RSC() {
  const log = new Logger();
  log.info('...')

  ...

  await log.flush();
  return (...)
}
```

### Log Levels

The log level defines the lowest level of logs sent to Axiom.
The default is debug, resulting in all logs being sent.
Available levels are (from lowest to highest): `debug`, `info`, `warn`, `error`

For example, if you don't want debug logs to be sent to Axiom:

```sh
export NEXT_PUBLIC_AXIOM_LOG_LEVEL=info
```

You can also disable logging completely by setting the log level to `off`:

```sh
export NEXT_PUBLIC_AXIOM_LOG_LEVEL=off
```

## Upgrade to Next.js 13

next-axiom switched to support Next.js 13 with app directory support starting version 0.19.0. If you are upgrading from Next.js 12, you will need to make the following changes:

- upgrade next-axiom to version 0.19.0 or higher
- use `useLogger` hook in client components instead of `log` prop
- for server side components, you will need to create an instance of `Logger` and flush the logs before component returns.
- for web-vitals, import the the `AxiomWebVitals` component and add it to your layout


## FAQ

### How can I send logs from Vercel preview deployments?
The Axiom Vercel integration sets up an environment variable called `NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT`, which by default is only enabled for the production environment. To send logs from preview deployments, go to your site settings in Vercel and enable preview deployments for that environment variable.

### How can I extend the logger?
You can use `log.with` to create an intermediate logger, for example:
```ts
const logger = userLogger().with({ userId: 42 })
logger.info("Hi") // will ingest { ..., "message": "Hi", "fields" { "userId": 42 }}
```

## License

Distributed under the [MIT License](LICENSE).
