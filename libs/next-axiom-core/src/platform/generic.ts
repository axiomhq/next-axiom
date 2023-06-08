import { LogEvent, RequestReport } from "../logger";
import { EndpointType } from "../shared";
import type Provider from "./base";

// This is the generic config class for all platforms that doesn't have a special
// implementation (e.g: vercel, netlify). All config classes extends this one.
export default class GenericConfig implements Provider {
  proxyPath = '/_axiom';
  isBrowser = typeof window !== 'undefined';
  shouldSendEdgeReport = false;
  token = process.env.AXIOM_TOKEN;
  dataset = process.env.AXIOM_DATASET;
  environment: string = process.env.NODE_ENV || '';
  axiomUrl = process.env.AXIOM_URL || 'https://cloud.axiom.co';
  region = process.env.REGION || undefined;

  isEnvVarsSet(): boolean {
    return !!(this.axiomUrl && process.env.AXIOM_DATASET && process.env.AXIOM_TOKEN);
  }

  getIngestURL(_: EndpointType): string {
    return `${this.axiomUrl}/v1/datasets/${this.dataset}/ingest`;
  }

  getLogsEndpoint(): string {
    return this.isBrowser ? `${this.proxyPath}/logs` : this.getIngestURL(EndpointType.logs);
  }

  getWebVitalsEndpoint(): string {
    return this.isBrowser ? `${this.proxyPath}/logs` : this.getIngestURL(EndpointType.webVitals);
  }

  wrapWebVitalsObject(metrics: any[]): any {
    return metrics.map(m => ({
        webVital: m,
        _time: new Date().getTime(),
        platform: {
          environment: this.environment,
          source: 'web-vital',
        },
    }))
  }

  injectPlatformMetadata(logEvent: LogEvent, source: string) {
    logEvent.platform = {
      environment: this.environment,
      region: this.region,
      source: source + '-log',
    };
  }

  generateRequestMeta(req: any | any['req']): RequestReport {
    return {
      startTime: new Date().getTime(),
      path: req.url!,
      method: req.method!,
      host: this.getHeaderOrDefault(req, 'host', ''),
      userAgent: this.getHeaderOrDefault(req, 'user-agent', ''),
      scheme: 'https',
      ip: this.getHeaderOrDefault(req, 'x-forwarded-for', ''),
      region: this.region,
    };
  }

  getHeaderOrDefault(req: any | any['req'], headerName: string, defaultValue: any) {
    return req.headers[headerName] ? req.headers[headerName] : defaultValue;
  }
}
