import fetch from 'cross-fetch';
import { EndpointType, getIngestURL } from './config';

let collectedLogs: any[] = [];

function _log(level: string, message: string, args: any = {}) {
  const logEvent = { level, message, _time: new Date(Date.now()).toISOString() };
  if (Object.keys(args).length > 0) {
    logEvent['fields'] = args;
  }
  collectedLogs.push(logEvent);
  sendLogs();
}

export const log = {
  debug: (message: string, args: any = {}) => _log('debug', message, args),
  info: (message: string, args: any = {}) => _log('info', message, args),
  warn: (message: string, args: any = {}) => _log('warn', message, args),
  error: (message: string, args: any = {}) => _log('error', message, args),
};

function sendLogs() {
  let url = '/_axiom/logs';
  // check if running in nodejs and add baseURL so that
  // fetch works correctly
  const isBrowser = typeof window !== 'undefined'
  if (!isBrowser) {
    url = getIngestURL(EndpointType.logs);
  }
  const body = JSON.stringify(collectedLogs);

  if (isBrowser && navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
}
