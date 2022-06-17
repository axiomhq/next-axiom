/**
 * @jest-environment jsdom
 */
// set axiom env vars before importing logger
process.env.AXIOM_INGEST_ENDPOINT = 'https://example.co/api/test';
import { log } from '../src/logger';

global.fetch = jest.fn() as jest.Mock;
jest.useFakeTimers();

test('sending logs from browser', async () => {
  log.info('hello, world!');
  expect(fetch).toHaveBeenCalledTimes(0);

  jest.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(1);

  log.info('hello, world!');
  expect(fetch).toHaveBeenCalledTimes(1);

  await log.flush();
  expect(fetch).toHaveBeenCalledTimes(2);
});
