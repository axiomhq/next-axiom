import { GetServerSidePropsContext, NextApiRequest } from 'next';
import { LogEvent, RequestReport } from '../logger';
import { EndpointType } from '../shared';
import type Provider from './base';

const token = process.env.NEXT_PUBLIC_AXIOM_TOKEN;
const dataset = process.env.NEXT_PUBLIC_AXIOM_DATASET;
const axiomUrl = process.env.NEXT_PUBLIC_AXIOM_URL || 'https://cloud.axiom.co';
const environment: string = process.env.NODE_ENV;

// This is the generic config class for all platforms that doesn't have a special
// implementation (e.g: vercel, netlify). All config classes extends this one.
export default class GenericConfig implements Provider {
  proxyPath = '/_axiom';
  isBrowser = typeof window !== 'undefined';
  shouldSendEdgeReport = false;
  token = token;
  environment = environment;
  region = process.env.REGION || undefined;
  axiomUrl = axiomUrl;

  isEnvVarsSet(): boolean {
    return !!(this.axiomUrl && dataset && token);
  }

  getIngestURL(_: EndpointType): string {
    return `${this.axiomUrl}/v1/datasets/${dataset}/ingest`;
  }

  getLogsEndpoint(): string {
    return this.isBrowser ? `${this.proxyPath}/logs` : this.getIngestURL(EndpointType.logs);
  }

  getWebVitalsEndpoint(): string {
    return this.isBrowser ? `${this.proxyPath}/logs` : this.getIngestURL(EndpointType.webVitals);
  }

  wrapWebVitalsObject(metrics: any[]): any {
    return metrics.map((m) => ({
      webVital: m,
      _time: new Date().getTime(),
      platform: {
        environment: environment,
        source: 'web-vital',
      },
    }));
  }

  injectPlatformMetadata(logEvent: LogEvent, source: string) {
    logEvent.platform = {
      environment: environment,
      region: this.region,
      source: source + '-log',
    };
  }

  generateRequestMeta(req: NextApiRequest | GetServerSidePropsContext['req']): RequestReport {
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

  getHeaderOrDefault(req: NextApiRequest | GetServerSidePropsContext['req'], headerName: string, defaultValue: any) {
    return req.headers[headerName] ? req.headers[headerName] : defaultValue;
  }
}
