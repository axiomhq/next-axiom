import { proxyPath, isBrowser, EndpointType, getIngestURL } from './config';
import { debounce } from './debounce';

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

  // if is running on node, print to stdout, output will be pickedup with vercel
  // otherwise send as json
  if (!isBrowser) {
    const body = JSON.stringify(logEvent);
    console.log('AXIOM::LOG=' + body);
    return;
  }

  logEvents.push(logEvent);
  debouncedSendLogs();
}

export const log = {
  debug: (message: string, args: any = {}) => _log('debug', message, args),
  info: (message: string, args: any = {}) => _log('info', message, args),
  warn: (message: string, args: any = {}) => _log('warn', message, args),
  error: (message: string, args: any = {}) => _log('error', message, args),
};

function sendLogs() {
  const body = JSON.stringify(logEvents);

  if (isBrowser && navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }

  // clear logs after they are pushed
  logEvents = [];
}
