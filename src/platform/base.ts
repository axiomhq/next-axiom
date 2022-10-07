import { NextWebVitalsMetric } from 'next/app';
import { RequestReport } from '../logger';
import { EndpointType } from '../shared';

export default interface PlatformConfigurator {
  provider: string;
  isEnvVarsSet: boolean;
  shoudSendEdgeReport: boolean;
  token: string | undefined;
  environment: string;
  region: string | undefined;
  axiomUrl: string | undefined;

  getIngestURL(t: EndpointType): string;
  wrapWebVitalsObject(metrics: NextWebVitalsMetric[]): any;
  injectPlatformMetadata(logEvent: any, source: string): void;
  generateRequestMeta(req: any): RequestReport;
  getLogsEndpoint(): string
  getWebVitalsEndpoint(): string
}
