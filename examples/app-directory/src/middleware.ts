import { AxiomRouteHandlerContext, withAxiom } from 'next-axiom';

// This function can be marked `async` if using `await` inside
export const middleware = withAxiom((req: AxiomRouteHandlerContext) => {
  req.log.info('this is a middleware');
});

export const config = {
  matcher: '/:path*',
};
