import { Logger } from 'next-axiom-core';

export * from 'next-axiom-core';
export * from './withAxiom';
export { reportWebVitals, reportWebVitalsWithPath } from './webVitals';
export const log = new Logger();
