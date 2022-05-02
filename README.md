# @axiomhq/vercel-web-vitals [![CI](https://github.com/axiomhq/vercel-web-vitals/actions/workflows/ci.yml/badge.svg)](https://github.com/axiomhq/vercel-web-vitals/actions/workflows/ci.yml)

Send Web-Vitals from Vercel to [Axiom](https://axiom.co).

## Get started with NextJS

1. Make sure you have the [Axiom Vercel integration](https://www.axiom.co/vercel) installed
2. In your Vercel project, run `npm install --save @axiomhq/vercel-web-vitals`
3. Wrap your NextJS config in `withAxiomProxy` like this in `next.config.js`:

```js
const { withAxiomProxy } = require('@axiomhq/vercel-web-vitals');

module.exports = withAxiomProxy({
  // ... your existing config
})
```

This will proxy the Axiom ingest call to improve deliverability.

3. Go to `pages/_app.js` or `pages/_app.ts` and add the following line:
```js
export { reportWebVitals } from '@axiomhq/vercel-web-vitals';
```
