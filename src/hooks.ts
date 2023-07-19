import { usePathname } from 'next/navigation';
import { Logger, LoggerConfig } from './logger';
import { useEffect } from 'react';



export function useLogger(config: LoggerConfig = {}): Logger {
  const path = usePathname();
  useEffect(() => {
    return () => {
      if (logger) {
        logger.flush();
      }
    };
  }, [path]);

  if (!config.args) {
    config.args = {};
  }
  config.args.path = path;

  const logger = new Logger(config);
  return logger;
}
