import { NextResponse } from 'next/server';
import { withAxiom } from 'next-axiom';

export const runtime = 'edge';
export const dynamic = 'force-dynamic'; // disable prerendering

export const GET = withAxiom(async (req) => {
  req.log.warn('AXIOM/NEXT::EDGE_LOG', { name: 'ingest_on_edge' });


  return NextResponse.json({ test: 'ingest_on_edge' });
});
