import ConsoleTransport from '../transports/console.transport';
import FetchTransport from '../transports/fetch.transport';
import { LogEvent } from '../logging/logger';
import { isBrowser } from '../platform';
import Adapter from './adapter';
import { LoggingSource } from '../logging/config';
import Transport from '../logging/transport';

const axiomUrl = process.env.AXIOM_URL || 'https://api.axiom.co';
const dataset = process.env.AXIOM_DATASET;
const token = process.env.AXIOM_TOKEN;
const region = process.env.REGION || undefined;
const environment: string = process.env.NODE_ENV;

const ingestEndpoint = `${axiomUrl}/v1/ingest/${dataset}`;
export const enableLogDrain = process.env.ENABLE_AXIOM_LOG_DRAIN == 'true' ? true : false;
const netlifySiteId = process.env.SITE_ID;
const netlifyBuildId = process.env.BUILD_ID;
const netlifyContext = process.env.CONTEXT;
const netlifyDeploymentUrl = process.env.DEPLOYMENT_URL;
const netlifyDeploymentId = process.env.DEPLOYMENT_ID;

export default class NetlifyAdapter implements Adapter {
  proxyPath = '/_axiom';
  constructor(public source: LoggingSource) {}

  isEnvVarsSet(): boolean {
    return !!(dataset && token);
  }

  getIngestEndpoint() {
    if (isBrowser) {
      return `/${this.proxyPath}/logs`;
    }

    return ingestEndpoint;
  }

  getBrowserRewrites() {
    return [
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
    event.netlify = {
      environment: environment,
      region: this.source === LoggingSource.edge ? process.env.DENO_REGION : process.env.AWS_REGION,
      source: this.source + '-log',
      siteId: netlifySiteId,
      buildId: netlifyBuildId,
      context: netlifyContext,
      deploymentUrl: netlifyDeploymentUrl,
      deploymentId: this.source === LoggingSource.edge ? process.env.DENO_DEPLOYMENT_ID : netlifyDeploymentId,
    };

    return event
  }

  transformEvent(event: LogEvent): LogEvent {
    return event;
  }

  wrapWebVitalsObject(metrics: any[]) {
    return metrics.map(m => ({
      webVital: m,
        _time: new Date().getTime(),
        netlify: {
          environment: environment,
          source: 'browser',
          siteId: netlifySiteId,
          buildId: netlifyBuildId,
          context: netlifyContext,
          deploymentUrl: netlifyDeploymentUrl,
          deploymentId: netlifyDeploymentId,
        },
    }))
  }

  shouldSendEdgeReport = () => true;
  shouldSendLambdaReport = () => true;
}

export interface NetlifyInfo {
  buildId?: string;
  context?: string;
  deploymentUrl?: string;
  deploymentId?: string;
  siteId?: string;
}