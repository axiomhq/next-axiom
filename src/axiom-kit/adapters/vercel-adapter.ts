import ConsoleTransport from '../transports/console.transport';
import FetchTransport from '../transports/fetch.transport';
import { LogEvent } from '../logging/logger';
import { isBrowser } from '../platform';
import Adapter from './adapter';
import { LoggingSource } from '../logging/config';
import Transport from '../logging/transport';

const ingestEndpoint = process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT || process.env.AXIOM_INGEST_ENDPOINT || '';
export const enableLogDrain = process.env.ENABLE_AXIOM_LOG_DRAIN == 'true' ? true : false;
const region = process.env.VERCEL_REGION || undefined;
const environment = process.env.VERCEL_ENV || process.env.NODE_ENV;

export default class VercelAdapter implements Adapter {
  proxyPath = '/_axiom';
  constructor(public source: LoggingSource, public isWebVitals = false) {}

  isEnvVarsSet(): boolean {
    return ingestEndpoint != undefined && ingestEndpoint != '';
  }

  getIngestEndpoint() {
    if (isBrowser && this.isWebVitals) {
        return `/${this.proxyPath}/web-vitals`
    } else if (isBrowser) {
      return `/${this.proxyPath}/logs`;
    }

    return ingestEndpoint;
  }

  getBrowserRewrites() {
    return [
      {
        source: `${this.proxyPath}/web-vitals`,
        // todo: fix this for web-vitals endpoint
        destination: ingestEndpoint,
        basePath: false,
      },
      {
        source: `${this.proxyPath}/logs`,
        destination: ingestEndpoint,
        basePath: false,
      },
    ];
  }

  getConfig() {
    let transport: Transport = new ConsoleTransport();
    if (this.isEnvVarsSet()) {
      transport = new FetchTransport(this.getIngestEndpoint());
    } else if (enableLogDrain) {
      transport = new ConsoleTransport();
    }

    return {
      transport,
      source: this.source,
      args: {},
    };
  }

  injectMeta(event: LogEvent, req: any): LogEvent {
    event.vercel = {
      environment: environment,
      region: region,
      source: this.source,
    };

    return event;
  }

  transformEvent(event: LogEvent): LogEvent {
    return event;
  }

  wrapWebVitalsObject(metrics: any[]) {
    return {
      webVitals: metrics,
      environment: environment,
    };
  }

  // edge reports are not automatically sent by vercel
  shouldSendEdgeReport = () => true;
  // lambda report is automatically sent by vercel
  shouldSendLambdaReport = () => false;
}
