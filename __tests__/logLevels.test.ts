/**
 * @jest-environment jsdom
 */
// set axiom env vars before importing logger
process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT = 'https://example.co/api/test';
process.env.NEXT_PUBLIC_AXIOM_LOG_LEVEL = 'error';
global.fetch = jest.fn() as jest.Mock;
import { log, Logger, LogLevel } from '../src/logger';

jest.useFakeTimers();

describe('log level tests', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('reads NEXT_PUBLIC_AXIOM_LOG_LEVEL env', async () => {
    log.info('test');
    expect(log.globalLevel).toEqual(LogLevel.error);
    expect(log.logEvents).toHaveLength(0);
  });

  it('does not log when log level is lower than logger global level', async () => {
    // test overriding log level per logger
    let logger = new Logger({}, null, false, 'lambda', LogLevel.error);
    expect(logger.globalLevel).toEqual(LogLevel.error);
    logger.debug('case1');
    logger.info('case1');
    logger.warn('case1');
    expect(logger.logEvents).toHaveLength(0);
    await logger.flush();
    expect(fetch).toHaveBeenCalledTimes(0);

    logger = new Logger({}, null, false, 'edge', LogLevel.warn);
    expect(logger.globalLevel).toEqual(LogLevel.warn);
    logger.info('case2');
    logger.debug('case2');
    expect(logger.logEvents).toHaveLength(0);
    await logger.flush();
    expect(fetch).toHaveBeenCalledTimes(0);

    logger = new Logger({}, null, false, 'frontend', LogLevel.info);
    expect(logger.globalLevel).toEqual(LogLevel.info);
    logger.debug('case3');
    expect(logger.logEvents).toHaveLength(0);
    await logger.flush();
    expect(fetch).toHaveBeenCalledTimes(0);
  });

  it('prints error when level is set to error', async () => {
    const logger = new Logger({}, null, false, 'edge', LogLevel.error);
    expect(logger.globalLevel).toEqual(LogLevel.error);
    logger.warn('warn');
    logger.error('error');
    expect(logger.logEvents).toHaveLength(1);
    await logger.flush();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('prints all when level is debug', async () => {
    const logger = new Logger({}, null, false, 'lambda', LogLevel.debug);
    expect(logger.globalLevel).toEqual(LogLevel.debug);
    logger.warn('hello');
    logger.error('error');
    expect(logger.logEvents).toHaveLength(2);
    await logger.flush();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not print when level is off', async () => {
    const logger = new Logger({}, null, false, 'frontend', LogLevel.off);
    expect(logger.globalLevel).toEqual(LogLevel.off);
    logger.error('no logs');
    expect(logger.logEvents).toHaveLength(0);
    await logger.flush();
    expect(fetch).toHaveBeenCalledTimes(0);
  });
});
