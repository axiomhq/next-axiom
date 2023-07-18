// set axiom env vars before importing logger
process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT = 'https://example.co/api/test';
process.env.NEXT_PUBLIC_AXIOM_LOG_LEVEL = 'error';
import { log, Logger, LogLevel } from '../src/logger';
import { test, expect, jest } from '@jest/globals';

jest.useFakeTimers();

test('log levels', async () => {
  global.fetch = jest.fn(async () => {
    const resp = new Response('', { status: 200 });
    return Promise.resolve(resp);
  }) as jest.Mock<typeof fetch>;

  expect(log.logLevel).toEqual(LogLevel.error);
  log.info('test');
  await log.flush();
  expect(fetch).toHaveBeenCalledTimes(0);

  // test overriding log level per logger
  let logger = new Logger({ args: {}, autoFlush: false, source: 'frontend', logLevel: LogLevel.error });
  expect(logger.logLevel).toEqual(LogLevel.error);
  logger.debug('hello');
  logger.info('hello');
  logger.warn('hello');
  await logger.flush();
  expect(global.fetch).toHaveBeenCalledTimes(0);

  logger = new Logger({ args: {}, autoFlush: false, source: 'frontend', logLevel: LogLevel.warn });
  expect(logger.logLevel).toEqual(LogLevel.warn);
  logger.info('hello');
  logger.debug('hello');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(0);

  logger = new Logger({ args: {}, autoFlush: false, source: 'frontend', logLevel: LogLevel.info });
  expect(logger.logLevel).toEqual(LogLevel.info);
  logger.debug('hello');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(0);

  // disabled logging
  logger = new Logger({ args: {}, autoFlush: false, source: 'frontend', logLevel: LogLevel.off });
  expect(logger.logLevel).toEqual(LogLevel.off);
  logger.error('no logs');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(0);

  logger = new Logger({ args: {}, autoFlush: false, source: 'frontend', logLevel: LogLevel.error });
  expect(logger.logLevel).toEqual(LogLevel.error);
  logger.warn('warn');
  logger.error('error');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(1);

  logger = new Logger({ args: {}, autoFlush: false, source: 'frontend', logLevel: LogLevel.debug });
  expect(logger.logLevel).toEqual(LogLevel.debug);
  logger.warn('hello');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(2);
});
