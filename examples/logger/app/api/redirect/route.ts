import { AxiomRequest, withAxiom } from 'next-axiom';
import { redirect } from 'next/navigation';

export const runtime = 'nodejs';


// test handling NEXT_REDIRECT error
export const GET = withAxiom(async (req: AxiomRequest) => {
    return redirect('/')
});
