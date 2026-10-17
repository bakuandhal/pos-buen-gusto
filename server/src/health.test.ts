import { describe, it, expect } from 'vitest';
import { fastify } from './index';

describe('GET /health', () => {
  it('responde con status ok', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/health',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { status: string; service: string };
    expect(body.status).toBe('ok');
    expect(body.service).toBe('pos-buen-gusto-api');
  });
});
