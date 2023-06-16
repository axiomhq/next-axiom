import { NextResponse } from 'next/server';
import { withAxiom } from 'next-axiom';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // disable prerendering

export const GET = withAxiom(async (req) => {
  req.log.error('AXIOM/NEXT::LAMBDA_LOG', { name: 'ingest_on_lambda' });

  return NextResponse.json({ test: 'ingest_on_lambda' });
});
