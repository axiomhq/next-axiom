import config, { isVercel, Version } from './config';
import { NetlifyInfo } from './platform/netlify';
import { isNoPrettyPrint, throttle } from './shared';

const url = config.getLogsEndpoint();
const LOG_LEVEL = process.env.AXIOM_LOG_LEVEL || 'debug';

export interface LogEvent {
  level: string;
  message: string;
  fields: {};
  _time: string;
  request?: RequestReport;
  platform?: PlatformInfo;
  vercel?: PlatformInfo;
  netlify?: NetlifyInfo;
}

export enum LogLevel {
  debug = 0,
  info = 1,
  warn = 2,
  error = 3,
  off = 100,
}

export interface RequestReport {
  startTime: number;
  statusCode?: number;
  ip?: string;
  region?: string;
  path: string;
  host: string;
  method: string;
  scheme: string;
  userAgent?: string | null;
  referer?: string | null;
}

export interface PlatformInfo {
  environment?: string;
  region?: string;
  route?: string;
  source?: string;
}

export class Logger {
  public logEvents: LogEvent[] = [];
  throttledSendLogs = throttle(this.sendLogs, 1000);
  children: Logger[] = [];
  public logLevel: string;

  constructor(
    private args: { [key: string]: any } = {},
    private req: RequestReport | null = null,
    private autoFlush: Boolean = true,
    public source: 'frontend' | 'lambda' | 'edge' = 'frontend',
    logLevel?: string
  ) {
    this.logLevel = logLevel || LOG_LEVEL || 'debug';
  }

  debug = (message: string, args: { [key: string]: any } = {}) => {
    this._log('debug', message, args);
  };
  info = (message: string, args: { [key: string]: any } = {}) => {
    this._log('info', message, args);
  };
  warn = (message: string, args: { [key: string]: any } = {}) => {
    this._log('warn', message, args);
  };
  error = (message: string, args: { [key: string]: any } = {}) => {
    this._log('error', message, args);
  };

  with = (args: { [key: string]: any }) => {
    const child = new Logger({ ...this.args, ...args }, this.req, this.autoFlush, this.source);
    this.children.push(child);
    return child;
  };

  withRequest = (req: RequestReport) => {
    return new Logger({ ...this.args }, req, this.autoFlush, this.source);
  };

  _log = (level: string, message: string, args: { [key: string]: any } = {}) => {
    if (LogLevel[level] < LogLevel[this.logLevel]) {
      return;
    }
    const logEvent: LogEvent = { level, message, _time: new Date(Date.now()).toISOString(), fields: this.args || {} };

    // check if passed args is an object, if its not an object, add it to fields.args
    if (typeof args === 'object' && args !== null && Object.keys(args).length > 0) {
      logEvent.fields = { ...logEvent.fields, ...args };
    } else if (args && args.length) {
      logEvent.fields = { ...logEvent.fields, args: args };
    }

    config.injectPlatformMetadata(logEvent, this.source);

    if (this.req != null) {
      logEvent.request = this.req;
      if (logEvent.platform) {
        logEvent.platform.route = this.req.path;
      } else if (logEvent.vercel) {
        logEvent.vercel.route = this.req.path;
      }
    }

    this.logEvents.push(logEvent);
    if (this.autoFlush) {
      this.throttledSendLogs();
    }
  };

  attachResponseStatus = (statusCode: number) => {
    this.logEvents = this.logEvents.map((log) => {
      if (log.request) {
        log.request.statusCode = statusCode;
      }
      return log;
    });
  };

  async sendLogs() {
    if (!this.logEvents.length) {
      return;
    }

    if (!config.isEnvVarsSet()) {
      // if AXIOM ingesting url is not set, fallback to printing to console
      // to avoid network errors in development environments
      this.logEvents.forEach((ev) => prettyPrint(ev));
      this.logEvents = [];
      return;
    }

    const method = 'POST';
    const keepalive = true;
    const body = JSON.stringify(this.logEvents);
    // clear pending logs
    this.logEvents = [];
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'next-axiom/v' + Version,
    };
    if (config.token) {
      headers['Authorization'] = `Bearer ${config.token}`;
    }
    const reqOptions: RequestInit = { body, method, keepalive, headers };

    try {
      if (typeof fetch === 'undefined') {
        const fetch = await require('whatwg-fetch');
        await fetch(url, reqOptions);
      } else if (config.isBrowser && isVercel && navigator.sendBeacon) {
        navigator.sendBeacon(url, body);
      } else {
        await fetch(url, reqOptions);
      }
    } catch (e) {
      console.error(`Failed to send logs to Axiom: ${e}`);
    }
  }

  flush = async () => {
    await Promise.all([this.sendLogs(), ...this.children.map((c) => c.flush())]);
  };
}

export const log = new Logger();

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

export function prettyPrint(ev: LogEvent) {
  const hasFields = Object.keys(ev.fields).length > 0;
  // check whether pretty print is disabled
  if (isNoPrettyPrint) {
    let msg = `${ev.level} - ${ev.message}`;
    if (hasFields) {
      msg += ' ' + JSON.stringify(ev.fields);
    }
    console.log(msg);
    return;
  }
  // print indented message, instead of [object]
  // We use the %o modifier instead of JSON.stringify because stringify will print the
  // object as normal text, it loses all the functionality the browser gives for viewing
  // objects in the console, such as expanding and collapsing the object.
  let msgString = '';
  let args: any[] = [ev.level, ev.message];

  if (config.isBrowser) {
    msgString = '%c%s - %s';
    args = [`color: ${levelColors[ev.level].browser};`, ...args];
  } else {
    msgString = `\x1b[${levelColors[ev.level].terminal}m%s\x1b[0m - %s`;
  }
  // we check if the fields object is not empty, otherwise its printed as <empty string>
  // or just "".
  if (hasFields) {
    msgString += ' %o';
    args.push(ev.fields);
  }

  if (ev.request) {
    msgString += ' %o';
    args.push(ev.request);
  }

  console.log.apply(console, [msgString, ...args]);
}
