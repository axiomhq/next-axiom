import { test, expect, vi } from 'vitest';
import { log } from '../src/logger';
import { mockFetchResponse } from './helpers';

vi.hoisted(() => {
  // clear Axiom env vars
  process.env.NEXT_PUBLIC_AXIOM_URL = '';
  process.env.NEXT_PUBLIC_AXIOM_DATASET = '';
  process.env.NEXT_PUBLIC_AXIOM_TOKEN = '';
  process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT = '';
});

vi.useFakeTimers();

test('sending logs on localhost should fallback to console', () => {
  mockFetchResponse('ok');
  const consoleMock = vi.spyOn(console, 'log');

  log.info('hello, world!');
  vi.advanceTimersByTime(1000);
  expect(fetch).toHaveBeenCalledTimes(0);
  expect(consoleMock).toHaveBeenCalledTimes(1);
});
