import { AxiomRequest, withAxiom } from 'next-axiom';

// This function can be marked `async` if using `await` inside
export const middleware = withAxiom((req: AxiomRequest) => {
  req.log.debug('log fired from middleware');
});

export const config = {
  matcher: '/:path*',
};
