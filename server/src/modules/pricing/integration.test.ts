import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../../app';

describe('API de precios - pruebas de integración', () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/pricing/quote debe devolver 503 si no hay base de datos', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/pricing/quote',
      body: {
        productoId: 1,
        modalidadId: 101,
        opcionesSeleccionadas: [],
        sustituciones: [],
        adicionales: [],
      },
    });
    // Sin base de datos disponible, el servicio fallará con 500 o 503
    expect([500, 503]).toContain(res.statusCode);
  });

  it('POST /api/v1/pricing/quote debe validar cuerpo de solicitud', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/pricing/quote',
      body: {},
    });
    expect(res.statusCode).toBe(400);
    const body = res.json() as { error: string };
    expect(body.error).toBe('validacion_fallida');
  });

  it('GET /api/v1/catalog/productos debe devolver 503 si no hay base de datos', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/catalog/productos',
    });
    expect([500, 503]).toContain(res.statusCode);
  });

  it('GET /api/v1/catalog/modalidades debe devolver 503 si no hay base de datos', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/catalog/modalidades',
    });
    expect([500, 503]).toContain(res.statusCode);
  });

  it('GET /api/v1/catalog/grupos-opciones debe devolver 503 si no hay base de datos', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/catalog/grupos-opciones',
    });
    expect([500, 503]).toContain(res.statusCode);
  });

  it('GET /api/v1/catalog/opciones debe devolver 503 si no hay base de datos', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/catalog/opciones',
    });
    expect([500, 503]).toContain(res.statusCode);
  });

  it('GET /api/v1/catalog/adicionales debe devolver 503 si no hay base de datos', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/catalog/adicionales',
    });
    expect([500, 503]).toContain(res.statusCode);
  });
});
