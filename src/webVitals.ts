import { NextWebVitalsMetric } from 'next/app';
import { isBrowser, proxyPath } from './config';

export { log } from './logger';

const url = `${proxyPath}/web-vitals`;
const _debounce = require('lodash/debounce');

export declare type WebVitalsMetric = NextWebVitalsMetric & { route: string };

const debounceSendMetrics = _debounce(() => sendMetrics(), 1000);
let collectedMetrics: WebVitalsMetric[] = [];

export function reportWebVitals(metric: NextWebVitalsMetric) {
  collectedMetrics.push({ route: window.__NEXT_DATA__?.page, ...metric });
  debounceSendMetrics();
}

function sendMetrics() {
  const body = JSON.stringify({
    webVitals: collectedMetrics,
  });

  if (isBrowser && navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }

  collectedMetrics = [];
}
