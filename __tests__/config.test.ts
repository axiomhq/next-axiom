import { getIngestURL, EndpointType } from '../src/shared';

test('reading ingest endpoint', () => {
  process.env.AXIOM_INGEST_ENDPOINT = 'https://axiom.co/api/test';
  let url = getIngestURL(EndpointType.webVitals);
  expect(url).toEqual('https://axiom.co/api/test?type=web-vitals');

  url = getIngestURL(EndpointType.logs);
  expect(url).toEqual('https://axiom.co/api/test?type=logs');
});
