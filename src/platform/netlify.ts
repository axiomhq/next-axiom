import { LogEvent, PlatformInfo } from '../logger';
import type Provider from './base';
import GenericConfig from './generic';

const netlifySiteId = process.env.SITE_ID;
const netlifyBuildId = process.env.BUILD_ID;
const netlifyContext = process.env.CONTEXT;
const netlifyDeploymentUrl = process.env.DEPLOY_URL;
const netlifyDeploymentId = process.env.DEPLOY_ID;

console.log(process.env)
console.log('site_id', process.env.SITE_ID)
console.log('deploy_url', process.env.DEPLOY_URL)
console.log('deploy_id', process.env.DEPLOY_ID)

export interface NetlifyInfo extends PlatformInfo {
  buildId?: string;
  context?: string;
  deploymentUrl?: string;
  deploymentId?: string;
  siteId?: string;
}

export default class NetlifyConfig extends GenericConfig implements Provider {
  

  wrapWebVitalsObject(metrics: any[]): any {
    return metrics.map(m => ({
      webVital: m,
        _time: new Date().getTime(),
        netlify: {
          environment: this.environment,
          source: 'web-vital',
          siteId: netlifySiteId,
          buildId: netlifyBuildId,
          context: netlifyContext,
          deploymentUrl: netlifyDeploymentUrl,
          deploymentId: netlifyDeploymentId,
        },
    }))
  }

  injectPlatformMetadata(logEvent: LogEvent, source: string) {
    logEvent.netlify = {
      environment: this.environment,
      region: process.env.DENO_REGION,
      source: source + '-log',
      siteId: netlifySiteId,
      buildId: netlifyBuildId,
      context: netlifyContext,
      deploymentUrl: netlifyDeploymentUrl,
      deploymentId: source === 'edge' ? process.env.DENO_DEPLOYMENT_ID : netlifyDeploymentId,
    };
  }
}
