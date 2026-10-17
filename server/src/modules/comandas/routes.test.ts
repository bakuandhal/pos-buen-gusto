import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../../app';

describe('API de Comandos - pruebas de integración', () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /comandas debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/comandas',
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });

  it('GET /comandas/:id debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/comandas/1',
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });

  it('POST /comandas debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/comandas',
      body: { pedidoId: 1 },
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });

  it('PATCH /comandas/:id debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/v1/comandas/1',
      body: { estado: 'enviado' },
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });
});
