process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT = '';
process.env.NEXT_PUBLIC_AXIOM_URL = 'https://api.axiom.co';
process.env.NEXT_PUBLIC_AXIOM_DATASET = 'test';

import { config } from '../src/config';
import { EndpointType } from '../src/shared';
import { test, expect } from '@jest/globals';

test('reading axiom ingest endpoint', () => {
  let url = config.getIngestURL(EndpointType.webVitals);
  expect(url).toEqual('https://api.axiom.co/api/v1/datasets/test/ingest');

  url = config.getIngestURL(EndpointType.logs);
  expect(url).toEqual('https://api.axiom.co/api/v1/datasets/test/ingest');
});
