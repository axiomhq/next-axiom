/**
 * @jest-environment jsdom
 */
jest.mock('cross-fetch');
import { log } from '../src/logger';
import fetch from 'cross-fetch';

jest.useFakeTimers();

test('logging', async () => {
  const url = '/axiom/logs';
  log.info('hello, world!');
  log.debug('testing if this will work', { foo: 'bar', answer: 42 });
  expect(fetch).toBeCalledTimes(0);

  jest.advanceTimersByTime(1000);
  expect(fetch).toBeCalledTimes(1);

  expect(fetch).toHaveBeenCalledWith(url, {
    body: JSON.stringify([
      { level: 'info', message: 'hello, world!' },
      { level: 'debug', message: 'testing if this will work', foo: 'bar', answer: 42 },
    ]),
    method: 'POST',
    keepalive: true,
  });
});
