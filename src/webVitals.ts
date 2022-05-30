import { NextWebVitalsMetric } from 'next/app';
export { log } from './logger';
const _debounce = require('lodash/debounce');

export declare type WebVitalsMetric = NextWebVitalsMetric & { route: string };

const debounceSendMetrics = _debounce(() => sendMetrics(), 1000);
let collectedMetrics: WebVitalsMetric[] = [];

export function reportWebVitals(metric: NextWebVitalsMetric) {
  collectedMetrics.push({ route: window.__NEXT_DATA__?.page, ...metric });
  debounceSendMetrics();
}

function sendMetrics() {
  const url = '/axiom/web-vitals';
  const body = JSON.stringify({
    webVitals: collectedMetrics,
  });

  if (typeof window !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
  // clear collectedMetrics
  collectedMetrics = [];
}
