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

Deploy your site and watch data coming into your Axiom dashboard.

The log functions are asynchoronus functions, make sure to wait for them
when its appropriate, like when running on serverless/edge functions:

```js
await log.info('function will wait for the log to be sent')
```
