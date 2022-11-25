/**
 * @jest-environment jsdom
 */
// set axiom env vars before importing logger
process.env.AXIOM_INGEST_ENDPOINT = 'https://example.co/api/test';
import { log } from '../src/logger';

jest.useFakeTimers();

test('sending logs from browser', async () => {
  global.fetch = jest.fn() as jest.Mock;

  log.info('hello, world!');
  expect(fetch).toHaveBeenCalledTimes(0);

  jest.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(1);

  log.info('hello, world!');
  expect(fetch).toHaveBeenCalledTimes(1);

  await log.flush();
  expect(fetch).toHaveBeenCalledTimes(2);
});

test('with', async () => {
  global.fetch = jest.fn() as jest.Mock;

  const logger = log.with({ foo: 'bar' });
  logger.info('hello, world!', { bar: 'baz' });
  expect(fetch).toHaveBeenCalledTimes(0);

  jest.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(1);
  const payload = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
  expect(payload.length).toBe(1);
  const fst = payload[0];
  expect(fst.level).toBe('info');
  expect(fst.message).toBe('hello, world!');
  expect(fst.fields.foo).toBe('bar');
  expect(fst.fields.bar).toBe('baz');
});

test('passing non-object', async () => {
  global.fetch = jest.fn() as jest.Mock;

  const logger = log.with({ foo: 'bar' });
  const args = 'baz';
  logger.info('hello, world!', args as unknown as object);
  expect(fetch).toHaveBeenCalledTimes(0);

  jest.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(1);
  const payload = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
  expect(payload.length).toBe(1);
  const fst = payload[0];
  expect(fst.level).toBe('info');
  expect(fst.message).toBe('hello, world!');
  expect(fst.fields.foo).toBe('bar');
  console.log(fst.fields);
  expect(fst.fields.args).toBe('baz');
});
