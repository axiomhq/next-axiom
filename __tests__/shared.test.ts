import { config, EndpointType } from '../src/shared';

test('reading vercel ingest endpoint', () => {
  process.env.AXIOM_URL = '';
  process.env.AXIOM_INGEST_ENDPOINT = 'https://axiom.co/api/v1/integrations/vercel';
  let url = config.getIngestURL(EndpointType.webVitals);
  expect(url).toEqual('https://axiom.co/api/v1/integrations/vercel?type=web-vitals');

  url = config.getIngestURL(EndpointType.logs);
  expect(url).toEqual('https://axiom.co/api/v1/integrations/vercel?type=logs');
});

test('reading axiom ingest endpoint', () => {
  process.env.AXIOM_INGEST_ENDPOINT = '';
  process.env.AXIOM_URL = 'https://test.axiom.co';
  process.env.AXIOM_DATASET = 'test';
  let url = config.getIngestURL(EndpointType.webVitals);
  expect(url).toEqual('https://test.axiom.co/api/v1/datasets/test/ingest');

  url = config.getIngestURL(EndpointType.logs);
  expect(url).toEqual('https://test.axiom.co/api/v1/datasets/test/ingest');
});
