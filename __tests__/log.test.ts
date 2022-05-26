/**
 * @jest-environment jsdom
 */
jest.mock('cross-fetch');
import { log } from '../logger';
import fetch from 'cross-fetch';

jest.useFakeTimers();
const ingestEndpoint = process.env.AXIOM_INGEST_ENDPOINT || process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT;

test('logging', async () => {
  log.info('hello, world!');
  log.debug('testing if this will work', { foo: 'bar', answer: 42 });
  expect(fetch).toBeCalledTimes(0);

  jest.advanceTimersByTime(1000);
  expect(fetch).toBeCalledTimes(1);

  const url = `${ingestEndpoint}/?type=log`;
  expect(fetch).toHaveBeenCalledWith(url, {
    body: JSON.stringify([
      { level: 'info', message: 'hello, world!' },
      { level: 'debug', message: 'testing if this will work', foo: 'bar', answer: 42 },
    ]),
    method: 'POST',
    keepalive: true,
  });
});
