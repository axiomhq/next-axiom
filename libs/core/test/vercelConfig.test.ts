process.env.AXIOM_URL = undefined;
process.env.AXIOM_INGEST_ENDPOINT = 'https://axiom.co/api/v1/integrations/vercel';

import { config } from '../src/config';
import { EndpointType } from '../src/shared';

test('reading vercel ingest endpoint', () => {
  let url = config.getIngestURL(EndpointType.webVitals);
  expect(url).toEqual('https://axiom.co/api/v1/integrations/vercel?type=web-vitals');

  url = config.getIngestURL(EndpointType.logs);
  expect(url).toEqual('https://axiom.co/api/v1/integrations/vercel?type=logs');
});
