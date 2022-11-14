import { NextWebVitalsMetric } from 'next/app';
import { RequestReport } from '../logger';
import { EndpointType } from '../shared';

export default interface PlatformConfigurator {
  provider: string;
  shoudSendEdgeReport: boolean;
  token: string | undefined;
  environment: string;
  region: string | undefined;
  axiomUrl: string | undefined;

  isEnvVarsSet(): boolean;
  getIngestURL(t: EndpointType): string;
  wrapWebVitalsObject(metrics: NextWebVitalsMetric[]): any;
  injectPlatformMetadata(logEvent: any, source: string): void;
  generateRequestMeta(req: any): RequestReport;
  getLogsEndpoint(): string
  getWebVitalsEndpoint(): string
}
