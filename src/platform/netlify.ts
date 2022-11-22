import type Provider from './base';
import GenericConfig from './generic';

export default class NetlifyConfig extends GenericConfig implements Provider {
  provider = 'netlify';
  netlifyBuildId = process.env.BUILD_ID;
  netlifyContext = process.env.CONTEXT;
  netlifyDeploymentUrl = process.env.DEPLOY_URL;
  netlifyDeploymentId = process.env.DEPLOY_ID;

  wrapWebVitalsObject(metrics: any[]) {
    return [
      {
        msg: 'reportWebVitals',
        webVitals: metrics,
        _time: new Date().getTime(),
        platform: {
          provider: this.provider,
          environment: this.environment,
          source: 'reportWebVitals',
          buildId: this.netlifyBuildId,
          context: this.netlifyContext,
          deploymentUrl: this.netlifyDeploymentUrl,
          deploymentId: this.netlifyDeploymentId,
        },
      },
    ];
  }

  injectPlatformMetadata(logEvent: any, source: string) {
    logEvent.platform = {
      environment: this.environment,
      region: this.region,
      source: source,
      provider: this.provider,
      buildId: this.netlifyBuildId,
      context: this.netlifyContext,
      deploymentUrl: this.netlifyDeploymentUrl,
      deploymentId: this.netlifyDeploymentId,
    };
  }
}
