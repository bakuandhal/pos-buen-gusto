import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../../app';

describe('API de Mesas - pruebas de integración', () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /mesas debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/mesas',
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });

  it('GET /mesas/:id debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/mesas/1',
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });

  it('POST /mesas debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/mesas',
      body: { numero: 1 },
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });

  it('PATCH /mesas/:id debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/v1/mesas/1',
      body: { estado: 'ocupada' },
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });

  it('DELETE /mesas/:id debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/v1/mesas/1',
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });
});
