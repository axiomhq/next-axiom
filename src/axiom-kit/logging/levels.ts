export const DEFAULT_LOG_LEVEL = process.env.AXIOM_LOG_LEVEL || 'debug';

export enum LogLevel {
  debug = 0,
  info = 1,
  warn = 2,
  error = 3,
  off = 100,
}
