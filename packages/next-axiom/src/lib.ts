import { NextRequest } from 'next/server';

function getHeaderOrDefault(req: NextRequest, headerName: string, defaultValue: any) {
  return req.headers[headerName] ? req.headers[headerName] : defaultValue;
}

export const generateRequestMeta = (req: NextRequest) => {
  return {
    startTime: new Date().getTime(),
    path: req.url!,
    method: req.method!,
    host: getHeaderOrDefault(req, 'host', ''),
    userAgent: getHeaderOrDefault(req, 'user-agent', ''),
    scheme: 'https',
    ip: getHeaderOrDefault(req, 'x-forwarded-for', ''),
    region: '', // TODO: get region from nextjs request object ?,
  };
};
