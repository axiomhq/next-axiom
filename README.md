![next-axiom: The official Next.js library for Axiom](.github/images/banner-dark.svg#gh-dark-mode-only)
![next-axiom: The official Next.js library for Axiom](.github/images/banner-light.svg#gh-light-mode-only)

<div align="center">

[![build](https://img.shields.io/github/workflow/status/axiomhq/next-axiom/CI?ghcache=unused)](https://github.com/axiomhq/next-axiom/actions?query=workflow%3ACI)
[![Latest release](https://img.shields.io/github/release/axiomhq/next-axiom.svg)](https://github.com/axiomhq/next-axiom/releases/latest) 
[![License](https://img.shields.io/github/license/axiomhq/next-axiom.svg?color=blue)](https://opensource.org/licenses/MIT) 

</div>

[Axiom](https://axiom.co) unlocks observability at any scale.

- **Ingest with ease, store without limits:** Axiom’s next-generation datastore enables ingesting petabytes of data with ultimate efficiency. Ship logs from Kubernetes, AWS, Azure, Google Cloud, DigitalOcean, Nomad, and others.
- **Query everything, all the time:** Whether DevOps, SecOps, or EverythingOps, query all your data no matter its age. No provisioning, no moving data from cold/archive to “hot”, and no worrying about slow queries. All your data, all. the. time.
- **Powerful dashboards, for continuous observability:** Build dashboards to collect related queries and present information that’s quick and easy to digest for you and your team. Dashboards can be kept private or shared with others, and are the perfect way to bring together data from different sources

For more information check out the [official documentation](https://axiom.co/docs).

## Quickstart

- If you are using Vercel, make sure you have the [Axiom Vercel integration](https://www.axiom.co/vercel) 
installed. On other platforms you must create an API token and set those environment variables:

```
AXIOM_DATASET: the dataset the logs will be ingested into
AXIOM_TOKEN: the API token you created for ingestion to the dataset
```

- Then in your Next.js project, run install `next-axiom` like this:

```sh
npm install --save next-axiom
```

- Wrap your Next.js config in `withAxiom` like this in `next.config.js`:

```js
const { withAxiom } = require('next-axiom')

module.exports = withAxiom({
  // ... your existing config
})
```

- Go to `pages/_app.js` or `pages/_app.ts` and add the following line to report web vitals:

```js
export { reportWebVitals } from 'next-axiom'
```

> **Note**: WebVitals are only sent from production deployments.

Wrapping your handlers in `withAxiom` will make `req.log` available and log
exceptions:

```ts
async function handler(req: AxiomAPIRequest, res: NextApiResponse) {
  req.log.info("Login function called")

  // You can create intermediate loggers
  const log = req.log.with({ scope: 'user' })
  log.info("User logged in", { userId: 42 })

  res.status(200).text('hi')
}

export default withAxiom(handler)
```

Import and use `log` in the frontend like this:

```js
import { log } from `next-axiom`;

// pages/index.js
function home() {
    ...
    log.debug('User logged in', { userId: 42 })
    ...
}
```

## License

Distributed under the [MIT License](LICENSE).