import { LogEvent, PlatformInfo } from '../logger';
import type Provider from './base';
import GenericConfig from './generic';

export interface NetlifyInfo extends PlatformInfo {
  buildId?: string;
  context?: string;
  deploymentUrl?: string;
  deploymentId?: string;
}

export default class NetlifyConfig extends GenericConfig implements Provider {
  netlifyBuildId = process.env.BUILD_ID;
  netlifyContext = process.env.CONTEXT;
  netlifyDeploymentUrl = process.env.DEPLOY_URL;
  netlifyDeploymentId = process.env.DEPLOY_ID;

  wrapWebVitalsObject(metrics: any[]): any {
    return metrics.map(m => ({
      webVital: m,
        _time: new Date().getTime(),
        netlify: {
          environment: this.environment,
          source: 'web-vital',
          buildId: this.netlifyBuildId,
          context: this.netlifyContext,
          deploymentUrl: this.netlifyDeploymentUrl,
          deploymentId: this.netlifyDeploymentId,
        },
    }))
  }

  injectPlatformMetadata(logEvent: LogEvent, source: string) {
    logEvent.netlify = {
      environment: this.environment,
      region: this.region,
      source: source,
      buildId: this.netlifyBuildId,
      context: this.netlifyContext,
      deploymentUrl: this.netlifyDeploymentUrl,
      deploymentId: this.netlifyDeploymentId,
    };
  }
}
