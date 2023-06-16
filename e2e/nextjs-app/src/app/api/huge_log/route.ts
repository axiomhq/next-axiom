import { NextResponse } from 'next/server';
import { withAxiom } from 'next-axiom';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // disable prerendering

export const GET = withAxiom(async (req) => {
    for(let i = 1; i <= 20; i++) {
      req.log.error('AXIOM/NEXT::HUGE_LOG', { name: 'ingest_huge_log_on_lambda', count: i });
    }

   return NextResponse.json({ test: 'ingest_on_lambda' });
});
