import { EndpointType } from '../shared';
import type PlatformConfigurator from './base';
import GenericConfig from './generic';

const ingestEndpoint = process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT || process.env.AXIOM_INGEST_ENDPOINT || '';
console.log('ingestEndpoint', ingestEndpoint);
console.log('vercel env vars', process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT, process.env.AXIOM_INGEST_ENDPOINT);
console.log("ingestEndpoint != undefined && ingestEndpoint != ''", ingestEndpoint != undefined && ingestEndpoint != '');

export default class VercelConfig extends GenericConfig implements PlatformConfigurator {
  provider = 'vercel';
  shoudSendEdgeReport = true;
  region = process.env.VERCEL_REGION || undefined;
  environment = process.env.VERCEL_ENV || process.env.NODE_ENV;
  token = undefined;
  axiomUrl = ingestEndpoint;

  constructor () {
    super();
    
  }

  isEnvVarsSet () {
    return ingestEndpoint != undefined && ingestEndpoint != '';
  }

  getIngestURL(t: EndpointType) {
    const url = new URL(this.axiomUrl);
    url.searchParams.set('type', t.toString());
    return url.toString();
  }

  wrapWebVitalsObject(metrics: any[]) {
    return {
      webVitals: metrics,
      environment: this.environment,
    };
  }

  injectPlatformMetadata(logEvent: any, source: string) {
    logEvent.vercel = {
      environment: this.environment,
      region: this.region,
      source: source,
      provider: this.provider,
    };
  }
}
