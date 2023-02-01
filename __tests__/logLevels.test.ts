// clear axiom env vars before importing logger
process.env.AXIOM_TOKEN = '';
process.env.AXIOM_INGEST_ENDPOINT = '';
process.env.AXIOM_LOG_LEVEL = 'error';
import config from '../src/config';
import { log, Logger } from '../src/logger';
import ConsoleTransport from '../src/transports/console.transport';

jest.useFakeTimers();

test('log levels', async () => {
  const mockedLog = jest.spyOn(ConsoleTransport.prototype, 'log').mockImplementation();
  expect(config.isEnvVarsSet()).toBe(false);

  log.info('test');
  await log.flush();
  expect(mockedLog).toHaveBeenCalledTimes(0);

  // test overriding log level per logger
  let logger = new Logger({}, null, false, 'frontend', 'error');
  logger.debug('hello');
  logger.info('hello');
  logger.warn('hello');
  await logger.flush();
  expect(mockedLog).toHaveBeenCalledTimes(0);

  logger = new Logger({}, null, false, 'frontend', 'warn');
  logger.info('hello');
  logger.debug('hello');
  await logger.flush();
  expect(mockedLog).toHaveBeenCalledTimes(0);

  logger = new Logger({}, null, false, 'frontend', 'info');
  logger.debug('hello');
  await logger.flush();
  expect(mockedLog).toHaveBeenCalledTimes(0);

  // disabled logging
  logger = new Logger({}, null, false, 'frontend', 'off');
  logger.error('no logs');
  await logger.flush();
  expect(mockedLog).toHaveBeenCalledTimes(0);

  logger = new Logger({}, null, false, 'frontend', 'error');
  logger.warn('warn');
  logger.error('error');
  await logger.flush();
  expect(mockedLog).toHaveBeenCalledTimes(1);

  logger = new Logger({}, null, false, 'frontend', 'debug');
  logger.warn('hello');
  await logger.flush();
  expect(mockedLog).toHaveBeenCalledTimes(2);
});
