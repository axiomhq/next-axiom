export interface PlatformManager {
  provider: string;
  shoudSendEdgeReport: boolean;

  isEnvVarsSet(): boolean;
  getURL(): string | undefined;
  getEnvironment(): string | undefined;
  getRegion(): string | undefined;
  getAuthToken(): string | undefined;
}

export class Generic implements PlatformManager {
  provider = 'self-hosted';
  shoudSendEdgeReport = false;
  private token = process.env.AXIOM_TOKEN;
  private url = process.env.AXOIOM_URL;
  private env = process.env.NODE_ENV;
  private dataset = process.env.AXIOM_DATASET;

  isEnvVarsSet() {
    return this.url != undefined && this.dataset != undefined && this.token != undefined;
  }

  getURL() {
    return this.url;
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
}

export class Vercel implements PlatformManager {
  provider = 'vercel';
  shoudSendEdgeReport = true;

  isEnvVarsSet() {
    return process.env.AXIOM_INGEST_ENDPOINT != undefined || process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT != undefined;
  }

  getURL() {
    return process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT || process.env.AXIOM_INGEST_ENDPOINT;
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
}
