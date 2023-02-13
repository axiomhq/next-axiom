export const isBrowser = typeof window !== 'undefined';
export const isVercel = process.env.AXIOM_INGEST_ENDPOINT || process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT;
export const isNetlify = process.env.NETLIFY == 'true';
