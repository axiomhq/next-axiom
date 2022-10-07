import { NextWebVitalsMetric } from 'next/app';
import { throttle } from './shared';
import config from './config';

const url = config.getWebVitalsEndpoint();

export declare type WebVitalsMetric = NextWebVitalsMetric & { route: string };

const throttledSendMetrics = throttle(sendMetrics, 1000);
let collectedMetrics: WebVitalsMetric[] = [];

export function reportWebVitals(metric: NextWebVitalsMetric) {
  collectedMetrics.push({ route: window.__NEXT_DATA__?.page, ...metric });
  // if Axiom env vars are not set, do nothing,
  // otherwise devs will get errors on dev environments
  if (!config.isEnvVarsSet) {
    return;
  }
  throttledSendMetrics();
}

function sendMetrics() {
  const body = JSON.stringify(config.wrapWebVitalsObject(collectedMetrics));
  const headers = {
    Authorization: `Bearer ${config.token}`,
    type: 'application/json',
  };

  function sendFallback() {
    // Do not leak network errors; does not affect the running app
    fetch(url, {
      body,
      method: 'POST',
      keepalive: true,
      headers,
    }).catch(console.error);
  }

  if (config.isBrowser && navigator.sendBeacon) {
    try {
      // See https://github.com/vercel/next.js/pull/26601
      // Navigator has to be bound to ensure it does not error in some browsers
      // https://xgwang.me/posts/you-may-not-know-beacon/#it-may-throw-error%2C-be-sure-to-catch
      const blob = new Blob([body], headers);
      navigator.sendBeacon.bind(navigator)(url, blob);
    } catch (err) {
      sendFallback();
    }
  } else {
    sendFallback();
  }

  collectedMetrics = [];
}
