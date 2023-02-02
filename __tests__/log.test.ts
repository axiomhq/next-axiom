/**
 * @jest-environment jsdom
 */
// clear axiom env vars before importing logger
process.env.AXIOM_TOKEN = '';
process.env.AXIOM_INGEST_ENDPOINT = '';
import { log } from '../src/logger';

const mockedLog = jest.spyOn(global.console, 'log').mockImplementation();

afterEach(() => {
  mockedLog.mockClear();
});

const getMockCallDetails = (mockedLog: jest.SpyInstance, callIndex = 0) => {
  const payload = (mockedLog as jest.Mock).mock.calls[callIndex];
  const level = payload[2];
  const msg = payload[3];
  const fields = payload[4];

  return { level, msg, fields };
};

test('with() should create child logger', async () => {
  const logger = log.with({ foo: 'bar' });
  logger.info('hello, world!', { bar: 'baz' });
  expect(mockedLog).toHaveBeenCalledTimes(1);

  const { level, msg, fields } = getMockCallDetails(mockedLog);
  expect(level).toEqual('info');
  expect(msg).toEqual('hello, world!');
  expect(Object.keys(fields).length).toBe(2);
  expect(fields.foo).toBe('bar');
  expect(fields.bar).toBe('baz');
});

test('passing non-object should be wrapped in object', async () => {
  const logger = log.with({ foo: 'bar' });
  const args = 'baz';
  logger.info('hello, world!', args as unknown as object);
  expect(mockedLog).toHaveBeenCalledTimes(1);

  const { level, msg, fields } = getMockCallDetails(mockedLog);
  expect(level).toBe('info');
  expect(msg).toBe('hello, world!');
  expect(fields.foo).toBe('bar');
  expect(fields.args).toBe('baz');
});

test('flushing parent logger should flush children', async () => {
  log.info('hello, world!');

  const logger1 = log.with({ foo: 'bar' });
  logger1.debug('logger1');

  const logger2 = logger1.with({ bar: 'foo' });
  logger2.flush = jest.fn();
  logger2.debug('logger2');

  expect(mockedLog).toHaveBeenCalledTimes(3);
  await log.flush();

  expect(logger2.flush).toHaveBeenCalledTimes(1);

  const { fields } = getMockCallDetails(mockedLog, 2);
  expect(fields).toBeTruthy();
  expect(Object.keys(fields).length).toEqual(2);
  expect(fields.foo).toEqual('bar');
  expect(fields.bar).toEqual('foo');
  // ensure there is nothing was left unflushed
  await log.flush();
  expect(mockedLog).toHaveBeenCalledTimes(3);
});

test('throwing exception should be handled as error object', async () => {
  const err = new Error('test');
  log.error('hello, world!', err);
  expect(mockedLog).toHaveBeenCalledTimes(1);
  const { fields } = getMockCallDetails(mockedLog);
  expect(Object.keys(fields).length).toEqual(3); // { name, message, stack }
  expect(fields.message).toEqual(err.message);
  expect(fields.name).toEqual(err.name);
});
