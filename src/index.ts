import NextLogger from './logger';
export { NextLogger };
export { reportWebVitals } from './webVitals';
export {
  withAxiom,
  withAxiomGetServerSideProps,
  AxiomAPIRequest,
  AxiomRequest,
  AxiomGetServerSideProps,
  AxiomApiHandler,
  AxiomMiddleware,
  AxiomGetServerSidePropsContext,
} from './withAxiom';

export const log = new NextLogger();
