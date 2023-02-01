import config, { isVercel } from './config';
import { NetlifyInfo } from './platform/netlify';
import Transport from './transports/transport';
import ConsoleTransport from './transports/console.transport';
import LogDrainTransport from './transports/log-drain.transport';
import FetchTransport from './transports/fetch.transport';

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
}

export interface PlatformInfo {
  environment?: string;
  region?: string;
  route?: string;
  source?: string;
}

export class Logger {
  children: Logger[] = [];
  public logLevel: string;
  private transport: Transport;

  constructor(
    private args: { [key: string]: any } = {},
    private req: RequestReport | null = null,
    private autoFlush: boolean = true,
    public source: 'frontend' | 'lambda' | 'edge' = 'frontend',
    logLevel?: string
  ) {
    this.logLevel = logLevel || LOG_LEVEL || 'debug';
    // decide which transport to use, if log drain is set, use that, otherwise use fetch, or fallback to console
    if (!config.isEnvVarsSet()) {
      this.transport = new ConsoleTransport();
    } else if (isVercel && !config.isBrowser) {
      // if running in a lambda or edge function and axiom log drain is enabled,
      // use the log drain transport
      this.transport = new LogDrainTransport();
    } else {
      this.transport = new FetchTransport(autoFlush);
    }
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
    if (args instanceof Error) {
      logEvent.fields = { ...logEvent.fields, message: args.message, stack: args.stack, name: args.name };
    } else if (typeof args === 'object' && args !== null && Object.keys(args).length > 0) {
      const parsedArgs = JSON.parse(JSON.stringify(args, jsonFriendlyErrorReplacer));
      logEvent.fields = { ...logEvent.fields, ...parsedArgs };
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

    this.transport.log(logEvent);
    // TODO: should we call flush here? should the child loggers flush as well?
    // if (this.autoFlush) {
    //   this.flush();
    // }
  };

  attachResponseStatus = (statusCode: number) => {
    // TODO: find a better way to handle response status
    // this.logEvents = this.logEvents.map((log) => {
    //   if (log.request) {
    //     log.request.statusCode = statusCode;
    //   }
    //   return log;
    // });
  };

  async flush() {
    await Promise.all([this.transport.flush(), ...this.children.map((c) => c.flush())]);
  }
}

export const log = new Logger();

function jsonFriendlyErrorReplacer(key: string, value: any) {
  if (value instanceof Error) {
    return {
      // Pull all enumerable properties, supporting properties on custom Errors
      ...value,
      // Explicitly pull Error's non-enumerable properties
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  return value;
}
