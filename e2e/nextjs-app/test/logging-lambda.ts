import { Client } from '@axiomhq/js';
import { afterAll } from '@jest/globals';
import { beforeAll } from '@jest/globals';
import { expect } from '@jest/globals';
import { describe, it } from '@jest/globals';

describe('Lambda e2e tests', () => {
  const axiom = new Client();

  const dataset = 'axiom-js-e2e-test';

  beforeAll(async () => {
    const ds = await axiom.datasets.create({
      name: dataset,
      description: 'This is a test dataset for lambda logging tests.',
    });
    console.log(`creating datasets for testing: ${ds.name} (${ds.id})`);
  });

  afterAll(async () => {
    const resp = await axiom.datasets.delete(dataset);
    expect(resp.status).toEqual(204);
    console.log(`removed testing dataset: ${dataset}`);
  });

  it('Send logs from lambda', async () => {
    const startTime = new Date(Date.now()).toISOString();
    // call route that ingests logs
    const resp = await fetch(process.env.TESTING_TARGET_URL + '/api/log_lambda');
    expect(resp.status).toEqual(200);

    // check dataset for ingested logs
    const qResp = await axiom.query(`['${dataset}'] | where ['message'] == "AXIOM/NEXT::LAMBDA_LOG"`, {
      startTime,
    });
    expect(qResp.matches).toBeDefined();
    expect(qResp.matches).toHaveLength(1);
    expect(qResp.matches![0].data.level).toEqual('error');
    expect(qResp.matches![0].data.message).toEqual('AXIOM/NEXT::LAMBDA_LOG');
    expect(qResp.matches![0].data.fields['name']).toEqual('ingest_on_lambda');
    expect(qResp.matches![0].data.platform.source).toEqual('lambda-log');
  });

  it('Send huge logs from lambda', async () => {
    const startTime = new Date(Date.now()).toISOString();
    // call route that ingests logs
    const resp = await fetch(process.env.TESTING_TARGET_URL + '/api/huge_log');
    expect(resp.status).toEqual(200);

    // check dataset for ingested logs
    const qResp = await axiom.query(`['${dataset}'] | where ['message'] == "AXIOM/NEXT::HUGE_LOG"`, {
      startTime,
    });
    expect(qResp.matches).toBeDefined();
    expect(qResp.matches).toHaveLength(20);
    expect(qResp.matches![20].data.level).toEqual('error');
    expect(qResp.matches![20].data.message).toEqual('AXIOM/NEXT::LAMBDA_LOG');
    expect(qResp.matches![20].data.fields['name']).toEqual('ingest_huge_log_on_lambda');
    expect(qResp.matches![20].data.fields['count']).toEqual(20);
    expect(qResp.matches![20].data.platform.source).toEqual('lambda-log');
  });
});
