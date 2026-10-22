import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { TestEnv } from '../../tests/testEnv';

describe('API de Mesas - pruebas de integración', () => {
  let env: TestEnv;
  let tokenAdmin: string;
  let tokenMesero: string;

  beforeAll(async () => {
    env = await TestEnv.create();
    tokenAdmin = await env.tokenAdmin();
    tokenMesero = await env.tokenMesero();
  });

  afterAll(async () => {
    await env.close();
  });

  beforeEach(async () => {
    await env.limpiar();
  });

  // ── 1. Consulta del listado de mesas ──
  it('1. GET /mesas devuelve el listado de mesas con su estado', async () => {
    const res = await env.app.inject({
      method: 'GET',
      url: '/api/v1/mesas',
    });

    expect(res.statusCode).toBe(200);
    const mesas = res.json() as any[];
    expect(Array.isArray(mesas)).toBe(true);
    expect(mesas.length).toBeGreaterThan(0);

    const mesa = mesas.find((m) => m.numero === 1);
    expect(mesa).toBeDefined();
    expect(mesa.estado).toBe('disponible');
    expect(mesa.comensales).toBe(0);
  });

  // ── 2. Creación de mesa por administrador ──
  it('2. POST /mesas crea una mesa y la persiste', async () => {
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/mesas',
      headers: { authorization: `Bearer ${tokenAdmin}` },
      body: { numero: 99 },
    });

    expect(res.statusCode).toBe(201);
    const creada = res.json() as any;
    expect(creada.id).toBeGreaterThan(0);
    expect(creada.numero).toBe(99);
    expect(creada.estado).toBe('disponible');

    // Verificar persistencia real consultando de nuevo.
    const listado = await env.app.inject({
      method: 'GET',
      url: '/api/v1/mesas',
    });
    const mesas = listado.json() as any[];
    expect(mesas.some((m) => m.id === creada.id)).toBe(true);
  });

  // ── 3. Validación de entrada ──
  it('3. POST /mesas rechaza un número de mesa inválido con 400', async () => {
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/mesas',
      headers: { authorization: `Bearer ${tokenAdmin}` },
      body: { numero: -5 },
    });

    expect(res.statusCode).toBe(400);
    const body = res.json() as any;
    expect(body.error).toBe('validacion_fallida');
  });

  it('3b. POST /mesas rechaza un número duplicado con 409', async () => {
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/mesas',
      headers: { authorization: `Bearer ${tokenAdmin}` },
      body: { numero: 1 },
    });

    expect(res.statusCode).toBe(409);
    expect((res.json() as any).error).toBe('mesa_duplicada');
  });

  // ── 4. Obtención de mesa por identificador ──
  it('4. GET /mesas/:id devuelve la mesa solicitada', async () => {
    const id = await env.idMesa();

    const res = await env.app.inject({
      method: 'GET',
      url: `/api/v1/mesas/${id}`,
    });

    expect(res.statusCode).toBe(200);
    const mesa = res.json() as any;
    expect(mesa.id).toBe(id);
    expect(mesa.numero).toBe(1);
  });

  // ── 5. Mesa inexistente ──
  it('5. GET /mesas/:id devuelve 404 si la mesa no existe', async () => {
    const res = await env.app.inject({
      method: 'GET',
      url: '/api/v1/mesas/999999',
    });

    expect(res.statusCode).toBe(404);
    const body = res.json() as any;
    expect(body.error).toBe('mesa_no_encontrada');
  });

  // ── 6. Permisos insuficientes ──
  it('6. POST /mesas devuelve 403 sin permiso de administración de precios', async () => {
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/mesas',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { numero: 98 },
    });

    expect(res.statusCode).toBe(403);
    const body = res.json() as any;
    expect(body.error).toBe('sin_permisos');
  });

  // ── 7. Sin autenticación ──
  it('7. POST /mesas devuelve 401 sin token de acceso', async () => {
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/mesas',
      body: { numero: 97 },
    });

    expect(res.statusCode).toBe(401);
  });

  // ── 8. Cambio de estado por mesero ──
  it('8. PATCH /mesas/:id/estado actualiza el estado y lo persiste', async () => {
    const id = await env.idMesa();

    const res = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/mesas/${id}/estado`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'ocupada' },
    });

    expect(res.statusCode).toBe(200);
    expect((res.json() as any).estado).toBe('ocupada');

    // Verificar persistencia.
    const consulta = await env.app.inject({
      method: 'GET',
      url: `/api/v1/mesas/${id}`,
    });
    expect((consulta.json() as any).estado).toBe('ocupada');
  });

  // ── 9. Estado inválido ──
  it('9. PATCH /mesas/:id/estado rechaza un estado no permitido con 400', async () => {
    const id = await env.idMesa();

    const res = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/mesas/${id}/estado`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'estado_inexistente' },
    });

    expect(res.statusCode).toBe(400);
  });

  // ── 10. Actualización de comensales ──
  it('10. PATCH /mesas/:id actualiza los comensales', async () => {
    const id = await env.idMesa();

    const res = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/mesas/${id}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'ocupada', comensales: 4 },
    });

    expect(res.statusCode).toBe(200);
    const mesa = res.json() as any;
    expect(mesa.comensales).toBe(4);
  });

  // ── 11. Desactivar una mesa libre ──
  it('11. DELETE /mesas/:id libera una mesa sin pedidos abiertos', async () => {
    const id = await env.idMesa();

    const res = await env.app.inject({
      method: 'DELETE',
      url: `/api/v1/mesas/${id}`,
      headers: { authorization: `Bearer ${tokenAdmin}` },
    });

    expect(res.statusCode, res.body).toBe(200);
    expect((res.json() as any).mesa.estado).toBe('disponible');
  });

  // ── 12. No desactivar una mesa con pedido abierto ──
  it('12. DELETE /mesas/:id rechaza una mesa con pedido abierto con 409', async () => {
    const id = await env.idMesa();
    const pedido = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pedidos',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { mesaId: id, tipoServicio: 'mesa' },
    });
    expect(pedido.statusCode, pedido.body).toBe(201);

    const res = await env.app.inject({
      method: 'DELETE',
      url: `/api/v1/mesas/${id}`,
      headers: { authorization: `Bearer ${tokenAdmin}` },
    });

    expect(res.statusCode).toBe(409);
    expect((res.json() as any).error).toBe('mesa_con_pedido_abierto');
  });
});
