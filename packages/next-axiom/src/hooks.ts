import { useReportWebVitals as useNextReportWebVitals } from 'next/web-vitals';
import { usePathname } from 'next/navigation';
import { Logger, LoggerConfig } from 'next-axiom-core';
import { reportWebVitals } from './webVitals';

export function useReportWebVitals() {
  const path = usePathname();
  useNextReportWebVitals((metric) => reportWebVitals(metric, path));
}

let logger: Logger;

export function useLogger(config: LoggerConfig = {}): Logger {
  if (!logger) {
    logger = new Logger(config); // FIXME: Provide request data and source
  }
  return logger;
}
