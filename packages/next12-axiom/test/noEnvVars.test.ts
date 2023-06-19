import { NextWebVitalsMetric } from 'next/app';
import { reportWebVitals } from '../src/webVitals';
import { test, expect, jest } from '@jest/globals';

test('webVitals should not be sent when envVars are not set', () => {
  const metric: NextWebVitalsMetric = { id: '1', startTime: 1234, value: 1, name: 'FCP', label: 'web-vital' };
  reportWebVitals(metric);
  jest.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(0);
});
