import { AxiomRequest, withAxiom } from 'next-axiom';
import { permanentRedirect } from 'next/navigation';

export const runtime = 'nodejs';

// test handling NEXT_REDIRECT error with status code 308
export const GET = withAxiom(async (req: AxiomRequest) => {
    return permanentRedirect('/')
});
