import Client from '@axiomhq/axiom-node';
import { describe, it } from '@jest/globals'


describe('Browser e2e tests', () => {
    const axiom = new Client({
        token: process.env.NEXT_PUBLIC_AXIOM_TOKEN,
        url: process.env.NEXT_PUBLIC_AXIOM_URL
    });

    const isVercel = process.env.AXIOM_INGEST_ENDPOINT || process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT;
    const isNetlify = process.env.NETLIFY == 'true';
    const platform = isVercel ? 'vercel' : isNetlify ? 'netlify' : 'platform'

    it('ingest from next pages', async () => {
        const startTime = new Date(Date.now()).toISOString();
        // call route that ingests logs
        const resp = await fetch(process.env.BASE_URL!)
        expect(resp.status).toEqual(200)

        // check dataset for ingested logs
        const qResp = await axiom.query(`['generic'] | where ['message'] == "NEXT_AXIOM::FRONTEND_LOG: This is a log message"`, {
            startTime,
        })
        expect(qResp.matches).toBeDefined()
        expect(qResp.matches).toHaveLength(1)
        expect(qResp.matches![0].data.level).toEqual('debug')
        expect(qResp.matches![0].data[platform]['source']).toEqual('frontend-log')

    })
})
