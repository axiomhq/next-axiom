import fetch from 'cross-fetch';
import { getIngestURL, EndpointType } from './config';
const _debounce = require('lodash/debounce');

const ingestEndpoint = getIngestURL(EndpointType.log);

const debouncedSendLogs = _debounce(() => sendLogs(), 1000);

let collectedLogs: any[] = [];

function _log(level: string, message: string, args: any = {}) {
  const l = { level, message, ...args, _time: new Date(Date.now()).toISOString() };
  collectedLogs.push(l);
  debouncedSendLogs();
}

export const log = {
  debug: (message: string, args: any = {}) => _log('debug', message, args),
  info: (message: string, args: any = {}) => _log('info', message, args),
  warn: (message: string, args: any = {}) => _log('warn', message, args),
  error: (message: string, args: any = {}) => _log('error', message, args),
};

function sendLogs() {
  const body = JSON.stringify(collectedLogs);

  if (typeof window !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(ingestEndpoint, body);
  } else {
    fetch(ingestEndpoint, { body, method: 'POST', keepalive: true });
  }
  // clear collected logs
  collectedLogs = [];
}
