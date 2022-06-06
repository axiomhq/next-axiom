/**
 * @jest-environment jsdom
 */
import { log } from '../src/logger';
import fetch from 'cross-fetch';

jest.mock('cross-fetch');

test('logging', async () => {
  await log.info('hello, world!');
  expect(fetch).toHaveBeenCalled();
});
