import { NextWebVitalsMetric } from "next/app";

export default function sendMetrics(collectedMetrics: NextWebVitalsMetric[]) {
    const url = '/axiom/web-vitals';
    const body = JSON.stringify({
        webVitals: collectedMetrics,
    });

    if (navigator.sendBeacon) {
        navigator.sendBeacon(url, body);
    } else {
        fetch(url, { body, method: 'POST', keepalive: true });
    }
    // clear collectedMetrics
    collectedMetrics = [];
}
