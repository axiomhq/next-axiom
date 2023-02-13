import { NextWebVitalsMetric } from 'next/app';
import { LoggingSource } from './axiom-kit/logging/config';
import NextLogger from './logger';

const log = new NextLogger(LoggingSource.browser);

export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (!log.isEnvVarsSet()) {
    return;
  }
  log.logWebVital({ route: window.__NEXT_DATA__?.page, ...metric });
  log.flush();
}
