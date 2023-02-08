/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
// set axiom env vars before importing webvitals
process.env.AXIOM_URL = '';
process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT = 'https://example.co/api/test';
import { reportWebVital } from '../src/webVitals';
import 'whatwg-fetch';
import { Version } from '../src/config';
import { Metric } from 'web-vitals';

global.fetch = jest.fn(() => Promise.resolve(new Response('', { status: 204, statusText: 'OK' }))) as jest.Mock;
jest.useFakeTimers();

test('throttled sendMetrics', async () => {
  let metricsMatrix: Metric[][] = [
    [
      { id: '1', value: 2, name: 'FCP', rating: 'good', delta: 1, entries: [], navigationType: 'reload' },
      { id: '2', value: 1, name: 'FCP', rating: 'poor', delta: 1, entries: [], navigationType: 'reload' },
    ],
    [{ id: '3', value: 1, name: 'FCP', rating: 'poor', delta: 1, entries: [], navigationType: 'reload' }],
    [{ id: '4', value: 1, name: 'FCP', rating: 'poor', delta: 1, entries: [], navigationType: 'reload' }],
  ];

  // report first set of web-vitals
  metricsMatrix[0].forEach(reportWebVital);
  // skip 100ms and report another webVital
  jest.advanceTimersByTime(100);
  metricsMatrix[1].forEach(reportWebVital);
  // ensure fetch has not been called yet for any the previously reported
  // web-vitals
  expect(fetch).toBeCalledTimes(0);
  // skip ahead of time to send the previous webvitals
  jest.advanceTimersByTime(1000);

  // send the last set of webVitals and wait for them to be sent
  metricsMatrix[2].forEach(reportWebVital);
  jest.advanceTimersByTime(1000);

  const url = '/_axiom/web-vitals';
  const payload = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'next-axiom/v' + Version,
    },
    method: 'POST',
    keepalive: true,
  };

  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch).nthCalledWith(1, url, {
    body: JSON.stringify({
      webVitals: [...metricsMatrix[0], ...metricsMatrix[1]],
      environment: 'test',
    }),
    ...payload,
  });
  expect(fetch).nthCalledWith(2, url, {
    body: JSON.stringify({
      webVitals: metricsMatrix[2],
      environment: 'test',
    }),
    ...payload,
  });
});
