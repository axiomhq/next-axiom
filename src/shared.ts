import { NextApiRequest } from 'next';
import { NextWebVitalsMetric } from 'next/app';
import { RequestReport } from './logger';

export const proxyPath = '/_axiom';
// these values are defined here so that it works with frontend, since they are resolved at run time
const isVercel = process.env.AXIOM_INGEST_ENDPOINT || process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT;
const isNetlify = process.env.NETLIFY == 'true';

export const isBrowser = typeof window !== 'undefined';
export const isNoPrettyPrint = process.env.AXIOM_NO_PRETTY_PRINT == 'true' ? true : false;
const token = process.env.AXIOM_TOKEN;
const axiomUrl = process.env.AXIOM_URL;
const vercelIngestEndpoint = process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT || process.env.AXIOM_INGEST_ENDPOINT;
const env = process.env.NODE_ENV;
// vercel env variables
const vercelEnv = process.env.VERCEL_ENV;
const vercelRegion = process.env.VERCEL_REGION;
const dataset = process.env.AXIOM_DATASET;
// netlify env variables
const netlifyBuildId = process.env.BUILD_ID;
const netlifyContext = process.env.CONTEXT;
const netlifyDeploymentUrl = process.env.DEPLOY_URL;
const netlifyDeploymentId = process.env.DEPLOY_ID;

export enum EndpointType {
  webVitals = 'web-vitals',
  logs = 'logs',
}

export interface PlatformConfigurator {
  provider: string;
  shoudSendEdgeReport: boolean;

  isEnvVarsSet(): boolean;
  getIngestURL(t: EndpointType): string;
  getAxiomURL(): string | undefined;
  getLogsUrl(): string;
  getWebVitalsUrl(): string;
  getEnvironment(): string | undefined;
  getRegion(): string | undefined;
  getAuthToken(): string | undefined;
  wrapWebVitalsObject(metrics: NextWebVitalsMetric[]): any;
  injectPlatformMetadata(logEvent: any, source: string): void;
  generateRequestMeta(req: any): RequestReport;
}

const getHeaderOrDefault = (req: NextApiRequest, headerName: string, defaultValue: any) =>
  req.headers[headerName] ? req.headers[headerName] : defaultValue;

export class GenericConfig implements PlatformConfigurator {
  provider = 'self-hosted';
  shoudSendEdgeReport = false;

  isEnvVarsSet() {
    return axiomUrl != undefined && dataset != undefined && token != undefined;
  }

  getWebVitalsPath(): string {
    return '/logs';
  }

  getIngestURL(_: EndpointType) {
    return `${process.env.AXIOM_URL}/api/v1/datasets/${process.env.AXIOM_DATASET}/ingest`;
  }

  getLogsUrl() {
    return isBrowser ? `${proxyPath}/logs` : this.getIngestURL(EndpointType.logs);
  }

  getWebVitalsUrl(): string {
    return isBrowser ? `${proxyPath}/logs` : this.getIngestURL(EndpointType.webVitals);
  }

  getAxiomURL() {
    return axiomUrl || '';
  }

  getEnvironment() {
    return env;
  }

  getRegion() {
    return undefined;
  }

  getAuthToken() {
    return token;
  }

  wrapWebVitalsObject(metrics: any[]) {
    return [
      {
        msg: 'reportWebVitals',
        webVitals: metrics,
        _time: new Date().getTime(),
        platform: {
          provider: this.provider,
          environment: this.getEnvironment(),
          source: 'reportWebVitals',
        },
      },
    ];
  }

  injectPlatformMetadata(logEvent: any, source: string) {
    logEvent.platform = {
      environment: config.getEnvironment(),
      region: config.getRegion(),
      source: source,
      provider: config.provider,
    };
  }

  generateRequestMeta(req: any): RequestReport {
    return {
      startTime: new Date().getTime(),
      path: req.url!,
      method: req.method!,
      host: getHeaderOrDefault(req, 'host', ''),
      userAgent: getHeaderOrDefault(req, 'user-agent', ''),
      scheme: 'https',
      ip: getHeaderOrDefault(req, 'x-forwarded-for', ''),
      region: this.getRegion(),
    };
  }
}

export class VercelConfig implements PlatformConfigurator {
  provider = 'vercel';
  shoudSendEdgeReport = true;

  isEnvVarsSet() {
    return process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT != undefined || process.env.AXIOM_INGEST_ENDPOINT != undefined;
  }

  getIngestURL(t: EndpointType) {
    const url = new URL(this.getAxiomURL());
    // attach type query param based on passed EndpointType
    url.searchParams.set('type', t.toString());
    return url.toString();
  }

  getAxiomURL() {
    return vercelIngestEndpoint || '';
  }

  getLogsUrl() {
    return isBrowser ? `${proxyPath}/logs` : this.getIngestURL(EndpointType.logs);
  }

  getWebVitalsUrl(): string {
    return isBrowser ? `${proxyPath}/web-vitals` : this.getIngestURL(EndpointType.webVitals);
  }

  getEnvironment() {
    return vercelEnv || env;
  }

  getRegion() {
    return vercelRegion;
  }

  getAuthToken() {
    return undefined;
  }

  wrapWebVitalsObject(metrics: any[]) {
    return {
      webVitals: metrics,
      environment: this.getEnvironment(),
    };
  }

  injectPlatformMetadata(logEvent: any, source: string) {
    logEvent.vercel = {
      environment: config.getEnvironment(),
      region: config.getRegion(),
      source: source,
      provider: config.provider,
    };
  }

  generateRequestMeta(req: any): RequestReport {
    return {
      startTime: new Date().getTime(),
      path: req.url!,
      method: req.method!,
      host: getHeaderOrDefault(req, 'host', ''),
      userAgent: getHeaderOrDefault(req, 'user-agent', ''),
      scheme: 'https',
      ip: getHeaderOrDefault(req, 'x-forwarded-for', ''),
      region: vercelRegion,
    };
  }
}

export class NetlifyConfig extends GenericConfig {
  provider = 'netlify';

  wrapWebVitalsObject(metrics: any[]) {
    return [
      {
        msg: 'reportWebVitals',
        webVitals: metrics,
        _time: new Date().getTime(),
        platform: {
          provider: this.provider,
          environment: this.getEnvironment(),
          source: 'reportWebVitals',
          buildId: netlifyBuildId,
          context: netlifyContext,
          deploymentUrl: netlifyDeploymentUrl,
          deploymentId: netlifyDeploymentId,
        },
      },
    ];
  }

  injectPlatformMetadata(logEvent: any, source: string) {
    logEvent.platform = {
      environment: config.getEnvironment(),
      region: config.getRegion(),
      source: source,
      provider: config.provider,
      buildId: netlifyBuildId,
      context: netlifyContext,
      deploymentUrl: netlifyDeploymentUrl,
      deploymentId: netlifyDeploymentId,
    };
  }
}

export const throttle = (fn: Function, wait: number) => {
  let lastFn: ReturnType<typeof setTimeout>, lastTime: number;
  return function (this: any) {
    const context = this,
      args = arguments;

    // First call, set lastTime
    if (lastTime == null) {
      lastTime = Date.now();
    }

    clearTimeout(lastFn);
    lastFn = setTimeout(() => {
      if (Date.now() - lastTime >= wait) {
        fn.apply(context, args);
        lastTime = Date.now();
      }
    }, Math.max(wait - (Date.now() - lastTime), 0));
  };
};

export const config = isVercel ? new VercelConfig() : isNetlify ? new NetlifyConfig() : new GenericConfig();
