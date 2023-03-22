import { NextWebVitalsMetric } from 'next/app';
import { createLogger } from '@axiomhq/kit';

const log = createLogger({}, true);
// log.formatEvents((e) => {
// TODO: create a format for web-vitals, actually this is very specific for vercel
// })

export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (!log.config.adapter.isEnvVarsSet()) {
    return;
  }

  // TODO: find a way to provide the format
  // log.logWebVital({ route: window.__NEXT_DATA__?.page, ...metric });
  log.info('web-vitals', { route: window.__NEXT_DATA__?.page, ...metric });
  log.flush();
}
