/**
 * @jest-environment jsdom
 */

// clear Axiom env vars
process.env.AXIOM_URL = '';
process.env.AXIOM_DATASET = '';
process.env.AXIOM_TOKEN = '';
process.env.AXIOM_INGEST_ENDPOINT = '';
process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT = '';
import { NextWebVitalsMetric } from 'next/app';
import { log } from '../src/logger';
import { reportWebVitals } from '../src/webVitals';

jest.useFakeTimers();
global.fetch = jest.fn() as jest.Mock;
const mockedLog = jest.spyOn(global.console, 'log').mockImplementation();

test('sending logs on localhost should fallback to console', () => {
  log.info('hello, world!');
  jest.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(0);
  expect(mockedLog).toHaveBeenCalledTimes(1);
});

test('webVitals should not be sent when envVars are not set', () => {
  const metric: NextWebVitalsMetric = { id: '1', startTime: 1234, value: 1, name: 'FCP', label: 'web-vital' };
  reportWebVitals(metric);
  jest.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(0);
});
