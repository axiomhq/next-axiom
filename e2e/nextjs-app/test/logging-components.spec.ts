import { Client } from '@axiomhq/js';
import { afterAll } from '@jest/globals';
import { beforeAll } from '@jest/globals';
import { expect } from '@jest/globals';
import { describe, it } from '@jest/globals';

describe('Components logging', () => {
  const axiom = new Client();

  const dataset = 'axiom-js-e2e-test';

  beforeAll(async () => {
    const ds = await axiom.datasets.create({
      name: dataset,
      description: 'This is a test dataset for browser logging integration tests.',
    });
    console.log(`creating datasets for testing: ${ds.name} (${ds.id})`);
  });

  afterAll(async () => {
    const resp = await axiom.datasets.delete(dataset);
    expect(resp.status).toEqual(204);
    console.log(`removed testing dataset: ${dataset}`);
  });

  it('Send logs from Next pages (server components)', async () => {
    const startTime = new Date(Date.now()).toISOString();
    // call route that ingests logs
    const resp = await fetch(process.env.TESTING_TARGET_URL!);
    expect(resp.status).toEqual(200);

    // check dataset for ingested logs
    const qResp = await axiom.query(`['${dataset}'] | where ['message'] == "AXIOM/NEXT::SERVER_COMPONENT_LOG"`, {
      startTime,
    });
    expect(qResp.matches).toBeDefined();
    expect(qResp.matches).toHaveLength(1);
    expect(qResp.matches![0].data.level).toEqual('info');
    expect(qResp.matches![0].data.platform.source).toEqual('frontend-log');

    // FIXME: check that web-vitals has been sent as well
  });

  it('Send logs from client components', async () => {
    const startTime = new Date(Date.now()).toISOString();
    // call route that ingests logs
    const resp = await fetch(process.env.TESTING_TARGET_URL!);
    expect(resp.status).toEqual(200);

    // check dataset for ingested logs
    const qResp = await axiom.query(`['${dataset}'] | where ['message'] == "AXIOM/NEXT::FRONTEND_LOG"`, {
      startTime,
    });
    expect(qResp.matches).toBeDefined();
    expect(qResp.matches).toHaveLength(1);
    expect(qResp.matches![0].data.level).toEqual('debug');
    expect(qResp.matches![0].data.platform.source).toEqual('RSC-log');
  });
});
