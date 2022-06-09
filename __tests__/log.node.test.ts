/**
 * @jest-environment node
 */
import { log } from '../src/logger';

global.fetch = jest.fn() as jest.Mock;
jest.useFakeTimers();

test('sending logs from node', async () => {
  log.info('hello, world!');
  expect(fetch).toHaveBeenCalledTimes(0);
  jest.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('flushing logs', async () => {
  log.info('hello, world!');
  expect(fetch).toHaveBeenCalledTimes(0);
  await log.flush();
  expect(fetch).toHaveBeenCalledTimes(1);
});
