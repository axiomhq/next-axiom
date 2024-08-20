import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { expect, test, vi, vitest } from 'vitest';
import { middleware } from '../src/middleware';

vi.hoisted(() => {
  // set axiom env vars before importing logger
  vi.stubEnv('NEXT_PUBLIC_AXIOM_TOKEN', '');
  vi.stubEnv('AXIOM_TOKEN', '');
});

test('middleware processes web vital requests', async () => {
  const context = {
    waitUntil: vitest.fn(),
  } as unknown as NextFetchEvent;
  const response = (await middleware(
    new NextRequest('http://localhost/_axiom/web-vitals', {
      method: 'POST',
    }),
    context
  )) as NextResponse<any>;

  expect(response.status).toBe(204);
  expect(response.body).toBe(null);
});

test('middleware processes logs requests', async () => {
  const context = {
    waitUntil: vitest.fn(),
  } as unknown as NextFetchEvent;
  const response = (await middleware(
    new NextRequest('http://localhost/_axiom/logs', {
      method: 'POST',
    }),
    context
  )) as NextResponse<any>;

  expect(response.status).toBe(204);
  expect(response.body).toBe(null);
});

test('middleware ignores non-axiom requests', async () => {
  const context = {
    waitUntil: vitest.fn(),
  } as unknown as NextFetchEvent;
  const response = await middleware(
    new NextRequest('http://localhost/', {
      method: 'GET',
    }),
    context
  );

  expect(response).toBe(undefined);
});

test('all logs from the browser are sent to the server', async () => {
  const context = {
    waitUntil: vitest.fn(),
  } as unknown as NextFetchEvent;
  const response = (await middleware(
    new NextRequest('http://localhost/_axiom/logs', {
      method: 'POST',
      body: JSON.stringify({ logs: ['hello, world!'] }),
    }),
    context
  )) as NextResponse<any>;

  expect(response.status).toBe(204);
  expect(response.body).toBe(null);
  expect(context.waitUntil).toHaveBeenCalledTimes(1);
});
