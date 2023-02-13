import { LogLevel, DEFAULT_LOG_LEVEL } from './levels';
import { LoggerConfig } from './config';

export interface LogEvent {
  level: string;
  message: string;
  fields: {};
  _time: string;
  [key: string]: any;
}

export class Logger {
  children: Logger[] = [];
  public logLevel: string;

  constructor(public config: LoggerConfig) {
    this.logLevel = config.logLevel || DEFAULT_LOG_LEVEL || 'debug';
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
    const child = new Logger({ ...this.config, args: { ...this.config.args, ...args } });
    this.children.push(child);
    return child;
  };

  _log = (level: string, message: string, args: { [key: string]: any } = {}) => {
    if (LogLevel[level] < LogLevel[this.logLevel]) {
      return;
    }
    const logEvent: LogEvent = { level, message, _time: new Date(Date.now()).toISOString(), fields: this.config.args || {} };

    // check if passed args is an object, if its not an object, add it to fields.args
    if (args instanceof Error) {
      logEvent.fields = { ...logEvent.fields, message: args.message, stack: args.stack, name: args.name };
    } else if (typeof args === 'object' && args !== null && Object.keys(args).length > 0) {
      const parsedArgs = JSON.parse(JSON.stringify(args, jsonFriendlyErrorReplacer));
      logEvent.fields = { ...logEvent.fields, ...parsedArgs };
    } else if (args && args.length) {
      logEvent.fields = { ...logEvent.fields, args: args };
    }

    this.config.transport.log(logEvent);
  };

  async flush() {
    await Promise.all([this.config.transport.flush(), ...this.children.map((c) => c.flush())]);
  }
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
    };
  }

  return value;
}
