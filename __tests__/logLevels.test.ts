/**
 * @jest-environment jsdom
 */
// set axiom env vars before importing logger
process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT = 'https://example.co/api/test';
process.env.NEXT_PUBLIC_AXIOM_LOG_LEVEL = 'error';
import { log, Logger } from '../src/logger';

jest.useFakeTimers();

test('log levels', async () => {
  global.fetch = jest.fn() as jest.Mock;

  log.info('test');
  await log.flush();
  expect(fetch).toHaveBeenCalledTimes(0);

  // test overriding log level per logger
  let logger = new Logger({}, null, false, 'frontend', 'error');
  logger.debug('hello');
  logger.info('hello');
  logger.warn('hello');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(0);

  logger = new Logger({}, null, false, 'frontend', 'warn');
  logger.info('hello');
  logger.debug('hello');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(0);

  logger = new Logger({}, null, false, 'frontend', 'info');
  logger.debug('hello');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(0);

  // disabled logging
  logger = new Logger({}, null, false, 'frontend', 'off');
  logger.error('no logs');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(0);

  logger = new Logger({}, null, false, 'frontend', 'error');
  logger.warn('warn');
  logger.error('error');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(1);

  logger = new Logger({}, null, false, 'frontend', 'debug');
  logger.warn('hello');
  await logger.flush();
  expect(fetch).toHaveBeenCalledTimes(2);
});
