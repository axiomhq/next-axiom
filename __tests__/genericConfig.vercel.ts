process.env.AXIOM_INGEST_ENDPOINT = '';
process.env.AXIOM_URL = 'https://test.axiom.co';
process.env.AXIOM_DATASET = 'test';

import { config, EndpointType } from '../src/shared';

test('reading axiom ingest endpoint', () => {
  let url = config.getIngestURL(EndpointType.webVitals);
  expect(url).toEqual('https://test.axiom.co/api/v1/datasets/test/ingest');

  url = config.getIngestURL(EndpointType.logs);
  expect(url).toEqual('https://test.axiom.co/api/v1/datasets/test/ingest');
});