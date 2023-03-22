import { createLogger, Logger, LogLevel } from '@axiomhq/kit';
import { NextWebVitalsMetric } from 'next/app';

export const log = createLogger();

export function logWebVital(logger: Logger, metric: WebVitalsMetric) {
  logger._log(LogLevel.info, 'web-vitals', { webVitals: [metric] });
}

export function logLambdaReport(logger: Logger, report: any) {
  if (logger.config.adapter.shouldSendLambdaReport()) {
    console.log(`AXIOM_LAMBDA_REPORT::${JSON.stringify(report)}`);
  }
}

export function logEdgeReport(logger: Logger, report: RequestReport) {
  if (logger.config.adapter.shouldSendEdgeReport()) {
    console.log(`AXIOM_EDGE_REPORT::${JSON.stringify(report)}`);
  }
}

export declare type WebVitalsMetric = NextWebVitalsMetric & { route: string };

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
