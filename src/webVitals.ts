import { NextWebVitalsMetric } from 'next/app';
import { isBrowser, proxyPath, isEnvVarsSet } from './shared';
import { throttle } from './shared';

export { log } from './logger';

const url = `${proxyPath}/web-vitals`;

export declare type WebVitalsMetric = NextWebVitalsMetric & { route: string };

const throttledSendMetrics = throttle(sendMetrics, 1000);
let collectedMetrics: WebVitalsMetric[] = [];

export function reportWebVitals(metric: NextWebVitalsMetric) {
  collectedMetrics.push({ route: window.__NEXT_DATA__?.page, ...metric });
  // if Axiom env vars are not set, do nothing,
  // otherwise devs will get errors on dev environments
  if (!isEnvVarsSet) {
    return;
  }
  throttledSendMetrics();
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
