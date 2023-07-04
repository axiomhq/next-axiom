import { RequestReport } from '../logger';
import { EndpointType } from '../shared';

// This is the base class for all platform providers. It contains all the different
// configurations per provider, and the functions that are used by the logger. Implement
// this interface to have special behavior for your platform.
export default interface Provider {
  shouldSendEdgeReport: boolean;
  token: string | undefined;
  environment: string;
  region: string | undefined;
  axiomUrl: string | undefined;

  isEnvVarsSet(): boolean;
  getIngestURL(t: EndpointType): string;
  wrapWebVitalsObject(metrics: any[]): any;
  injectPlatformMetadata(logEvent: any, source: string): void;
  generateRequestMeta(req: any): RequestReport;
  getLogsEndpoint(): string
  getWebVitalsEndpoint(): string
}
