import { NextRequest } from 'next/server';
import { config, isBrowser, isVercelIntegration, Version } from './config';
import { NetlifyInfo } from './platform/netlify';
import { isNoPrettyPrint, requestToJSON, throttle, type RequestJSON } from './shared';

const url = config.getLogsEndpoint();

const LOG_LEVEL = process.env.NEXT_PUBLIC_AXIOM_LOG_LEVEL || 'debug';

export interface LogEvent {
  level: string;
  message: string;
  fields: any;
  _time: string;
  request?: RequestReport;
  git?: any;
  source: string;
  platform?: PlatformInfo;
  vercel?: PlatformInfo;
  netlify?: NetlifyInfo;
  '@app': {
    'next-axiom-version': string;
  };
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
  endTime: number;
  statusCode?: number;
  ip?: string | null;
  region?: string | null;
  path: string;
  host?: string | null;
  method: string;
  scheme: string;
  userAgent?: string | null;
  durationMs?: number;
  details?: RequestJSON;
}

export interface PlatformInfo {
  environment?: string;
  region?: string;
  route?: string;
  source?: string;
  deploymentId?: string;
  deploymentUrl?: string;
  commit?: string;
  project?: string;
  repo?: string;
  ref?: string;
}

export type LoggerConfig = {
  args?: { [key: string]: any };
  logLevel?: LogLevel;
  autoFlush?: boolean;
  source?: string;
  req?: any;
  prettyPrint?: typeof prettyPrint;
};

export class Logger {
  public logEvents: LogEvent[] = [];
  throttledSendLogs = throttle(this.sendLogs, 1000);
  children: Logger[] = [];
  public logLevel: LogLevel = LogLevel.debug;
  public config: LoggerConfig = {
    autoFlush: true,
    source: 'frontend-log',
    prettyPrint: prettyPrint,
  };

  constructor(public initConfig: LoggerConfig = {}) {
    // check if user passed a log level, if not the default init value will be used as is.
    if (this.initConfig.logLevel != undefined && this.initConfig.logLevel >= 0) {
      this.logLevel = this.initConfig.logLevel;
    } else if (LOG_LEVEL) {
      this.logLevel = LogLevel[LOG_LEVEL as keyof typeof LogLevel];
    }
    this.config = { ...this.config, ...initConfig };
  }

  debug = (message: string, args: { [key: string]: any } = {}) => {
    this.log(LogLevel.debug, message, args);
  };
  info = (message: string, args: { [key: string]: any } = {}) => {
    this.log(LogLevel.info, message, args);
  };
  warn = (message: string, args: { [key: string]: any } = {}) => {
    this.log(LogLevel.warn, message, args);
  };
  error = (message: string, args: { [key: string]: any } = {}) => {
    this.log(LogLevel.error, message, args);
  };

  with = (args: { [key: string]: any }) => {
    const config = { ...this.config, args: { ...this.config.args, ...args } };
    const child = new Logger(config);
    this.children.push(child);
    return child;
  };

  withRequest = (req: any) => {
    return new Logger({ ...this.config, req: { ...this.config.req, ...req } });
  };

  private _transformEvent = (level: LogLevel, message: string, args: { [key: string]: any } = {}) => {
    const logEvent: LogEvent = {
      level: LogLevel[level].toString(),
      message,
      _time: new Date(Date.now()).toISOString(),
      source: this.config.source!,
      fields: this.config.args || {},
      '@app': {
        'next-axiom-version': Version,
      },
    };

    // check if passed args is an object, if its not an object, add it to fields.args
    if (args instanceof Error) {
      logEvent.fields = { ...logEvent.fields, message: args.message, stack: args.stack, name: args.name, cause: args.cause };
    } else if (typeof args === 'object' && args !== null && Object.keys(args).length > 0) {
      const parsedArgs = JSON.parse(JSON.stringify(args, jsonFriendlyErrorReplacer));
      logEvent.fields = { ...logEvent.fields, ...parsedArgs };
    } else if (args && args.length) {
      logEvent.fields = { ...logEvent.fields, args: args };
    }

    config.injectPlatformMetadata(logEvent, this.config.source!);

    if (this.config.req != null) {
      logEvent.request = this.config.req;
      if (logEvent.platform) {
        logEvent.platform.route = this.config.req.path;
      } else if (logEvent.vercel) {
        logEvent.vercel.route = this.config.req.path;
      }
    }

    return logEvent;
  };

  logHttpRequest(level: LogLevel, message: string, request: any, args: any) {
    const logEvent = this._transformEvent(level, message, args);
    logEvent.request = request;
    this.logEvents.push(logEvent);
    if (this.config.autoFlush) {
      this.throttledSendLogs();
    }
  }

  middleware<
    TConfig extends { logRequestDetails?: boolean | (keyof RequestJSON)[] },
    TReturn = TConfig['logRequestDetails'] extends boolean | (keyof RequestJSON)[] ? Promise<void> : void,
  >(request: NextRequest, config?: TConfig): TReturn {
    const req = {
      ip: request.ip,
      region: request.geo?.region,
      method: request.method,
      host: request.nextUrl.hostname,
      path: request.nextUrl.pathname,
      scheme: request.nextUrl.protocol.split(':')[0],
      referer: request.headers.get('Referer'),
      userAgent: request.headers.get('user-agent'),
    };

    const message = `${request.method} ${request.nextUrl.pathname}`;

    if (config?.logRequestDetails) {
      return requestToJSON(request).then((details) => {
        const newReq = {
          ...req,
          details: Array.isArray(config.logRequestDetails)
            ? (Object.fromEntries(
                Object.entries(details as RequestJSON).filter(([key]) =>
                  (config.logRequestDetails as (keyof RequestJSON)[]).includes(key as keyof RequestJSON)
                )
              ) as RequestJSON)
            : details,
        };
        return this.logHttpRequest(LogLevel.info, message, newReq, {});
      }) as TReturn;
    }

    return this.logHttpRequest(LogLevel.info, message, req, {}) as TReturn;
  }

  log = (level: LogLevel, message: string, args: { [key: string]: any } = {}) => {
    if (level < this.logLevel) {
      return;
    }
    const logEvent = this._transformEvent(level, message, args);

    this.logEvents.push(logEvent);
    if (this.config.autoFlush) {
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

    // To send logs over the network, we need one of:
    //
    // - Axiom URL and Axiom dataset and Axiom token
    // - Axiom Vercel ingest URL
    // - Custom endpoint
    //
    // We fall back to printing to console to avoid network errors in
    // development environments.
    if (!config.isEnvVarsSet()) {
      this.logEvents.forEach((ev) => (this.config.prettyPrint ? this.config.prettyPrint(ev) : prettyPrint(ev)));
      this.logEvents = [];
      return;
    }

    const method = 'POST';
    const keepalive = true;
    const body = JSON.stringify(this.logEvents);
    // clear pending logs
    this.logEvents = [];
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'next-axiom/v' + Version,
    };
    if (config.token) {
      headers['Authorization'] = `Bearer ${config.token}`;
    }
    const reqOptions: RequestInit = { body, method, keepalive, headers };

    function sendFallback() {
      // Do not leak network errors; does not affect the running app
      return fetch(url, reqOptions).catch(console.error);
    }

    try {
      if (typeof fetch === 'undefined') {
        const fetch = await require('whatwg-fetch');
        return fetch(url, reqOptions).catch(console.error);
      } else if (isBrowser && isVercelIntegration && navigator.sendBeacon) {
        // sendBeacon fails if message size is greater than 64kb, so
        // we fall back to fetch.
        // Navigator has to be bound to ensure it does not error in some browsers
        // https://xgwang.me/posts/you-may-not-know-beacon/#it-may-throw-error%2C-be-sure-to-catch
        try {
          if (!navigator.sendBeacon.bind(navigator)(url, body)) {
            return sendFallback();
          }
        } catch (error) {
          return sendFallback();
        }
      } else {
        return sendFallback();
      }
    } catch (e) {
      console.warn(`Failed to send logs to Axiom: ${e}`);
      // put the log events back in the queue
      this.logEvents = [...this.logEvents, JSON.parse(body)];
    }
  }

  flush = async () => {
    await Promise.all([this.sendLogs(), ...this.children.map((c) => c.flush())]);
  };
}

export const log = new Logger({});

const levelColors: { [key: string]: any } = {
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

  if (isBrowser) {
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

function jsonFriendlyErrorReplacer(key: string, value: any) {
  if (value instanceof Error) {
    return {
      // Pull all enumerable properties, supporting properties on custom Errors
      ...value,
      // Explicitly pull Error's non-enumerable properties
      name: value.name,
      message: value.message,
      stack: value.stack,
      cause: jsonFriendlyErrorReplacer(undefined, value.cause),
    };
  }

  return value;
}
