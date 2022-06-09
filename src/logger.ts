import { proxyPath, isBrowser, EndpointType, getIngestURL } from './shared';
import { debounce } from './shared';

const url = isBrowser ? `${proxyPath}/logs` : getIngestURL(EndpointType.logs);
const debouncedSendLogs = debounce(sendLogs, 1000);
let logEvents: any[] = [];

function _log(level: string, message: string, args: any = {}) {
  if (!url) {
    console.warn('axiom: NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT is not defined');
    return;
  }

  const logEvent = { level, message, _time: new Date(Date.now()).toISOString() };
  if (Object.keys(args).length > 0) {
    logEvent['fields'] = args;
  }

  logEvents.push(logEvent);
  debouncedSendLogs();
}

export const log = {
  debug: (message: string, args: any = {}) => _log('debug', message, args),
  info: (message: string, args: any = {}) => _log('info', message, args),
  warn: (message: string, args: any = {}) => _log('warn', message, args),
  error: (message: string, args: any = {}) => _log('error', message, args),
  flush: async () => {
    await sendLogs();
  },
};

async function sendLogs() {
  if (!logEvents.length) {
    return;
  }

  const method = 'POST';
  const keepalive = true;
  const body = JSON.stringify(logEvents);
  // clear pending logs
  logEvents = [];

  try {
    if (typeof fetch === 'undefined') {
      const fetch = await require('cross-fetch');
      await fetch(url, { body, method, keepalive });
    } else if (isBrowser && navigator.sendBeacon) {
      navigator.sendBeacon(url, body);
    } else {
      await fetch(url, { body, method, keepalive });
    }
  } catch (e) {
    console.error(`Failed to send logs to Axiom: ${e}`);
  }
}
