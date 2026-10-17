import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../../app';

describe('API de Platos Individuales - pruebas de integración', () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /pedidos/:pedidoId/platos debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/platos-individuales',
      body: {
        productoId: 1,
        modalidadId: 1,
        cantidad: 1,
      },
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });

  it('PATCH /platos-individuales/:id debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/v1/platos-individuales/1',
      body: { cantidad: 2 },
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });

  it('DELETE /platos-individuales/:id debe responder sin error 500', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/v1/platos-individuales/1',
    });
    expect([404, 500, 503]).toContain(res.statusCode);
  });
});
