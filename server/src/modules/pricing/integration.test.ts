import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestEnv } from '../../tests/testEnv';

describe('API de catálogo y precios - pruebas de integración', () => {
  let env: TestEnv;

  beforeAll(async () => {
    env = await TestEnv.create();
  });

  afterAll(async () => {
    await env.close();
  });

  it('GET /catalog/productos devuelve el catálogo sembrado', async () => {
    const res = await env.app.inject({
      method: 'GET',
      url: '/api/v1/catalog/productos',
    });

    expect(res.statusCode).toBe(200);
    const productos = res.json() as any[];
    const almuerzo = productos.find((p) => p.nombre === 'Almuerzo Completo');
    expect(almuerzo).toBeDefined();
    expect(almuerzo.estaActivo).toBe(true);
  });

  it('GET /catalog/productos/:id devuelve el producto y 404 si no existe', async () => {
    const productoId = await env.idProducto();

    const res = await env.app.inject({
      method: 'GET',
      url: `/api/v1/catalog/productos/${productoId}`,
    });
    expect(res.statusCode).toBe(200);
    expect((res.json() as any).nombre).toBe('Almuerzo Completo');

    const missing = await env.app.inject({
      method: 'GET',
      url: '/api/v1/catalog/productos/999999',
    });
    expect(missing.statusCode).toBe(404);
    expect((missing.json() as any).error).toBe('producto_no_encontrado');
  });

  it('GET /catalog/modalidades devuelve las modalidades y permite filtrar por producto', async () => {
    const productoId = await env.idProducto();

    const todas = await env.app.inject({
      method: 'GET',
      url: '/api/v1/catalog/modalidades',
    });
    expect(todas.statusCode).toBe(200);
    expect((todas.json() as any[]).length).toBeGreaterThanOrEqual(2);

    const filtradas = await env.app.inject({
      method: 'GET',
      url: `/api/v1/catalog/modalidades?productoId=${productoId}`,
    });
    expect(filtradas.statusCode).toBe(200);
    const modalidades = filtradas.json() as any[];
    expect(modalidades.every((m) => m.productoId === productoId)).toBe(true);
    expect(modalidades.map((m) => m.precioBaseCentavos).sort()).toEqual([7000, 8500]);
  });

  it('GET /catalog/modalidades/:id devuelve la modalidad y 404 si no existe', async () => {
    const modalidadId = await env.idModalidadEnMesa();

    const res = await env.app.inject({
      method: 'GET',
      url: `/api/v1/catalog/modalidades/${modalidadId}`,
    });
    expect(res.statusCode).toBe(200);
    expect((res.json() as any).nombre).toBe('Almuerzo en Mesa');

    const missing = await env.app.inject({
      method: 'GET',
      url: '/api/v1/catalog/modalidades/999999',
    });
    expect(missing.statusCode).toBe(404);
    expect((missing.json() as any).error).toBe('modalidad_no_encontrada');
  });

  it('GET /catalog/grupos-opciones y /catalog/opciones devuelven la configuración', async () => {
    const productoId = await env.idProducto();

    const grupos = await env.app.inject({
      method: 'GET',
      url: `/api/v1/catalog/grupos-opciones?productoId=${productoId}`,
    });
    expect(grupos.statusCode).toBe(200);
    const gruposBody = grupos.json() as any[];
    expect(gruposBody.map((g) => g.nombre).sort()).toEqual(['Proteína', 'Sopa']);

    const opciones = await env.app.inject({
      method: 'GET',
      url: '/api/v1/catalog/opciones',
    });
    expect(opciones.statusCode).toBe(200);
    expect((opciones.json() as any[]).map((o) => o.nombre)).toEqual(
      expect.arrayContaining(['Pollo', 'Carne', 'Sopa del día', 'Ensalada'])
    );
  });

  it('GET /catalog/adicionales devuelve los adicionales configurados', async () => {
    const res = await env.app.inject({
      method: 'GET',
      url: '/api/v1/catalog/adicionales',
    });

    expect(res.statusCode).toBe(200);
    const adicionales = res.json() as any[];
    const doble = adicionales.find((a) => a.nombre === 'Doble proteína');
    expect(doble).toBeDefined();
    expect(doble.precioCentavos).toBe(1500);
  });

  it('GET /catalog/modalidades/:id/opciones-incluidas incluye la sopa del día', async () => {
    const modalidadId = await env.idModalidadEnMesa();
    const sopa = await env.idOpcion('Sopa del día');
    const res = await env.app.inject({
      method: 'GET',
      url: `/api/v1/catalog/modalidades/${modalidadId}/opciones-incluidas`,
    });

    expect(res.statusCode).toBe(200);
    const incluidas = res.json() as any[];
    expect(incluidas.map((o) => o.opcionId)).toContain(sopa);
  });

  it('GET /catalog/modalidades/:id/sustituciones devuelve la regla de recargo', async () => {
    const modalidadId = await env.idModalidadEnMesa();
    const sopa = await env.idOpcion('Sopa del día');
    const ensalada = await env.idOpcion('Ensalada');
    const res = await env.app.inject({
      method: 'GET',
      url: `/api/v1/catalog/modalidades/${modalidadId}/sustituciones`,
    });

    expect(res.statusCode).toBe(200);
    const reglas = res.json() as any[];
    expect(reglas).toHaveLength(1);
    expect(reglas[0].ajustePrecioCentavos).toBe(500);
    expect(reglas[0].opcionOriginalId).toBe(sopa);
    expect(reglas[0].opcionSustitutaId).toBe(ensalada);
  });

  it('POST /pricing/quote calcula el precio base de una modalidad', async () => {
    const productoId = await env.idProducto();
    const modalidadId = await env.idModalidadEnMesa();

    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pricing/quote',
      body: {
        productoId,
        modalidadId,
        opcionesSeleccionadas: [],
        sustituciones: [],
        adicionales: [],
      },
    });

    expect(res.statusCode, res.body).toBe(200);
    const cotizacion = res.json() as any;
    expect(cotizacion.precioBaseCentavos).toBe(8500);
    expect(cotizacion.totalCentavos).toBe(8500);
    expect(cotizacion.productoNombre).toBe('Almuerzo Completo');
    expect(cotizacion.modalidadNombre).toBe('Almuerzo en Mesa');
    expect(cotizacion.opcionesIncluidas).toHaveLength(1);
  });

  it('POST /pricing/quote aplica sustituciones y adicionales', async () => {
    const productoId = await env.idProducto();
    const modalidadId = await env.idModalidadEnMesa();
    const sopa = await env.idOpcion('Sopa del día');
    const ensalada = await env.idOpcion('Ensalada');
    const adicionalId = await env.idAdicional('Doble proteína');

    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pricing/quote',
      body: {
        productoId,
        modalidadId,
        opcionesSeleccionadas: [sopa],
        sustituciones: [{ opcionOriginalId: sopa, opcionSustitutaId: ensalada }],
        adicionales: [{ adicionalId, cantidad: 2 }],
      },
    });

    expect(res.statusCode, res.body).toBe(200);
    const cotizacion = res.json() as any;
    expect(cotizacion.sustitucionesAplicadas).toHaveLength(1);
    expect(cotizacion.sustitucionesAplicadas[0].ajustePrecioCentavos).toBe(500);
    expect(cotizacion.adicionales).toHaveLength(1);
    expect(cotizacion.adicionales[0].subtotalCentavos).toBe(3000);
    expect(cotizacion.totalCentavos).toBe(12000);
  });

  it('POST /pricing/quote rechaza producto y modalidad inexistentes con 400', async () => {
    const productoId = await env.idProducto();
    const modalidadId = await env.idModalidadEnMesa();

    const producto = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pricing/quote',
      body: {
        productoId: 999999,
        modalidadId,
        opcionesSeleccionadas: [],
        sustituciones: [],
        adicionales: [],
      },
    });
    expect(producto.statusCode).toBe(400);
    expect((producto.json() as any).error).toBe('producto_no_encontrado');

    const modalidad = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pricing/quote',
      body: {
        productoId,
        modalidadId: 999999,
        opcionesSeleccionadas: [],
        sustituciones: [],
        adicionales: [],
      },
    });
    expect(modalidad.statusCode).toBe(400);
    expect((modalidad.json() as any).error).toBe('modalidad_no_valida');
  });

  it('POST /pricing/quote rechaza un cuerpo inválido con 400', async () => {
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pricing/quote',
      body: {},
    });

    expect(res.statusCode).toBe(400);
    expect((res.json() as any).error).toBe('validacion_fallida');
  });
});
