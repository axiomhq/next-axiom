import { log } from '../src/logger';
import { test, expect, vi, vitest } from 'vitest';

vi.hoisted(() => {
  // set axiom env vars before importing logger
  vi.stubEnv('NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT', 'https://example.co/api/test');
});

vi.useFakeTimers();

test('sending logs from browser', async () => {
  global.fetch = vi.fn(async () => {
    const resp = new Response('', { status: 200 });
    return Promise.resolve(resp);
  });

  log.info('hello, world!');
  expect(fetch).toHaveBeenCalledTimes(0);

  vi.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(1);

  log.info('hello, world!');
  expect(fetch).toHaveBeenCalledTimes(1);

  await log.flush();
  expect(fetch).toHaveBeenCalledTimes(2);
});

test('with', async () => {
  global.fetch = vi.fn(async () => {
    const resp = new Response('', { status: 200 });
    return Promise.resolve(resp);
  });

  const logger = log.with({ foo: 'bar' });
  logger.info('hello, world!', { bar: 'baz' });
  expect(fetch).toHaveBeenCalledTimes(0);

  vi.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(1);
  const mockedFetch = fetch as vitest.Mock<typeof fetch>;
  const sentPayload = mockedFetch.mock.calls[0][1]?.body?.toString();
  const payload = JSON.parse(sentPayload ? sentPayload : '{}');
  expect(payload.length).toBe(1);
  const fst = payload[0];
  expect(fst.level).toBe('info');
  expect(fst.message).toBe('hello, world!');
  expect(Object.keys(fst.fields).length).toBe(2);
  expect(fst.fields.foo).toBe('bar');
  expect(fst.fields.bar).toBe('baz');
});

test('passing non-object', async () => {
  global.fetch = vi.fn(async () => {
    const resp = new Response('', { status: 200 });
    return Promise.resolve(resp);
  }) as vitest.Mock<typeof fetch>;

  const logger = log.with({ foo: 'bar' });
  const args = 'baz';
  logger.info('hello, world!', args as unknown as object);
  expect(fetch).toHaveBeenCalledTimes(0);

  vi.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(1);
  const mockedFetch = fetch as vitest.Mock<typeof fetch>;
  const sentPayload = mockedFetch.mock.calls[0][1]?.body?.toString();
  const payload = JSON.parse(sentPayload ? sentPayload : '{}');
  expect(payload.length).toBe(1);
  const fst = payload[0];
  expect(fst.level).toBe('info');
  expect(fst.message).toBe('hello, world!');
  expect(fst.fields.foo).toBe('bar');
  expect(fst.fields.args).toBe('baz');
});

test('flushing child loggers', async () => {
  global.fetch = vitest.fn(async () => {
    const resp = new Response('', { status: 200 });
    return Promise.resolve(resp);
  });

  log.info('hello, world!');
  const logger1 = log.with({ foo: 'bar' });
  logger1.debug('logger1');
  const logger2 = logger1.with({ bar: 'foo' });
  logger2.debug('logger2');
  expect(fetch).toHaveBeenCalledTimes(0);
  await log.flush();

  expect(fetch).toHaveBeenCalledTimes(3);

  const mockedFetch = fetch as vitest.Mock<typeof fetch>;
  const sentPayload = mockedFetch.mock.calls[2][1]?.body?.toString();
  const payload = JSON.parse(sentPayload ? sentPayload : '{}');
  expect(Object.keys(payload[0].fields).length).toEqual(2);
  expect(payload[0].fields.foo).toEqual('bar');
  expect(payload[0].fields.bar).toEqual('foo');
  // ensure there is nothing was left unflushed
  await log.flush();
  expect(fetch).toHaveBeenCalledTimes(3);
});

test('throwing exception', async () => {
  global.fetch = vitest.fn(async () => {
    const resp = new Response('', { status: 200 });
    return Promise.resolve(resp);
  }) as vitest.Mock<typeof fetch>;
  const err = new Error('test');
  log.error('hello, world!', err);
  await log.flush();
  expect(fetch).toHaveBeenCalledTimes(1);
  const mockedFetch = fetch as vitest.Mock<typeof fetch>;
  const sentPayload = mockedFetch.mock.calls[0][1]?.body?.toString();
  const payload = JSON.parse(sentPayload ? sentPayload : '{}');
  expect(Object.keys(payload[0].fields).length).toEqual(3); // { name, message, stack }
  expect(payload[0].fields.message).toEqual(err.message);
  expect(payload[0].fields.name).toEqual(err.name);
});
