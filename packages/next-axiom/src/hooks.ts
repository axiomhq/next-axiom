import { useReportWebVitals as useNextReportWebVitals } from 'next/web-vitals';
import { usePathname } from 'next/navigation';
import { Logger, LoggerConfig } from 'next-axiom-core';
import { reportWebVitalsWithPath } from './webVitals';
import { useEffect } from 'react';

export function useReportWebVitals() {
  const path = usePathname();
  useNextReportWebVitals((metric) => reportWebVitalsWithPath(metric, path));
}

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
  return logger; // FIXME: Provide request data and source
}
