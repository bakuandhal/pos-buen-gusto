import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { TestEnv } from '../../tests/testEnv';

describe('API de Platos Individuales - pruebas de integración', () => {
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

  async function crearPlato(pedidoId: number, cantidad = 1) {
    const productoId = await env.idProducto();
    const modalidadId = await env.idModalidadEnMesa();
    return env.app.inject({
      method: 'POST',
      url: `/api/v1/pedidos/${pedidoId}/platos`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { productoId, modalidadId, cantidad },
    });
  }

  it('PATCH /platos-individuales/:id actualiza la cantidad y el total del pedido', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const alta = await crearPlato(pedidoId, 1);
    expect(alta.statusCode, alta.body).toBe(201);
    const platoId = (alta.json() as any).id;

    const res = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/platos-individuales/${platoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { cantidad: 3 },
    });

    expect(res.statusCode, res.body).toBe(200);
    const plato = res.json() as any;
    expect(plato.cantidad).toBe(3);
    expect(plato.subtotalCentavos).toBe(25500);

    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });
    expect((detalle.json() as any).totalCentavos).toBe(25500);
  });

  it('PATCH /platos-individuales/:id aplica una nueva configuración y su desglose', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const alta = await crearPlato(pedidoId, 1);
    const platoId = (alta.json() as any).id;
    const opcionSopa = await env.idOpcion('Sopa del día');
    const opcionEnsalada = await env.idOpcion('Ensalada');

    const res = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/platos-individuales/${platoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: {
        opcionesSeleccionadas: [opcionSopa],
        sustituciones: [{ opcionOriginalId: opcionSopa, opcionSustitutaId: opcionEnsalada }],
        configuracion: { observaciones: 'Sin sal' },
      },
    });

    expect(res.statusCode, res.body).toBe(200);
    const plato = res.json() as any;
    expect(plato.precioUnitarioCentavos).toBe(9000);
    expect(plato.subtotalCentavos).toBe(9000);
    expect(plato.configuracion.observaciones).toBe('Sin sal');
    expect(plato.configuracion.desglose.sustitucionesAplicadas).toHaveLength(1);
    expect(plato.configuracion.desglose.totalCentavos).toBe(9000);
  });

  it('PATCH /platos-individuales/:id conserva la configuración previa al cambiar solo la cantidad', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const opcionSopa = await env.idOpcion('Sopa del día');
    const productoId = await env.idProducto();
    const modalidadId = await env.idModalidadEnMesa();

    const alta = await env.app.inject({
      method: 'POST',
      url: `/api/v1/pedidos/${pedidoId}/platos`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: {
        productoId,
        modalidadId,
        cantidad: 1,
        opcionesSeleccionadas: [opcionSopa],
      },
    });
    const platoId = (alta.json() as any).id;

    const res = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/platos-individuales/${platoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { cantidad: 2 },
    });

    expect(res.statusCode, res.body).toBe(200);
    const plato = res.json() as any;
    expect(plato.configuracion.opcionesSeleccionadas).toEqual([opcionSopa]);
  });

  it('PATCH /platos-individuales/:id rechaza cantidad inválida con 400', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const alta = await crearPlato(pedidoId, 1);
    const platoId = (alta.json() as any).id;

    const res = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/platos-individuales/${platoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { cantidad: 0 },
    });

    expect(res.statusCode).toBe(400);
    expect((res.json() as any).error).toBe('validacion_fallida');
  });

  it('PATCH /platos-individuales/:id devuelve 404 si el plato no existe', async () => {
    const res = await env.app.inject({
      method: 'PATCH',
      url: '/api/v1/platos-individuales/999999',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { cantidad: 2 },
    });

    expect(res.statusCode).toBe(404);
    expect((res.json() as any).error).toBe('plato_no_encontrado');
  });

  it('DELETE /platos-individuales/:id elimina un plato en borrador y recalcula el total', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const alta = await crearPlato(pedidoId, 2);
    const platoId = (alta.json() as any).id;

    const res = await env.app.inject({
      method: 'DELETE',
      url: `/api/v1/platos-individuales/${platoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
    });

    expect(res.statusCode, res.body).toBe(200);
    expect((res.json() as any).plato.id).toBe(platoId);

    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });
    const pedido = detalle.json() as any;
    expect(pedido.platos).toHaveLength(0);
    expect(pedido.totalCentavos).toBe(0);
  });

  it('DELETE /platos-individuales/:id devuelve 404 si el plato no existe', async () => {
    const res = await env.app.inject({
      method: 'DELETE',
      url: '/api/v1/platos-individuales/999999',
      headers: { authorization: `Bearer ${tokenMesero}` },
    });

    expect(res.statusCode).toBe(404);
    expect((res.json() as any).error).toBe('plato_no_encontrado');
  });

  it('un plato ya enviado a cocina no puede modificarse ni eliminarse', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const alta = await crearPlato(pedidoId, 1);
    const platoId = (alta.json() as any).id;

    const comanda = await env.app.inject({
      method: 'POST',
      url: '/api/v1/comandas',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { pedidoId },
    });
    expect(comanda.statusCode, comanda.body).toBe(201);

    const patch = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/platos-individuales/${platoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { cantidad: 2 },
    });
    expect(patch.statusCode).toBe(409);
    expect((patch.json() as any).error).toBe('plato_no_editable');

    const del = await env.app.inject({
      method: 'DELETE',
      url: `/api/v1/platos-individuales/${platoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
    });
    expect(del.statusCode).toBe(409);
    expect((del.json() as any).error).toBe('plato_no_editable');
  });

  it('caja no puede modificar ni cancelar platos', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const alta = await crearPlato(pedidoId, 1);
    const platoId = (alta.json() as any).id;

    const patch = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/platos-individuales/${platoId}`,
      headers: { authorization: `Bearer ${tokenCaja}` },
      body: { cantidad: 2 },
    });
    expect(patch.statusCode).toBe(403);

    const del = await env.app.inject({
      method: 'DELETE',
      url: `/api/v1/platos-individuales/${platoId}`,
      headers: { authorization: `Bearer ${tokenCaja}` },
    });
    expect(del.statusCode).toBe(403);
  });
});
