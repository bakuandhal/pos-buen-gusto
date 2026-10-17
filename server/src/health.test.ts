import { describe, it, expect } from 'vitest';
import { createApp } from './app';

describe('GET /health', () => {
  it('debe responder con status ok', async () => {
    const app = await createApp();
    await app.ready();
    try {
      const res = await app.inject({
        method: 'GET',
        url: '/health',
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { status: string; service: string };
      expect(body.status).toBe('ok');
      expect(body.service).toBe('pos-buen-gusto-api');
    } finally {
      await app.close();
    }
  });
});
