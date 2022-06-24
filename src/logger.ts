import { proxyPath, isBrowser, EndpointType, getIngestURL, isEnvVarsSet, isNoPrettyPrint } from './shared';
import { throttle } from './shared';

const url = isBrowser ? `${proxyPath}/logs` : getIngestURL(EndpointType.logs);
const throttledSendLogs = throttle(sendLogs, 1000);
let logEvents: any[] = [];

function _log(level: string, message: string, args: any = {}) {
  if (!isEnvVarsSet) {
    // if AXIOM ingesting url is not set, fallback to printing to console
    // to avoid network errors in development environments
    prettyPrint(level, message, args);
    return;
  }

  const logEvent = { level, message, _time: new Date(Date.now()).toISOString() };
  if (Object.keys(args).length > 0) {
    logEvent['fields'] = args;
  }

  logEvents.push(logEvent);
  throttledSendLogs();
}

export const log = {
  debug: (message: string, args: any = {}) => _log('debug', message, args),
  info: (message: string, args: any = {}) => _log('info', message, args),
  warn: (message: string, args: any = {}) => _log('warn', message, args),
  error: (message: string, args: any = {}) => _log('error', message, args),
  flush: sendLogs,
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
      const fetch = await require('whatwg-fetch');
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

const levelColors = {
  info: {
    terminal: '32',
    browser: 'lightgreen',
  },
  debug: {
    terminal: '36',
    browser: 'lightblue',
  },
  warn: {
    terminal: '33',
    browser: 'yellow',
  },
  error: {
    terminal: '31',
    browser: 'red',
  },
};

export function prettyPrint(level: string, message: string, fields: any = {}) {
  const hasFields = Object.keys(fields).length > 0;
  // check whether pretty print is disabled
  if (isNoPrettyPrint) {
    let msg = `${level} - ${message}`;
    if (hasFields) {
      msg += ' ' + JSON.stringify(fields);
    }
    console.log(msg);
    return;
  }
  // print indented message, instead of [object]
  // We use the %o modifier instead of JSON.stringify because stringify will print the
  // object as normal text, it loses all the functionality the browser gives for viewing
  // objects in the console, such as expanding and collapsing the object.
  let msgString = '';
  let args = [level, message];

  if (isBrowser) {
    msgString = '%c%s - %s';
    args = [`color: ${levelColors[level].browser};`, ...args];
  } else {
    msgString = `\x1b[${levelColors[level].terminal}m%s\x1b[0m - %s`;
  }
  // we check if the fields object is not empty, otherwise its printed as <empty string>
  // or just "".
  if (hasFields) {
    msgString += ' %o';
    args.push(fields);
  }

  console.log.apply(console, [msgString, ...args]);
}
