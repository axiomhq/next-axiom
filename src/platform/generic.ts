import { GetServerSidePropsContext, NextApiRequest } from 'next';
import { LogEvent } from '../logger';
import { EndpointType } from '../shared';
import type Provider from './base';
import { isBrowser, isVercel } from '../config';

// This is the generic config class for all platforms that doesn't have a special
// implementation (e.g: vercel, netlify). All config classes extends this one.
export default class GenericConfig implements Provider {
  proxyPath = '/_axiom';
  shouldSendEdgeReport = false;
  token = process.env.NEXT_PUBLIC_AXIOM_TOKEN || process.env.AXIOM_TOKEN;
  dataset = process.env.NEXT_PUBLIC_AXIOM_DATASET || process.env.AXIOM_DATASET;
  environment: string = process.env.NODE_ENV;
  axiomUrl = process.env.NEXT_PUBLIC_AXIOM_URL || process.env.AXIOM_URL || 'https://api.axiom.co';
  region = process.env.REGION || undefined;

  isEnvVarsSet(): boolean {
    if (isBrowser) {
      return !!(this.axiomUrl && this.dataset);
    }

    return !!(this.axiomUrl && this.dataset && this.token);
  }

  getIngestURL(_: EndpointType): string {
    return `${this.axiomUrl}/v1/datasets/${this.dataset}/ingest`;
  }

  getLogsEndpoint(): string {
    return isBrowser ? `${this.proxyPath}/logs` : this.getIngestURL(EndpointType.logs);
  }

  getWebVitalsEndpoint(): string {
    return isBrowser ? `${this.proxyPath}/web-vitals` : this.getIngestURL(EndpointType.webVitals);
  }

  wrapWebVitalsObject(metrics: any[]): any {
    return metrics.map((m) => ({
      webVital: m,
      _time: new Date().getTime(),
      platform: {
        environment: this.environment,
        source: 'web-vital',
      },
      source: 'web-vital',
    }));
  }

  injectPlatformMetadata(logEvent: LogEvent, source: string) {
    let key: 'platform' | 'vercel' | 'netlify' = 'platform';
    if (isVercel) {
      key = 'vercel';
    }

    logEvent.source = source;
    logEvent[key] = {
      environment: this.environment,
      region: this.region,
      source: source,
    };

    if (isVercel) {
      logEvent[key]!.region = process.env.VERCEL_REGION;
      logEvent[key]!.deploymentId = process.env.VERCEL_DEPLOYMENT_ID;
      logEvent[key]!.deploymentUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
      logEvent[key]!.project = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
      logEvent.git = {
        commit: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
        repo: process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG,
        ref: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
      };
    }
  }

  getHeaderOrDefault(req: NextApiRequest | GetServerSidePropsContext['req'], headerName: string, defaultValue: any) {
    return req.headers[headerName] ? req.headers[headerName] : defaultValue;
  }
}
