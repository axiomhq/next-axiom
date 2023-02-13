import Transport from "./transport";

export class LoggerConfig {
  args: { [key: string]: any } = {};
  source: LoggingSource;
  transport: Transport;
  logLevel?: string;
}

export enum LoggingSource {
    browser,
    lambda,
    edge,
    build,
}