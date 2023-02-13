import { LoggerConfig } from '../logging/config';
import { LogEvent } from '../logging/logger';

// This is the base class for all platform providers. It contains all the different
// configrations per provider, and the functions that are used by the logger. Implement
// this interface to have special behaviour for your platform.
export default interface Adapter {
  isEnvVarsSet(): boolean;
  getConfig(): LoggerConfig;
  getBrowserRewrites(): any[];
//   getIngestURL(): string;
  injectMeta(event: LogEvent, req: any): LogEvent;
  transformEvent(event: LogEvent): LogEvent;
//   wrapWebVitalsObject(metrics: NextWebVitalsMetric[]): any;


  shouldSendEdgeReport(): boolean
  shouldSendLambdaReport(): boolean
}
