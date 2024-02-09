import { test, expect, vi } from 'vitest';
import { log, Logger, LogLevel } from '../src/logger';

vi.hoisted(() => {
  // stub axiom env vars before importing logger
  vi.stubEnv('NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT', 'https://example.co/api/test');
  vi.stubEnv('NEXT_PUBLIC_AXIOM_LOG_LEVEL', 'error');
});

vi.useFakeTimers();

test('log levels', async () => {
  global.fetch = vi.fn(async () => {
    const resp = new Response('', { status: 200 });
    return Promise.resolve(resp);
  }) as vitest.Mock<typeof fetch>;

  log.info('test');
  await log.flush();
  expect(fetch).toHaveBeenCalledTimes(0);

  // test overriding log level per logger
  let logger = new Logger({ args: {}, autoFlush: false, source: 'frontend', logLevel: LogLevel.error });
  logger.debug('hello');
  logger.info('hello');
  logger.warn('hello');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(0);

  logger = new Logger({ args: {}, autoFlush: false, source: 'frontend', logLevel: LogLevel.warn });
  logger.info('hello');
  logger.debug('hello');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(0);

  logger = new Logger({ args: {}, autoFlush: false, source: 'frontend', logLevel: LogLevel.info });
  logger.debug('hello');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(0);

  // disabled logging
  logger = new Logger({ args: {}, autoFlush: false, source: 'frontend', logLevel: LogLevel.off });
  logger.error('no logs');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(0);

  logger = new Logger({ args: {}, autoFlush: false, source: 'frontend', logLevel: LogLevel.error });
  logger.warn('warn');
  logger.error('error');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(1);

  logger = new Logger({ args: {}, autoFlush: false, source: 'frontend', logLevel: LogLevel.debug });
  logger.warn('hello');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(2);
});
