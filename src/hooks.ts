import { usePathname } from 'next/navigation';
import { Logger, LoggerConfig } from './logger';
import { useEffect, useMemo } from 'react';
import { useDeepMemo } from './util';

export function useLogger(config: LoggerConfig = {}): Logger {
  const path = usePathname();

  const memoizedConfig = useDeepMemo({
    ...config,
    args: {
      ...(config.args ?? {}),
      path,
    },
  });

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
