export const proxyPath = '/_axiom';
const TOKEN = process.env.AXIOM_TOKEN;

function detectEnvironmentConfiguration() {
  const isVercel = process.env.NEXT_PUBLIC_VERCEL_ENV ? true : false;
  const nodeEnv = process.env.NODE_ENV;

  const baseConfig = {
    isBrowser: typeof window !== 'undefined',
    // isEnvVarsSet: process.env.AXIOM_INGEST_ENDPOINT || process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT,
    isEnvVarsSet: true,
    isNoPrettyPrint: process.env.AXIOM_NO_PRETTY_PRINT == 'true' ? true : false,
    isVercel,
    token: TOKEN,
  };

  if (isVercel) {
    return {
      ...baseConfig,
      region: process.env.VERCEL_REGION || process.env.NEXT_PUBLIC_VERCEL_REGION,
      environment: process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV,
      dataset: 'vercel',
      provider: 'vercel',
    };
  }

  return {
    ...baseConfig,
    region: '',
    environment: nodeEnv || 'dev',
    provider: 'self-hosted',
  };
}

export const config = detectEnvironmentConfiguration();

export enum EndpointType {
  webVitals = 'web-vitals',
  logs = 'logs',
}

export const getIngestURL = function (t: EndpointType) {
  const vercelEndpoint = process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT || process.env.AXIOM_INGEST_ENDPOINT;
  if (vercelEndpoint) {
    const url = new URL(vercelEndpoint);
    // attach type query param based on passed EndpointType
    url.searchParams.set('type', t.toString());
    return url.toString();
  }

  const ingestEndpoint = `${process.env.AXIOM_URL}/api/v1/datasets/${process.env.AXIOM_DATASET}/ingest`;
  if (!ingestEndpoint) {
    return '';
  }

  const url = new URL(ingestEndpoint);
  return url.toString();
};

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
