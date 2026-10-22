import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { TestEnv } from '../../tests/testEnv';

describe('API de Comandas - pruebas de integración', () => {
  let env: TestEnv;
  let tokenMesero: string;
  let tokenCaja: string;

  beforeAll(async () => {
    env = await TestEnv.create();
    tokenMesero = await env.tokenMesero();
    tokenCaja = await env.tokenCaja();
  });

  afterAll(async () => {
    await env.close();
  });

  beforeEach(async () => {
    await env.limpiar();
  });

  async function crearPedidoDeMesa(): Promise<number> {
    const mesaId = await env.idMesa();
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pedidos',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { mesaId, tipoServicio: 'mesa' },
    });
    expect(res.statusCode, res.body).toBe(201);
    return (res.json() as any).id;
  }

  async function agregarPlato(pedidoId: number, cantidad = 1, extra: Record<string, unknown> = {}) {
    const productoId = await env.idProducto();
    const modalidadId = await env.idModalidadEnMesa();
    const res = await env.app.inject({
      method: 'POST',
      url: `/api/v1/pedidos/${pedidoId}/platos`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { productoId, modalidadId, cantidad, ...extra },
    });
    expect(res.statusCode, res.body).toBe(201);
    return res.json() as any;
  }

  function enviar(pedidoId: number, idempotencyKey?: string) {
    return env.app.inject({
      method: 'POST',
      url: '/api/v1/comandas',
      headers: {
        authorization: `Bearer ${tokenMesero}`,
        ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}),
      },
      body: { pedidoId },
    });
  }

  it('GET /comandas devuelve una lista vacía sin registros', async () => {
    const res = await env.app.inject({
      method: 'GET',
      url: '/api/v1/comandas',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it('POST /comandas devuelve 404 si el pedido no existe', async () => {
    const res = await enviar(999999);

    expect(res.statusCode).toBe(404);
    expect((res.json() as any).error).toBe('pedido_no_encontrado');
  });

  it('POST /comandas rechaza un pedido sin platos pendientes', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const res = await enviar(pedidoId);

    expect(res.statusCode).toBe(409);
    expect((res.json() as any).error).toBe('sin_platos_para_enviar');
  });

  it('POST /comandas genera la instantánea y marca los platos en cocina', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const opcionSopa = await env.idOpcion('Sopa del día');
    const plato = await agregarPlato(pedidoId, 2, {
      opcionesSeleccionadas: [opcionSopa],
      configuracion: { observaciones: 'Sin cebolla' },
    });

    const res = await enviar(pedidoId);
    expect(res.statusCode, res.body).toBe(201);

    const comanda = res.json() as any;
    expect(comanda.numeroComanda).toBe(1);
    expect(comanda.estado).toBe('enviado');
    expect(comanda.platosSnapshot).toHaveLength(1);
    expect(comanda.platosSnapshot[0]).toMatchObject({
      platoId: plato.id,
      producto: 'Almuerzo Completo',
      modalidad: 'Almuerzo en Mesa',
      cantidad: 2,
      precioUnitarioCentavos: 8500,
      subtotalCentavos: 17000,
    });
    expect(comanda.platosSnapshot[0].configuracion.observaciones).toBe('Sin cebolla');

    const pedido = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });
    const detalle = pedido.json() as any;
    expect(detalle.estado).toBe('enviado_cocina');
    expect(detalle.platos[0].estado).toBe('en_cocina');
  });

  it('POST /comandas solo incluye los platos nuevos en una segunda comanda', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await agregarPlato(pedidoId, 1);

    const primera = await enviar(pedidoId);
    expect(primera.statusCode, primera.body).toBe(201);

    const nuevo = await agregarPlato(pedidoId, 1);
    const segunda = await enviar(pedidoId);
    expect(segunda.statusCode, segunda.body).toBe(201);

    const comanda = segunda.json() as any;
    expect(comanda.numeroComanda).toBe(2);
    expect(comanda.platosSnapshot).toHaveLength(1);
    expect(comanda.platosSnapshot[0].platoId).toBe(nuevo.id);

    const primeraActualizada = await env.app.inject({
      method: 'GET',
      url: `/api/v1/comandas/${(primera.json() as any).id}`,
    });
    expect((primeraActualizada.json() as any).platosSnapshot).toHaveLength(1);
  });

  it('GET /comandas permite filtrar por pedido y estado', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await agregarPlato(pedidoId, 1);
    const creada = await enviar(pedidoId);
    const comandaId = (creada.json() as any).id;

    const porPedido = await env.app.inject({
      method: 'GET',
      url: `/api/v1/comandas?pedidoId=${pedidoId}`,
    });
    expect(porPedido.statusCode).toBe(200);
    const comandas = porPedido.json() as any[];
    expect(comandas).toHaveLength(1);
    expect(comandas[0].id).toBe(comandaId);

    const porEstado = await env.app.inject({
      method: 'GET',
      url: '/api/v1/comandas?estado=enviado',
    });
    expect((porEstado.json() as any[]).some((c) => c.id === comandaId)).toBe(true);

    const inexistente = await env.app.inject({
      method: 'GET',
      url: '/api/v1/comandas?estado=cancelado',
    });
    expect(inexistente.json()).toEqual([]);
  });

  it('GET /comandas/:id devuelve la comanda y 404 si no existe', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await agregarPlato(pedidoId, 1);
    const creada = (await enviar(pedidoId)).json() as any;

    const res = await env.app.inject({
      method: 'GET',
      url: `/api/v1/comandas/${creada.id}`,
    });
    expect(res.statusCode).toBe(200);
    expect((res.json() as any).pedidoId).toBe(pedidoId);

    const missing = await env.app.inject({
      method: 'GET',
      url: '/api/v1/comandas/999999',
    });
    expect(missing.statusCode).toBe(404);
    expect((missing.json() as any).error).toBe('comanda_no_encontrada');
  });

  it('repetir el envío con la misma clave de idempotencia no duplica la comanda', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await agregarPlato(pedidoId, 1);
    const clave = 'comanda-idempotente-001';

    const primera = await enviar(pedidoId, clave);
    expect(primera.statusCode, primera.body).toBe(201);
    const id = (primera.json() as any).id;

    const segunda = await enviar(pedidoId, clave);
    expect(segunda.statusCode, segunda.body).toBe(200);
    expect((segunda.json() as any).id).toBe(id);

    const listado = await env.app.inject({
      method: 'GET',
      url: `/api/v1/comandas?pedidoId=${pedidoId}`,
    });
    expect(listado.json() as any[]).toHaveLength(1);
  });

  it('reenviar sin clave cuando no quedan platos devuelve 409 y no duplica', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await agregarPlato(pedidoId, 1);
    expect((await enviar(pedidoId)).statusCode).toBe(201);

    const repetido = await enviar(pedidoId);
    expect(repetido.statusCode).toBe(409);
    expect((repetido.json() as any).error).toBe('sin_platos_para_enviar');

    const listado = await env.app.inject({
      method: 'GET',
      url: `/api/v1/comandas?pedidoId=${pedidoId}`,
    });
    expect(listado.json() as any[]).toHaveLength(1);
  });

  it('PATCH /comandas/:id respeta las transiciones enviado -> servido/cancelado', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await agregarPlato(pedidoId, 1);
    const comanda = (await enviar(pedidoId)).json() as any;

    const servida = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/comandas/${comanda.id}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'servido' },
    });
    expect(servida.statusCode, servida.body).toBe(200);
    expect((servida.json() as any).estado).toBe('servido');

    const invalida = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/comandas/${comanda.id}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'cancelado' },
    });
    expect(invalida.statusCode).toBe(409);
    expect((invalida.json() as any).error).toBe('transicion_invalida');
  });

  it('permite cancelar una comanda enviada y rechaza transiciones posteriores', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await agregarPlato(pedidoId, 1);
    const comanda = (await enviar(pedidoId)).json() as any;

    const cancelada = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/comandas/${comanda.id}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'cancelado' },
    });
    expect(cancelada.statusCode, cancelada.body).toBe(200);
    expect((cancelada.json() as any).estado).toBe('cancelado');

    const servida = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/comandas/${comanda.id}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'servido' },
    });
    expect(servida.statusCode).toBe(409);
  });

  it('PATCH /comandas/:id devuelve 404 si la comanda no existe', async () => {
    const res = await env.app.inject({
      method: 'PATCH',
      url: '/api/v1/comandas/999999',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'servido' },
    });

    expect(res.statusCode).toBe(404);
    expect((res.json() as any).error).toBe('comanda_no_encontrada');
  });

  it('caja no puede enviar ni actualizar comandas', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await agregarPlato(pedidoId, 1);

    const crear = await env.app.inject({
      method: 'POST',
      url: '/api/v1/comandas',
      headers: { authorization: `Bearer ${tokenCaja}` },
      body: { pedidoId },
    });
    expect(crear.statusCode).toBe(403);

    const comanda = (await enviar(pedidoId)).json() as any;
    const actualizar = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/comandas/${comanda.id}`,
      headers: { authorization: `Bearer ${tokenCaja}` },
      body: { estado: 'servido' },
    });
    expect(actualizar.statusCode).toBe(403);
  });

  it('sin token no se puede enviar una comanda', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await agregarPlato(pedidoId, 1);

    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/comandas',
      headers: {},
      body: { pedidoId },
    });
    expect(res.statusCode).toBe(401);
  });
});
