import { config } from '../src/config';
import { EndpointType } from '../src/shared';
import { describe, it, expect, vi } from 'vitest';

vi.hoisted(() => {
  // stub axiom env vars before importing logger
  vi.stubEnv('NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT', '');
  vi.stubEnv('NEXT_PUBLIC_AXIOM_URL', 'https://api.axiom.co');
  vi.stubEnv('NEXT_PUBLIC_AXIOM_DATASET', 'test');
});

describe('unknown env config tests', () => {
  it('reads axiom ingest endpoint from envvars', () => {
    let url = config.getIngestURL(EndpointType.webVitals);
    expect(url).toEqual('https://api.axiom.co/api/v1/datasets/test/ingest');

    url = config.getIngestURL(EndpointType.logs);
    expect(url).toEqual('https://api.axiom.co/api/v1/datasets/test/ingest');
  });
});
