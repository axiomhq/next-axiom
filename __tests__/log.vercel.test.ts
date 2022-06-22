/**
 * @jest-environment node
 */
process.env.AXIOM_INGEST_ENDPOINT = 'https://example.co/api/test';
// mock vercel environment
process.env.VERCEL = '1';
import { log } from '../src/logger';

global.fetch = jest.fn() as jest.Mock;
// mock console.log
const mockedLog = jest.spyOn(global.console, 'log').mockImplementation();
jest.useFakeTimers();

test('sending logs in vercel env', () => {
  // mock Date.now to control value of _time
  Date.now = jest.fn(() => new Date(Date.UTC(2022, 0, 1)).valueOf());
  const _time = new Date(Date.now()).toISOString();

  log.info('hello, world!');
  // ensure timers has not been called for this log
  expect(fetch).toHaveBeenCalledTimes(0);
  jest.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(0);

  expect(mockedLog).toHaveBeenCalledTimes(1);
  let payload = 'AXIOM::LOG=' + JSON.stringify({ level: 'info', message: 'hello, world!', _time });
  expect(mockedLog).toBeCalledWith(payload);

  log.warn('another log goes here.', { cause: 'reason' });
  expect(mockedLog).toHaveBeenCalledTimes(2);
  payload =
    'AXIOM::LOG=' +
    JSON.stringify({ level: 'warn', message: 'another log goes here.', _time, fields: { cause: 'reason' } });
  expect(mockedLog).toBeCalledWith(payload);
});
