/**
 * @jest-environment jsdom
 */
import { log } from '../src/logger';

global.fetch = jest.fn() as jest.Mock;
jest.useFakeTimers();

test('sending logs from browser', async () => {
  log.info('hello, world!');
  jest.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalled();
});
