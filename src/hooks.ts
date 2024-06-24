import { usePathname } from 'next/navigation';
import { Logger, LoggerConfig } from './logger';
import { useEffect, useMemo } from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';

export function useLogger(config: LoggerConfig = {}): Logger {
  const path = usePathname();

  const memoizedConfig = useDeepCompareMemo(
    () => ({
      ...config,
      args: {
        ...(config.args ?? {}),
        path,
      },
    }),
    [config, path]
  );

  const logger = useMemo(() => new Logger(memoizedConfig), [memoizedConfig]);

  useEffect(() => {
    return () => {
      if (logger) {
        logger.flush();
      }
    };
  }, [path]);

  return logger;
}
