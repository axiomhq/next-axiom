import Client from '@axiomhq/axiom-node';
import { describe, it } from '@jest/globals'

describe('Edge e2e tests', () => {
    const axiom = new Client({
        token: process.env.NEXT_PUBLIC_AXIOM_TOKEN,
        url: process.env.NEXT_PUBLIC_AXIOM_URL
    });

    it('ingest from edge function', async () => {
        const startTime = new Date(Date.now()).toISOString();
        // call route that ingests logs
        const resp = await fetch(process.env.BASE_URL + '/api/edge_log')
        expect(resp.status).toEqual(200)

        // check dataset for ingested logs
        const qResp = await axiom.query(`['generic'] | where ['message'] == "NEXT_AXIOM::EDGE_LOG"`, {
            startTime,
        })
        expect(qResp.matches).toBeDefined()
        expect(qResp.matches).toHaveLength(1)
        expect(qResp.matches![0].data.level).toEqual('warn')
        expect(qResp.matches![0].data.fields['filename']).toEqual('edge_log.ts')
    })
})
