import { Logger } from './axiom-kit/logging/logger';
import VercelAdapter from './axiom-kit/adapters/vercel-adapter';
import { isVercel } from './axiom-kit/platform';
import { LoggingSource } from './axiom-kit/logging/config';
import Adapter from './axiom-kit/adapters/adapter';
import { NextWebVitalsMetric } from 'next/app';

export declare type WebVitalsMetric = NextWebVitalsMetric & { route: string };

export default class NextLogger extends Logger {
  adapter: Adapter;

  constructor(source: LoggingSource = LoggingSource.browser) {
    if (isVercel) {
      const adapter = new VercelAdapter(source);
      super(adapter.getConfig());
      this.adapter = adapter;
    }
  }

  isEnvVarsSet(): boolean {
    return this.adapter.isEnvVarsSet();
  }

  logWebVital(metric: WebVitalsMetric) {
    this._log('info', 'web-vitals', { webVitals: [metric] });
  }

  logLambdaReport(report: any) {
    if (this.adapter.shouldSendLambdaReport()) {
      console.log(`AXIOM_LAMBDA_REPORT::${JSON.stringify(report)}`);
    }
  }

  logEdgeReport(report: RequestReport) {
    if (this.adapter.shouldSendEdgeReport()) {
      console.log(`AXIOM_EDGE_REPORT::${JSON.stringify(report)}`);
    }
  }
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
