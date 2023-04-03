import Client from '@axiomhq/axiom-node';
import { describe, it } from '@jest/globals'
import { url } from 'inspector';

describe('Lambda e2e tests', () => {
    const axiom = new Client({
        token: process.env.NEXT_PUBLIC_AXIOM_TOKEN,
        url: process.env.NEXT_PUBLIC_AXIOM_URL
    });

    it('ingest from lambda', async () => {
        const startTime = new Date(Date.now()).toISOString();
        // call route that ingests logs
        const resp = await fetch(process.env.BASE_URL + '/api/api_log')
        expect(resp.status).toEqual(200)

        // check dataset for ingested logs
        const qResp = await axiom.query(`['generic'] | where ['message'] == "NEXT_AXIOM::API_LOG"`, {
            startTime,
        })
        expect(qResp.matches).toBeDefined()
        expect(qResp.matches).toHaveLength(1)
        expect(qResp.matches![0].data.level).toEqual('error')
        expect(qResp.matches![0].data.message).toEqual('NEXT_AXIOM::API_LOG')
        expect(qResp.matches![0].data.fields['filename']).toEqual('api_log.ts')
    })
})
