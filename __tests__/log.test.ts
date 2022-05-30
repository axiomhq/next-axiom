/**
 * @jest-environment jsdom
 */
jest.mock('cross-fetch');
import { log } from '../src/logger';
import fetch from 'cross-fetch';

jest.useFakeTimers();

test('logging', async () => {
  const url = '/axiom/logs';
  const time = new Date(Date.now()).toISOString();
  log.info('hello, world!', { _time: time });
  log.debug('testing if this will work', { foo: 'bar', answer: 42, _time: time });
  expect(fetch).toBeCalledTimes(0);

  jest.advanceTimersByTime(1000);
  expect(fetch).toBeCalledTimes(1);

  expect(fetch).toHaveBeenCalledWith(url, {
    body: JSON.stringify([
      { level: 'info', message: 'hello, world!', _time: time },
      { level: 'debug', message: 'testing if this will work', foo: 'bar', answer: 42, _time: time },
    ]),
    method: 'POST',
    keepalive: true,
  });
});
