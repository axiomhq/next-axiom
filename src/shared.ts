import { NextWebVitalsMetric } from 'next/app';

export const proxyPath = '/_axiom';
const isVercel = typeof process.env.NEXT_PUBLIC_VERCEL_ENV != undefined ? true : false;
console.log('DEBUG IS_VERCEL', isVercel);
export const isBrowser = typeof window !== 'undefined';
export const isNoPrettyPrint = process.env.AXIOM_NO_PRETTY_PRINT == 'true' ? true : false;

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
  injectLogMetadata(logEvent: any, source: string): void;
}

export class GenericConfig implements PlatformConfigurator {
  provider = 'self-hosted';
  shoudSendEdgeReport = false;
  private token = process.env.AXIOM_TOKEN;
  private url = process.env.AXOIOM_URL;
  private env = process.env.NODE_ENV;
  private dataset = process.env.AXIOM_DATASET;

  isEnvVarsSet() {
    return this.url != undefined && this.dataset != undefined && this.token != undefined;
  }

  getWebVitalsPath(): string {
    return '/logs';
  }

  getIngestURL(t: EndpointType) {
    return `${process.env.AXIOM_URL}/api/v1/datasets/${process.env.AXIOM_DATASET}/ingest`;
  }

  getLogsUrl() {
    return isBrowser ? `${proxyPath}/logs` : this.getAxiomURL();
  }

  getWebVitalsUrl(): string {
    return isBrowser ? `${proxyPath}/logs` : this.getAxiomURL();
  }

  getAxiomURL() {
    return this.url || '';
  }

  getEnvironment() {
    return this.env;
  }

  getRegion() {
    return undefined;
  }

  getAuthToken() {
    return this.token;
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

  injectLogMetadata(logEvent: any, source: string) {
    logEvent.platform = {
      environment: config.getEnvironment(),
      region: config.getRegion(),
      source: source,
      provider: config.provider,
    };
  }
}

export class VercelConfig implements PlatformConfigurator {
  constructor() {
    console.log('DEBUG: vercel configurator is being used');
  }

  provider = 'vercel';
  shoudSendEdgeReport = true;
  private url = process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT || process.env.AXIOM_INGEST_ENDPOINT || '';

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
    return this.url;
  }

  getLogsUrl() {
    return isBrowser ? `${proxyPath}/logs` : this.getIngestURL(EndpointType.logs);
  }

  getWebVitalsUrl(): string {
    return isBrowser ? `${proxyPath}/web-vitals` : this.getIngestURL(EndpointType.webVitals);
  }

  getEnvironment() {
    return process.env.VERCEL_ENV;
  }

  getRegion() {
    return process.env.VERCEL_REGION;
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

  injectLogMetadata(logEvent: any, source: string) {
    logEvent.vercel = {
      environment: config.getEnvironment(),
      region: config.getRegion(),
      source: source,
      provider: config.provider,
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

export const config = isVercel ? new VercelConfig() : new GenericConfig();
