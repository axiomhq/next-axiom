import { vi } from 'vitest';

export const mockFetchResponse = (body: any, statusCode: number = 200, headers = {}) => {
  const resp = new Response(JSON.stringify(body), { status: statusCode, headers });
  const func: () => Promise<Response> = () => {
    return Promise.resolve(resp);
  };

  vi.spyOn(global, 'fetch').mockImplementationOnce(func);
};
