import { test, expect, vi } from 'vitest';
import { config } from '../src/config';
import { EndpointType } from '../src/shared';
import { Logger } from '../src/logger';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_AXIOM_URL = undefined;
  process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT = 'https://api.axiom.co/v1/integrations/vercel';
});

test('reading vercel ingest endpoint', () => {
  let url = config.getIngestURL(EndpointType.webVitals);
  expect(url).toEqual('https://api.axiom.co/v1/integrations/vercel?type=web-vitals');

  url = config.getIngestURL(EndpointType.logs);
  expect(url).toEqual('https://api.axiom.co/v1/integrations/vercel?type=logs');
});

test('logging to console when running on lambda', async () => {
  vi.useFakeTimers();
  const mockedConsole = vi.spyOn(console, 'log');
  const time = new Date(Date.now()).toISOString();

  const logger = new Logger({
    source: 'lambda',
  });

  logger.info('hello, world!');

  await logger.flush();
  expect(mockedConsole).toHaveBeenCalledTimes(1);

  const calledWithPayload = JSON.parse(mockedConsole.mock.calls[0][0]);
  expect(calledWithPayload.message).toEqual('hello, world!');
  expect(calledWithPayload.level).toEqual('info');
  expect(calledWithPayload._time).toEqual(time);
  expect(calledWithPayload.vercel.source).toEqual('lambda');
});
