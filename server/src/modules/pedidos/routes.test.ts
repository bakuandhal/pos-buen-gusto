import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { TestEnv } from '../../tests/testEnv';
import { schema } from '../../db/connection';

describe('Flujo de pedidos, platos y comandas - pruebas de integración', () => {
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

  /** Crea un pedido de mesa y devuelve su id. */
  async function crearPedidoDeMesa(extra: Record<string, unknown> = {}): Promise<number> {
    const mesaId = await env.idMesa();
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pedidos',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { mesaId, tipoServicio: 'mesa', ...extra },
    });
    expect(res.statusCode, res.body).toBe(201);
    return (res.json() as any).id;
  }

  /** Añade un plato configurado a un pedido. */
  async function anadirPlato(
    pedidoId: number,
    cantidad = 1,
    idempotencyKey?: string,
    extra: Record<string, unknown> = {},
    token = tokenMesero
  ) {
    const productoId = await env.idProducto();
    const modalidadId = await env.idModalidadEnMesa();
    const res = await env.app.inject({
      method: 'POST',
      url: `/api/v1/pedidos/${pedidoId}/platos`,
      headers: {
        authorization: `Bearer ${token}`,
        ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}),
      },
      body: { productoId, modalidadId, cantidad, ...extra },
    });
    return res;
  }

  /** Crea un pedido para llevar y devuelve su id. */
  async function crearPedidoParaLlevar(): Promise<number> {
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pedidos',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { tipoServicio: 'para_llevar' },
    });
    expect(res.statusCode, res.body).toBe(201);
    return (res.json() as any).id;
  }

  /** Envía una comanda y devuelve la respuesta completa. */
  async function enviarComanda(pedidoId: number, idempotencyKey?: string) {
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

  // ── 2. Apertura de servicio para una mesa válida ──
  it('2. POST /pedidos abre un servicio en una mesa libre y la marca como ocupada', async () => {
    const mesaId = await env.idMesa();

    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pedidos',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { mesaId, tipoServicio: 'mesa' },
    });

    expect(res.statusCode, res.body).toBe(201);
    const pedido = res.json() as any;
    expect(pedido.mesaId).toBe(mesaId);
    expect(pedido.estado).toBe('borrador');
    expect(pedido.totalCentavos).toBe(0);
    expect(pedido.usuarioId).toBeGreaterThan(0);

    // La mesa debe quedar ocupada.
    const mesa = await env.app.inject({
      method: 'GET',
      url: `/api/v1/mesas/${mesaId}`,
    });
    expect((mesa.json() as any).estado).toBe('ocupada');
  });

  // ── 3. Prevención de servicios duplicados en la misma mesa ──
  it('3. POST /pedidos rechaza un segundo servicio en la misma mesa con 409', async () => {
    await crearPedidoDeMesa();

    const mesaId = await env.idMesa();
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pedidos',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { mesaId, tipoServicio: 'mesa' },
    });

    expect(res.statusCode).toBe(409);
    const body = res.json() as any;
    expect(body.error).toBe('mesa_ocupada');
  });

  // ── 4. Pedido para llevar sin mesa ──
  it('4. POST /pedidos crea un pedido para llevar sin mesa asociada', async () => {
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pedidos',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { tipoServicio: 'para_llevar' },
    });

    expect(res.statusCode, res.body).toBe(201);
    const pedido = res.json() as any;
    expect(pedido.mesaId).toBeNull();
    expect(pedido.tipoServicio).toBe('para_llevar');
    expect(pedido.estado).toBe('borrador');
  });

  // ── 4b. Pedido para llevar no debe aceptar mesa ──
  it('4b. POST /pedidos rechaza mesa en un pedido para llevar con 400', async () => {
    const mesaId = await env.idMesa();
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pedidos',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { mesaId, tipoServicio: 'para_llevar' },
    });

    expect(res.statusCode).toBe(400);
    expect((res.json() as any).error).toBe('mesa_no_permitida');
  });

  // ── 5. Varios platos independientes en el mismo pedido ──
  it('5. POST /pedidos/:id/platos añade varios platos con configuraciones distintas', async () => {
    const pedidoId = await crearPedidoDeMesa();

    const primerPlato = await anadirPlato(pedidoId, 1);
    expect(primerPlato.statusCode, primerPlato.body).toBe(201);

    const segundoPlato = await anadirPlato(pedidoId, 2);
    expect(segundoPlato.statusCode, segundoPlato.body).toBe(201);

    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });

    expect(detalle.statusCode).toBe(200);
    const pedido = detalle.json() as any;
    expect(pedido.platos).toHaveLength(2);

    // Cada línea conserva su propia configuración y cantidad.
    const cantidades = pedido.platos.map((p: any) => p.cantidad).sort();
    expect(cantidades).toEqual([1, 2]);
  });

  // ── 7. Cotización mediante el motor real de precios ──
  it('7. el precio del plato lo determina el motor de precios, no el cliente', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const res = await anadirPlato(pedidoId, 2);

    expect(res.statusCode, res.body).toBe(201);
    const plato = res.json() as any;

    // 2 x 8500 (precio base de la modalidad de prueba)
    expect(plato.precioUnitarioCentavos).toBe(8500);
    expect(plato.subtotalCentavos).toBe(17000);

    // El desglose del motor de precios queda guardado.
    expect(plato.configuracion.desglose).toBeDefined();
    expect(plato.configuracion.desglose.totalCentavos).toBe(8500);
  });

  // ── 8. Rechazo de selecciones inválidas ──
  it('8. POST /pedidos/:id/platos rechaza una modalidad inexistente con 400', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const productoId = await env.idProducto();

    const res = await env.app.inject({
      method: 'POST',
      url: `/api/v1/pedidos/${pedidoId}/platos`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { productoId, modalidadId: 999999, cantidad: 1 },
    });

    expect(res.statusCode).toBe(400);
    const body = res.json() as any;
    expect(body.error).toBe('modalidad_no_valida');
  });

  // ── 9. Persistencia del precio confirmado y su desglose ──
  it('9. el precio confirmado y su desglose quedan persistidos', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 1);

    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });

    const pedido = detalle.json() as any;
    const plato = pedido.platos[0];

    expect(plato.precioUnitarioCentavos).toBe(8500);
    expect(plato.subtotalCentavos).toBe(8500);
    expect(plato.configuracion.desglose.precioBaseCentavos).toBe(8500);
    expect(pedido.totalCentavos).toBe(8500);
  });

  // ── 11. Envío de comanda sin duplicar platos ──
  it('11. POST /comandas envía a cocina los platos pendientes y los marca como enviados', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 1);
    await anadirPlato(pedidoId, 1);

    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/comandas',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { pedidoId },
    });

    expect(res.statusCode, res.body).toBe(201);
    const comanda = res.json() as any;
    expect(comanda.numeroComanda).toBe(1);
    expect(comanda.estado).toBe('enviado');
    expect(comanda.platosSnapshot).toHaveLength(2);

    // El pedido pasa a enviado_cocina.
    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });
    const pedido = detalle.json() as any;
    expect(pedido.estado).toBe('enviado_cocina');
    expect(pedido.platos.every((p: any) => p.estado === 'en_cocina')).toBe(true);
  });

  // ── 12. Nueva comanda para platos añadidos posteriormente ──
  it('12. una segunda comanda incluye solo los platos nuevos', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 1);

    const primera = await env.app.inject({
      method: 'POST',
      url: '/api/v1/comandas',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { pedidoId },
    });
    expect(primera.statusCode, primera.body).toBe(201);

    // Añadir un plato nuevo al pedido ya parcialmente enviado.
    const nuevo = await anadirPlato(pedidoId, 1);
    expect(nuevo.statusCode, nuevo.body).toBe(201);

    const segunda = await env.app.inject({
      method: 'POST',
      url: '/api/v1/comandas',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { pedidoId },
    });

    expect(segunda.statusCode, segunda.body).toBe(201);
    const comanda = segunda.json() as any;
    expect(comanda.numeroComanda).toBe(2);
    // Solo el plato nuevo, no el ya enviado.
    expect(comanda.platosSnapshot).toHaveLength(1);
  });

  // ── 12b. No se puede enviar una comanda sin platos pendientes ──
  it('12b. POST /comandas rechaza el envío cuando no hay platos pendientes', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 1);

    await env.app.inject({
      method: 'POST',
      url: '/api/v1/comandas',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { pedidoId },
    });

    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/comandas',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { pedidoId },
    });

    expect(res.statusCode).toBe(409);
    expect((res.json() as any).error).toBe('sin_platos_para_enviar');
  });

  // ── 13. Rechazo de modificaciones tras el envío ──
  it('13. un plato ya enviado a cocina no puede modificarse', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const alta = await anadirPlato(pedidoId, 1);
    const platoId = (alta.json() as any).id;

    await env.app.inject({
      method: 'POST',
      url: '/api/v1/comandas',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { pedidoId },
    });

    const res = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/platos-individuales/${platoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { cantidad: 3 },
    });

    expect(res.statusCode).toBe(409);
    expect((res.json() as any).error).toBe('plato_no_editable');
  });

  // ── 14. Cancelación controlada de un plato ──
  it('14. DELETE /platos-individuales/:id cancela un plato en borrador y recalcula el total', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const alta = await anadirPlato(pedidoId, 2);
    const platoId = (alta.json() as any).id;

    const res = await env.app.inject({
      method: 'DELETE',
      url: `/api/v1/platos-individuales/${platoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
    });

    expect(res.statusCode, res.body).toBe(200);

    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });
    const pedido = detalle.json() as any;
    expect(pedido.platos).toHaveLength(0);
    expect(pedido.totalCentavos).toBe(0);
  });

  // ── 15. Idempotencia de la creación de platos ──
  it('15. repetir la misma operación con la misma clave no crea duplicados', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const clave = 'operacion-unica-123';

    const primera = await anadirPlato(pedidoId, 1, clave);
    expect(primera.statusCode, primera.body).toBe(201);
    const idPrimerPlato = (primera.json() as any).id;

    const segunda = await anadirPlato(pedidoId, 1, clave);
    expect(segunda.statusCode, segunda.body).toBe(200);
    expect((segunda.json() as any).id).toBe(idPrimerPlato);

    // Solo existe un plato en el pedido.
    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });
    expect((detalle.json() as any).platos).toHaveLength(1);
  });

  // ── 15b. Idempotencia de la creación de pedidos ──
  it('15b. repetir la creación de pedido con la misma clave devuelve el mismo pedido', async () => {
    const mesaId = await env.idMesa();
    const clave = 'apertura-unica-456';

    const primera = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pedidos',
      headers: {
        authorization: `Bearer ${tokenMesero}`,
        'idempotency-key': clave,
      },
      body: { mesaId, tipoServicio: 'mesa' },
    });
    expect(primera.statusCode, primera.body).toBe(201);

    const segunda = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pedidos',
      headers: {
        authorization: `Bearer ${tokenMesero}`,
        'idempotency-key': clave,
      },
      body: { mesaId, tipoServicio: 'mesa' },
    });

    // Replay: no crea un segundo pedido.
    expect(segunda.statusCode).toBe(200);
    expect((segunda.json() as any).id).toBe((primera.json() as any).id);

    const listado = await env.app.inject({
      method: 'GET',
      url: '/api/v1/pedidos',
    });
    const pedidos = (listado.json() as any[]).filter((p) => p.mesaId === mesaId);
    expect(pedidos).toHaveLength(1);
  });

  // ── 17. Permisos insuficientes ──
  it('17. un usuario sin permiso de comandas no puede enviar comandas', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 1);

    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/comandas',
      headers: { authorization: `Bearer ${tokenCaja}` },
      body: { pedidoId },
    });

    expect(res.statusCode).toBe(403);
    expect((res.json() as any).error).toBe('sin_permisos');
  });

  // ── 18. Manejo de errores de validación ──
  it('18. una cantidad inválida se rechaza con 400 antes de tocar la base de datos', async () => {
    const pedidoId = await crearPedidoDeMesa();

    const res = await anadirPlato(pedidoId, 0);

    expect(res.statusCode).toBe(400);
    expect((res.json() as any).error).toBe('validacion_fallida');

    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });
    expect((detalle.json() as any).platos).toHaveLength(0);
  });

  // ── 19. Consistencia entre cantidades, subtotales y total ──
  it('19. el total del pedido coincide con la suma de los subtotales', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 1);
    await anadirPlato(pedidoId, 3);

    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });
    const pedido = detalle.json() as any;

    const suma = pedido.platos.reduce((acc: number, p: any) => acc + p.subtotalCentavos, 0);
    expect(pedido.totalCentavos).toBe(suma);
    expect(pedido.totalCentavos).toBe(8500 * 4);

    // Cada línea es coherente: subtotal = unitario x cantidad.
    for (const plato of pedido.platos) {
      expect(plato.subtotalCentavos).toBe(plato.precioUnitarioCentavos * plato.cantidad);
    }
  });

  // ── 20. Ausencia de pérdida de precisión ──
  it('20. los importes se conservan como enteros sin pérdida de precisión', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 7);

    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });
    const pedido = detalle.json() as any;

    expect(Number.isInteger(pedido.totalCentavos)).toBe(true);
    expect(pedido.totalCentavos).toBe(8500 * 7);
    expect(pedido.totalCentavos).toBe(59500);
  });

  // ── Transición de estado inválida ──
  it('rechaza una transición de estado no permitida con 409', async () => {
    const pedidoId = await crearPedidoDeMesa();

    const res = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/pedidos/${pedidoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'enviado_cocina' },
    });

    expect(res.statusCode).toBe(409);
    expect((res.json() as any).error).toBe('transicion_invalida');
  });

  // ── Cancelación de pedido libera la mesa ──
  it('cancelar un pedido libera la mesa, cancela sus platos y deja total 0', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 1);
    const mesaId = await env.idMesa();

    const res = await env.app.inject({
      method: 'DELETE',
      url: `/api/v1/pedidos/${pedidoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
    });

    expect(res.statusCode, res.body).toBe(200);
    const cancelado = (res.json() as any).pedido;
    expect(cancelado.estado).toBe('cancelado');
    expect(cancelado.totalCentavos).toBe(0);
    expect(cancelado.platos.every((p: any) => p.estado === 'cancelado')).toBe(true);

    const mesa = await env.app.inject({
      method: 'GET',
      url: `/api/v1/mesas/${mesaId}`,
    });
    expect((mesa.json() as any).estado).toBe('disponible');
  });

  it('PATCH /pedidos/:id con estado cancelado aplica los mismos efectos que DELETE', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 2);
    const mesaId = await env.idMesa();

    const res = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/pedidos/${pedidoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'cancelado' },
    });

    expect(res.statusCode, res.body).toBe(200);
    const cancelado = res.json() as any;
    expect(cancelado.estado).toBe('cancelado');
    expect(cancelado.totalCentavos).toBe(0);

    const mesa = await env.app.inject({
      method: 'GET',
      url: `/api/v1/mesas/${mesaId}`,
    });
    expect((mesa.json() as any).estado).toBe('disponible');
  });

  it('un pedido enviado a cocina puede cancelarse y libera la mesa', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 1);
    const comanda = await enviarComanda(pedidoId);
    expect(comanda.statusCode, comanda.body).toBe(201);
    const mesaId = await env.idMesa();

    const res = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/pedidos/${pedidoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'cancelado' },
    });
    expect(res.statusCode, res.body).toBe(200);
    expect((res.json() as any).totalCentavos).toBe(0);

    const mesa = await env.app.inject({
      method: 'GET',
      url: `/api/v1/mesas/${mesaId}`,
    });
    expect((mesa.json() as any).estado).toBe('disponible');
  });

  // ── Historial de pedidos ──
  it('GET /pedidos devuelve el historial y permite filtrar por mesa y estado', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 1);
    const mesaId = await env.idMesa();

    const res = await env.app.inject({
      method: 'GET',
      url: '/api/v1/pedidos',
    });

    expect(res.statusCode).toBe(200);
    const pedidos = res.json() as any[];
    const encontrado = pedidos.find((p) => p.id === pedidoId);
    expect(encontrado).toBeDefined();
    expect(encontrado.platos).toHaveLength(1);

    const porMesa = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos?mesaId=${mesaId}&estado=borrador`,
    });
    expect(porMesa.statusCode).toBe(200);
    const filtrados = porMesa.json() as any[];
    expect(filtrados).toHaveLength(1);
    expect(filtrados[0].id).toBe(pedidoId);
  });

  // ── Configuración individual del plato y motor de precios ──
  it('21. cada plato conserva su configuración y el desglose del motor de precios', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const opcionSopa = await env.idOpcion('Sopa del día');
    const opcionEnsalada = await env.idOpcion('Ensalada');
    const opcionPollo = await env.idOpcion('Pollo');
    const adicionalId = await env.idAdicional('Doble proteína');

    const res = await anadirPlato(pedidoId, 1, undefined, {
      opcionesSeleccionadas: [opcionSopa, opcionPollo],
      sustituciones: [{ opcionOriginalId: opcionSopa, opcionSustitutaId: opcionEnsalada }],
      adicionales: [{ adicionalId, cantidad: 2 }],
      configuracion: { observaciones: 'Sin cebolla' },
    });

    expect(res.statusCode, res.body).toBe(201);
    const plato = res.json() as any;

    // 8500 base + 500 sustitución + (1500 x 2) adicionales.
    expect(plato.precioUnitarioCentavos).toBe(12000);
    expect(plato.subtotalCentavos).toBe(12000);
    expect(plato.configuracion.observaciones).toBe('Sin cebolla');
    expect(plato.configuracion.opcionesSeleccionadas).toEqual([opcionSopa, opcionPollo]);
    expect(plato.configuracion.desglose.sustitucionesAplicadas).toHaveLength(1);
    expect(plato.configuracion.desglose.sustitucionesAplicadas[0]).toMatchObject({
      opcionOriginalId: opcionSopa,
      opcionSustitutaId: opcionEnsalada,
      ajustePrecioCentavos: 500,
    });
    expect(plato.configuracion.desglose.adicionales).toHaveLength(1);
    expect(plato.configuracion.desglose.adicionales[0].subtotalCentavos).toBe(3000);
    expect(plato.configuracion.desglose.totalCentavos).toBe(12000);

    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });
    expect((detalle.json() as any).totalCentavos).toBe(12000);
  });

  it('21b. rechaza una opción no disponible para el producto con 400', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const res = await anadirPlato(pedidoId, 1, undefined, {
      opcionesSeleccionadas: [999999],
    });

    expect(res.statusCode).toBe(400);
    expect((res.json() as any).error).toBe('opcion_no_valida');
  });

  // ── Persistencia histórica de precios ──
  it('22. cambiar la tarifa no modifica platos ya confirmados y sí afecta a los nuevos', async () => {
    const modalidadId = await env.idModalidadEnMesa();
    const pedidoId = await crearPedidoDeMesa();
    const primero = await anadirPlato(pedidoId, 1);
    expect(primero.statusCode, primero.body).toBe(201);
    const platoId = (primero.json() as any).id;

    await env.actualizarPrecioModalidad(modalidadId, 9000);

    try {
      const detalle = await env.app.inject({
        method: 'GET',
        url: `/api/v1/pedidos/${pedidoId}`,
      });
      const platoPersistido = (detalle.json() as any).platos.find((p: any) => p.id === platoId);
      expect(platoPersistido.precioUnitarioCentavos).toBe(8500);
      expect(platoPersistido.configuracion.desglose.precioBaseCentavos).toBe(8500);
      expect((detalle.json() as any).totalCentavos).toBe(8500);

      const segundo = await anadirPlato(pedidoId, 1);
      expect(segundo.statusCode, segundo.body).toBe(201);
      expect((segundo.json() as any).precioUnitarioCentavos).toBe(9000);

      const detalleFinal = await env.app.inject({
        method: 'GET',
        url: `/api/v1/pedidos/${pedidoId}`,
      });
      expect((detalleFinal.json() as any).totalCentavos).toBe(17500);
    } finally {
      await env.actualizarPrecioModalidad(modalidadId, 8500);
    }
  });

  // ── Cambios de estado válidos ──
  it('23. confirmar un pedido lo deja en confirmado y permite seguir añadiendo platos', async () => {
    const pedidoId = await crearPedidoDeMesa();

    const confirmado = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/pedidos/${pedidoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'confirmado' },
    });
    expect(confirmado.statusCode, confirmado.body).toBe(200);
    expect((confirmado.json() as any).estado).toBe('confirmado');

    const plato = await anadirPlato(pedidoId, 1);
    expect(plato.statusCode, plato.body).toBe(201);

    const retroceso = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/pedidos/${pedidoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'borrador' },
    });
    expect(retroceso.statusCode).toBe(409);
    expect((retroceso.json() as any).error).toBe('transicion_invalida');
  });

  it('23a. no se puede marcar un pedido como enviado sin crear una comanda', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 1);

    const confirmado = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/pedidos/${pedidoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'confirmado' },
    });
    expect(confirmado.statusCode).toBe(200);

    const intento = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/pedidos/${pedidoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'enviado_cocina' },
    });
    expect(intento.statusCode).toBe(409);
    expect((intento.json() as any).error).toBe('transicion_invalida');

    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });
    expect((detalle.json() as any).estado).toBe('confirmado');
    expect((detalle.json() as any).platos[0].estado).toBe('borrador');
  });

  it('23b. modificar la cantidad recalcula subtotal y total', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const alta = await anadirPlato(pedidoId, 1);
    const platoId = (alta.json() as any).id;

    const res = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/platos-individuales/${platoId}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { cantidad: 4 },
    });

    expect(res.statusCode, res.body).toBe(200);
    const plato = res.json() as any;
    expect(plato.cantidad).toBe(4);
    expect(plato.precioUnitarioCentavos).toBe(8500);
    expect(plato.subtotalCentavos).toBe(34000);

    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });
    expect((detalle.json() as any).totalCentavos).toBe(34000);
  });

  // ── Pedido para llevar: modalidad propia ──
  it('24. un pedido para llevar puede usar la modalidad para llevar', async () => {
    const pedidoId = await crearPedidoParaLlevar();
    const productoId = await env.idProducto();
    const modalidadId = await env.idModalidadParaLlevar();

    const res = await env.app.inject({
      method: 'POST',
      url: `/api/v1/pedidos/${pedidoId}/platos`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { productoId, modalidadId, cantidad: 1 },
    });

    expect(res.statusCode, res.body).toBe(201);
    expect((res.json() as any).precioUnitarioCentavos).toBe(7000);
  });

  // ── Comanda: instantánea completa ──
  it('25. la comanda guarda la instantánea con producto, modalidad y configuración', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const opcionSopa = await env.idOpcion('Sopa del día');
    const alta = await anadirPlato(pedidoId, 2, undefined, {
      opcionesSeleccionadas: [opcionSopa],
      configuracion: { observaciones: 'Para compartir' },
    });
    expect(alta.statusCode, alta.body).toBe(201);
    const platoId = (alta.json() as any).id;

    const res = await enviarComanda(pedidoId);
    expect(res.statusCode, res.body).toBe(201);

    const comanda = res.json() as any;
    expect(comanda.platosSnapshot).toHaveLength(1);
    expect(comanda.platosSnapshot[0]).toMatchObject({
      platoId,
      producto: 'Almuerzo Completo',
      modalidad: 'Almuerzo en Mesa',
      cantidad: 2,
      precioUnitarioCentavos: 8500,
      subtotalCentavos: 17000,
    });
    expect(comanda.platosSnapshot[0].configuracion.observaciones).toBe('Para compartir');

    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/comandas/${comanda.id}`,
    });
    expect(detalle.statusCode).toBe(200);
    expect((detalle.json() as any).pedidoId).toBe(pedidoId);
  });

  // ── Idempotencia de comandas ──
  it('26. repetir el envío de comanda con la misma clave no crea duplicados', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 1);
    const clave = 'comanda-unica-789';

    const primera = await enviarComanda(pedidoId, clave);
    expect(primera.statusCode, primera.body).toBe(201);
    const idComanda = (primera.json() as any).id;

    const segunda = await enviarComanda(pedidoId, clave);
    expect(segunda.statusCode, segunda.body).toBe(200);
    expect((segunda.json() as any).id).toBe(idComanda);

    const listado = await env.app.inject({
      method: 'GET',
      url: `/api/v1/comandas?pedidoId=${pedidoId}`,
    });
    expect(listado.json() as any[]).toHaveLength(1);
  });

  it('26b. una operación fallida libera la clave de idempotencia para reintentar', async () => {
    const pedidoId = await crearPedidoDeMesa();
    const clave = 'reintento-tras-error-321';

    const fallida = await anadirPlato(pedidoId, 1, clave, {
      modalidadId: 999999,
    });
    expect(fallida.statusCode).toBe(400);

    const exitosa = await anadirPlato(pedidoId, 1, clave);
    expect(exitosa.statusCode, exitosa.body).toBe(201);
  });

  // ── Concurrencia ──
  it('27. dos aperturas concurrentes de la misma mesa solo crean un pedido', async () => {
    const mesaId = await env.idMesa();
    const abrir = () =>
      env.app.inject({
        method: 'POST',
        url: '/api/v1/pedidos',
        headers: { authorization: `Bearer ${tokenMesero}` },
        body: { mesaId, tipoServicio: 'mesa' },
      });

    const [a, b] = await Promise.all([abrir(), abrir()]);
    const codigos = [a.statusCode, b.statusCode].sort();
    expect(codigos).toEqual([201, 409]);

    const listado = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos?mesaId=${mesaId}`,
    });
    expect(listado.json() as any[]).toHaveLength(1);
  });

  it('28. dos altas concurrentes de platos conservan el total correcto', async () => {
    const pedidoId = await crearPedidoDeMesa();

    const [a, b] = await Promise.all([anadirPlato(pedidoId, 1), anadirPlato(pedidoId, 1)]);
    expect(a.statusCode, a.body).toBe(201);
    expect(b.statusCode, b.body).toBe(201);

    const detalle = await env.app.inject({
      method: 'GET',
      url: `/api/v1/pedidos/${pedidoId}`,
    });
    const pedido = detalle.json() as any;
    expect(pedido.platos).toHaveLength(2);
    expect(pedido.totalCentavos).toBe(17000);
  });

  it('29. dos envíos concurrentes de comanda no duplican platos', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 1);

    const [a, b] = await Promise.all([enviarComanda(pedidoId), enviarComanda(pedidoId)]);
    const codigos = [a.statusCode, b.statusCode].sort();
    expect(codigos).toEqual([201, 409]);

    const listado = await env.app.inject({
      method: 'GET',
      url: `/api/v1/comandas?pedidoId=${pedidoId}`,
    });
    expect(listado.json() as any[]).toHaveLength(1);

    const comandas = await env.db
      .select()
      .from(schema.comandas)
      .where(eq(schema.comandas.pedidoId, pedidoId));
    expect(comandas).toHaveLength(1);
  });

  // ── Autorización ──
  it('30. caja no puede crear pedidos ni añadir platos', async () => {
    const mesaId = await env.idMesa();

    const crear = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pedidos',
      headers: { authorization: `Bearer ${tokenCaja}` },
      body: { mesaId, tipoServicio: 'mesa' },
    });
    expect(crear.statusCode).toBe(403);
    expect((crear.json() as any).error).toBe('sin_permisos');

    const pedidoId = await crearPedidoDeMesa();
    const plato = await anadirPlato(pedidoId, 1, undefined, {}, tokenCaja);
    expect(plato.statusCode).toBe(403);
  });

  it('30b. sin token no se puede abrir un pedido', async () => {
    const mesaId = await env.idMesa();
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pedidos',
      headers: {},
      body: { mesaId, tipoServicio: 'mesa' },
    });
    expect(res.statusCode).toBe(401);
  });

  // ── Estado de comanda ──
  it('31. respeta las transiciones de estado de la comanda', async () => {
    const pedidoId = await crearPedidoDeMesa();
    await anadirPlato(pedidoId, 1);
    const comanda = (await enviarComanda(pedidoId)).json() as any;

    const servida = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/comandas/${comanda.id}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'servido' },
    });
    expect(servida.statusCode, servida.body).toBe(200);
    expect((servida.json() as any).estado).toBe('servido');

    const retroceso = await env.app.inject({
      method: 'PATCH',
      url: `/api/v1/comandas/${comanda.id}`,
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'enviado' },
    });
    expect(retroceso.statusCode).toBe(409);
    expect((retroceso.json() as any).error).toBe('transicion_invalida');
  });

  it('31b. una comanda inexistente devuelve 404 al actualizar su estado', async () => {
    const res = await env.app.inject({
      method: 'PATCH',
      url: '/api/v1/comandas/999999',
      headers: { authorization: `Bearer ${tokenMesero}` },
      body: { estado: 'servido' },
    });
    expect(res.statusCode).toBe(404);
    expect((res.json() as any).error).toBe('comanda_no_encontrada');
  });
});
