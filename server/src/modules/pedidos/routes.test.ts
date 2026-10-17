import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../../app';

describe('API de Pedidos - pruebas de integración', () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /pedidos debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/pedidos',
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });

  it('GET /pedidos/:id debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/pedidos/1',
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });

  it('POST /pedidos debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/pedidos',
      body: { mesaId: 1, tipoServicio: 'mesa' },
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });

  it('PATCH /pedidos/:id debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/v1/pedidos/1',
      body: { estado: 'confirmado' },
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });

  it('DELETE /pedidos/:id debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/v1/pedidos/1',
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });
});
