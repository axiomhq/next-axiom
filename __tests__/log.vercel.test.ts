/**
 * @jest-environment node
 */
process.env.AXIOM_INGEST_ENDPOINT = 'https://example.co/api/test';
// mock vercel environment
process.env.NEXT_PUBLIC_VERCEL_ENV = 'test';
import { log } from '../src/logger';

global.fetch = jest.fn() as jest.Mock;
// mock console.log
const mockedLog = jest.spyOn(global.console, 'log').mockImplementation();
jest.useFakeTimers();

test('sending logs in vercel env', () => {
  log.info('hello, world!');
  expect(fetch).toHaveBeenCalledTimes(0);
  jest.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(0);

  log.info('another log goes here.');
  expect(mockedLog).toHaveBeenCalledTimes(2);
});
