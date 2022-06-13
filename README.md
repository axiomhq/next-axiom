# next-axiom [![CI](https://github.com/axiomhq/next-axiom/actions/workflows/ci.yml/badge.svg)](https://github.com/axiomhq/next-axiom/actions/workflows/ci.yml)

![](./web-vitals-dashboard.png)

Send Web-Vitals and logs from Next.js to [Axiom](https://axiom.co).

## Get started

1. Make sure you have the [Axiom Vercel integration](https://www.axiom.co/vercel) installed or export `NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT`
2. In your Next.js project, run `npm install --save next-axiom`
3. Wrap your Next.js config in `withAxiom` like this in `next.config.js`:

```js
const { withAxiom } = require('next-axiom');

module.exports = withAxiom({
  // ... your existing config
})
```

This will proxy the Axiom ingest call from the frontend to improve deliverability.

## Reporting WebVitals

1. Go to `pages/_app.js` or `pages/_app.ts` and add the following line:
```js
export { reportWebVitals } from 'next-axiom';
```

## Sending Logs

:warning: If you log from a function, please call `await log.flush()` at the end
to ensure log delivery. When using a middleware, run `ev.waitUntil(log.flush())`
instead.

### Running on Vercel platform

When you send logs from a function or middleware running on vercel platform, you don't have to the logs will be printed to stdout
with a unique prefix `AXIOM::LOG=`, that allows Axiom to parse those structured logs as inteded. 

Allowing the functiond to finish its work without waiting for the logs to be sent.

:warning: If you log from a function running on vercel, no need to await or flush the logs. In case of vercel
functions, the logs are **not** sent in async mode.

1. Import Axiom's logger
```js
import { log } from 'next-axiom';
```

2. Use the logger to send logs to Axiom, you can attach other metadata to your 
logs by passing them as parameters:
```js
log.info('hello, world!')
log.debug('debugging information', { foo: 'bar', x: 'y' })
log.warn('be careful!')
log.error('oops!')
```

Deploy your site and watch data coming into your Axiom dataset.
