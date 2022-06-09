import { proxyPath, isBrowser, EndpointType, getIngestURL } from './config';
import { debounce } from './debounce';

const url = isBrowser ? `${proxyPath}/logs` : getIngestURL(EndpointType.logs);
const debouncedSendLogs = debounce(sendLogs, 1000);
let logEvents: any[] = [];

// if is running on node, print to stdout, output will be pickedup with vercel
// otherwise send as json.
if (!isBrowser) {
  process.on('beforeExit', async () => {
    await sendLogs()
    process.exit(0) // if you don't close yourself this will run forever
  });

  ['SIGINT', 'SIGTERM'].forEach(function (sig) {
    process.on(sig, function () {
        debounce(sendLogs, 0);
        console.log('signal: ' + sig);
    });
  });
}

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
};

async function sendLogs() {
  if (!logEvents.length) { 
    return;
  }
  const body = JSON.stringify(logEvents);

  if (isBrowser && navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    await fetch(url, { body, method: 'POST', keepalive: true });
  }

  // clear logs after they are pushed
  logEvents = [];
}
