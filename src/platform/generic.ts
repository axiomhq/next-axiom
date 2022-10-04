import { NextApiRequest } from "next";
import { RequestReport } from "../logger";
import { EndpointType } from "../shared";
import type PlatformConfigurator from "./base";

export default class GenericConfig implements PlatformConfigurator {
  provider = '-';
  proxyPath = '/_axiom';
  isBrowser = typeof window !== 'undefined';
  shoudSendEdgeReport = false;
  token = process.env.AXIOM_TOKEN;
  dataset = process.env.AXIOM_DATASET;
  environment: string = process.env.NODE_ENV;
  axiomUrl = process.env.AXIOM_URL;
  logsUrl = this.isBrowser ? `${this.proxyPath}/logs` : this.getIngestURL(EndpointType.logs);
  webVitalsUrl = this.isBrowser ? `${this.proxyPath}/logs` : this.getIngestURL(EndpointType.webVitals);
  region = process.env.REGION || undefined;
  isEnvVarsSet = this.axiomUrl != undefined && this.dataset != undefined && this.token != undefined;

  constructor () {
    // debug
    console.log('ingest url', this.getIngestURL(EndpointType.logs));
    console.log('axiom host', this.axiomUrl)
    console.log('token', this.token)
  }

  getIngestURL(_: EndpointType) {
    return `${this.axiomUrl}/api/v1/datasets/${this.dataset}/ingest`;
  }

  wrapWebVitalsObject(metrics: any[]): any {
    return [
      {
        msg: 'reportWebVitals',
        webVitals: metrics,
        _time: new Date().getTime(),
        platform: {
          provider: this.provider,
          environment: this.environment,
          source: 'reportWebVitals',
        },
      },
    ];
  }

  injectPlatformMetadata(logEvent: any, source: string) {
    logEvent.platform = {
      environment: this.environment,
      region: this.environment,
      source: source,
      provider: this.provider,
    };
  }

  generateRequestMeta(req: any): RequestReport {
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

  getHeaderOrDefault(req: NextApiRequest, headerName: string, defaultValue: any) {
    return req.headers[headerName] ? req.headers[headerName] : defaultValue;
  }
}
