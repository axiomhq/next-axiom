/**
 * @jest-environment jsdom
 */
import { NextWebVitalsMetric } from 'next/app';
import { reportWebVitals } from '../src/webVitals';
import { test, expect, jest } from '@jest/globals';
import 'whatwg-fetch';

jest.useFakeTimers();

global.fetch = jest.fn(() => Promise.resolve(new Response('', { status: 204, statusText: 'OK' }))) as jest.Mock<
  typeof fetch
>;

test('webVitals should not be sent when envVars are not set', () => {
  const metric: NextWebVitalsMetric = { id: '1', startTime: 1234, value: 1, name: 'FCP', label: 'web-vital' };
  reportWebVitals(metric);
  jest.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(0);
});
