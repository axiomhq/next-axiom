process.env.AXIOM_URL = undefined;
process.env.AXIOM_INGEST_ENDPOINT = 'https://api.axiom.co/v1/integrations/vercel';

import config from '../src/config';
import { EndpointType } from '../src/shared';

test('reading vercel ingest endpoint', () => {
  let url = config.getIngestURL(EndpointType.webVitals);
  expect(url).toEqual('https://api.axiom.co/v1/integrations/vercel?type=web-vitals');

  url = config.getIngestURL(EndpointType.logs);
  expect(url).toEqual('https://api.axiom.co/v1/integrations/vercel?type=logs');
});
