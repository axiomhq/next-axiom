import fetch from 'cross-fetch';
import { EndpointType, getIngestURL } from './config';

let collectedLogs: any[] = [];

function _log(level: string, message: string, args: any = {}) {
  const l = { level, message, _time: new Date(Date.now()).toISOString() };
  if (Object.keys(args).length > 0) {
    l['fields'] = args;
  }
  sendLogs();
}

export const log = {
  debug: (message: string, args: any = {}) => _log('debug', message, args),
  info: (message: string, args: any = {}) => _log('info', message, args),
  warn: (message: string, args: any = {}) => _log('warn', message, args),
  error: (message: string, args: any = {}) => _log('error', message, args),
};

function sendLogs() {
  let url = '/axiom/logs';
  // check if running in nodejs and add baseURL so that
  // fetch works correctly
  const isBrowser = typeof window !== 'undefined'
  if (!isBrowser) {
    url = getIngestURL(EndpointType.logs) + '&projectId=2479f8a6-031a-4582-8ca7-a6b2aa7bf82d&configurationId=icfg_3WhrV6ICara11U1rkAU8aQ26';
  }
  const body = JSON.stringify(collectedLogs);

  if (isBrowser && navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
}
