![next-axiom: The official Next.js library for Axiom](../../github/images/banner-dark.svg#gh-dark-mode-only)
![next-axiom: The official Next.js library for Axiom](../../github/images/banner-light.svg#gh-light-mode-only)

<div align="center">

[![build](https://img.shields.io/github/actions/workflow/status/axiomhq/next-axiom/ci.yml?branch=main&ghcache=unused)](https://github.com/axiomhq/next-axiom/actions?query=workflow%3ACI)
[![Latest release](https://img.shields.io/github/release/axiomhq/next-axiom.svg)](https://github.com/axiomhq/next-axiom/releases/latest)
[![License](https://img.shields.io/github/license/axiomhq/next-axiom.svg?color=blue)](https://opensource.org/licenses/MIT)

</div>

[Axiom](https://axiom.co) unlocks observability at any scale.

- **Ingest with ease, store without limits:** Axiom’s next-generation datastore enables ingesting petabytes of data with ultimate efficiency. Ship logs from Kubernetes, AWS, Azure, Google Cloud, DigitalOcean, Nomad, and others.
- **Query everything, all the time:** Whether DevOps, SecOps, or EverythingOps, query all your data no matter its age. No provisioning, no moving data from cold/archive to “hot”, and no worrying about slow queries. All your data, all. the. time.
- **Powerful dashboards, for continuous observability:** Build dashboards to collect related queries and present information that’s quick and easy to digest for you and your team. Dashboards can be kept private or shared with others, and are the perfect way to bring together data from different sources.

For more information, check out the [official documentation](https://axiom.co/docs).

## Installation

### Using Vercel Integration

Make sure you have the [Axiom Vercel integration](https://www.axiom.co/vercel) installed. Once it is done, perform the steps below: 

- In your Next.js project, run install `next12-axiom` as follows:

```sh
npm install --save next12-axiom
```

- In the `next.config.js` file, wrap your Next.js config in `withAxiom` as follows:

```js
const { withAxiom } = require('next12-axiom');

module.exports = withAxiom({
  // ... your existing config
});
```

### Using Any Other Platform

Create an API token in [Axiom settings](https://cloud.axiom.co/settings/profile) and export it as `AXIOM_TOKEN`, as well as the Axiom dataset name as `AXIOM_DATASET`. Once it is done, perform the steps below:

- In your Next.js project, run install `next12-axiom` as follows:

```sh
npm install --save next12-axiom
```

- In the `next.config.js` file, wrap your Next.js config in `withAxiom` as follows:

```js
const { withAxiom } = require('next12-axiom');

module.exports = withAxiom({
  // ... your existing config
});
```

## Usage

### Web Vitals

> **Warning**: Web-Vitals are not yet supported in Next.js 13 and above. Please use Next.js 12 or below. We [submitted a patch](https://github.com/vercel/next.js/pull/47319) and as soon as Next.js 13.2.5 is out, we'll add support here.

Go to `pages/_app.js` or `pages/_app.ts` and add the following line to report web vitals:

```js
export { reportWebVitals } from 'next12-axiom';
```

> **Note**: WebVitals are only sent from production deployments.

Wrapping your handlers in `withAxiom` will make `req.log` available and log
exceptions:

```ts
import { withAxiom, AxiomAPIRequest } from 'next12-axiom';

async function handler(req: AxiomAPIRequest, res: NextApiResponse) {
  req.log.info('Login function called');

  // You can create intermediate loggers
  const log = req.log.with({ scope: 'user' });
  log.info('User logged in', { userId: 42 });

  res.status(200).text('hi');
}

export default withAxiom(handler);
```

Import and use `log` in the frontend like this:

```js
import { log } from `next12-axiom`;

// pages/index.js
function home() {
    ...
    log.debug('User logged in', { userId: 42 })
    ...
}
```

### Log Levels

The log level defines the lowest level of logs sent to Axiom.
The default is debug, resulting in all logs being sent.
Available levels are (from lowest to highest): `debug`, `info`, `warn`, `error`

For example, if you don't want debug logs to be sent to Axiom:

```sh
export AXIOM_LOG_LEVEL=info
```

You can also disable logging completely by setting the log level to `off`:

```sh
export AXIOM_LOG_LEVEL=off
```

### getServerSideProps

To be able to use next-axiom with `getServerSideProps` you need to wrap your function with `withAxiomGetServerSideProps`, becasue there is no
way at the moment to automatically detected if getServerSideProps is used.

```ts
import { withAxiomGetServerSideProps } from 'next12-axiom'
export const getServerSideProps = withAxiomGetServerSideProps(async ({ req, log })  => {
  log.info('Hello, world!');
  return {
    props: {
    },
  }
});
```

## FAQ
### How can I send logs from Vercel preview deployments?
The Axiom Vercel integration sets up an environment variable called `NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT`, which by default is only enabled for the production environment. To send logs from preview deployments, go to your site settings in Vercel and enable preview deployments for that environment variable.

### How can I extend the logger?
You can use `log.with` to create an intermediate logger, for example:
```ts
const logger = log.with({ userId: 42 })
logger.info("Hi") // will ingest { ..., "message": "Hi", "fields" { "userId": 42 }}
```

## License

Distributed under the [MIT License](LICENSE).
