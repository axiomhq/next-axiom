# @axiomhq/vercel-next [![CI](https://github.com/axiomhq/vercel-next/actions/workflows/ci.yml/badge.svg)](https://github.com/axiomhq/vercel-next/actions/workflows/ci.yml)

![](./web-vitals-dashboard.png)

Send Web-Vitals from Vercel to [Axiom](https://axiom.co).

## Get started

1. Make sure you have the [Axiom Vercel integration](https://www.axiom.co/vercel) installed
2. In your Vercel project, run `npm install --save @axiomhq/vercel-next`
3. Wrap your NextJS config in `withAxiomProxy` like this in `next.config.js`:

```js
const { withAxiomProxy } = require('@axiomhq/vercel-next');

module.exports = withAxiomProxy({
  // ... your existing config
})
```

This will proxy the Axiom ingest call to improve deliverability.

4. Go to `pages/_app.js` or `pages/_app.ts` and add the following line:
```js
export { reportWebVitals } from '@axiomhq/vercel-next';
```

5. Deploy your site and watch data coming into your Axiom dashboard
