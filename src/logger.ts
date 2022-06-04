import { proxyPath, isBrowser, EndpointType, getIngestURL } from './config';

const url = isBrowser ? `${proxyPath}/logs` : getIngestURL(EndpointType.logs);

async function _log(level: string, message: string, args: any = {}) {
  const logEvent = { level, message, _time: new Date(Date.now()).toISOString() };
  if (Object.keys(args).length > 0) {
    logEvent['fields'] = args;
  }
  const body = JSON.stringify([logEvent]);

  if (typeof fetch === 'undefined') {
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
