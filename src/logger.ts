import { EndpointType, getIngestURL } from './config';

async function _log(level: string, message: string, args: any = {}) {
  const logEvent = { level, message, _time: new Date(Date.now()).toISOString() };
  if (Object.keys(args).length > 0) {
    logEvent['fields'] = args;
  }

  let url = '/_axiom/logs';
  // check if running in nodejs and add baseURL so that
  // fetch works correctly
  const isBrowser = typeof window !== 'undefined'
  if (!isBrowser) {
    url = getIngestURL(EndpointType.logs);
  }
  const body = JSON.stringify([logEvent]);

  if (!isBrowser) {
    const fetch = await require('node-fetch');
    await fetch(url, { body, method: 'POST', keepalive: true });
  } else if (isBrowser && navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    await fetch(url, { body, method: 'POST', keepalive: true });
  }
}

export const log = {
  debug: async (message: string, args: any = {}) => await _log('debug', message, args),
  info: async (message: string, args: any = {}) => await _log('info', message, args),
  warn: async (message: string, args: any = {}) => await _log('warn', message, args),
  error: async (message: string, args: any = {}) => await _log('error', message, args),
};
