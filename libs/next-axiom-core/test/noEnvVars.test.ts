// clear Axiom env vars
process.env.NEXT_PUBLIC_AXIOM_URL = '';
process.env.NEXT_PUBLIC_AXIOM_DATASET = '';
process.env.NEXT_PUBLIC_AXIOM_TOKEN = '';
process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT = '';
import { log } from '../src/logger';
import { test, expect, jest } from '@jest/globals';

jest.useFakeTimers();

test('sending logs on localhost should fallback to console', () => {
  global.fetch = jest.fn(async () => {
    const resp = new Response("", { status: 200 });
    return Promise.resolve(resp);
  }) as jest.Mock<typeof fetch>;
  const mockedLog = jest.spyOn(global.console, 'log').mockImplementation(jest.fn());
  log.info('hello, world!');
  jest.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(0);
  expect(mockedLog).toHaveBeenCalledTimes(1);
});
