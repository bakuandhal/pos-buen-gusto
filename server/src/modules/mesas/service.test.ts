import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { TestEnv } from '../../tests/testEnv';
import { schema } from '../../db/connection';
import { MesaConPedidoAbiertoError, MesaNumeroDuplicadoError } from '../../shared/errors/dominio';
import {
  actualizarMesa,
  cambiarEstadoMesa,
  crearMesa,
  desactivarMesa,
  obtenerMesa,
} from './service';

describe('Servicio de mesas - pruebas de integración', () => {
  let env: TestEnv;

  beforeAll(async () => {
    env = await TestEnv.create();
  });

  afterAll(async () => {
    await env.close();
  });

  beforeEach(async () => {
    await env.limpiar();
  });

  it('obtenerMesa devuelve la mesa existente y null si no existe', async () => {
    const id = await env.idMesa();
    const mesa = await obtenerMesa(id);
    expect(mesa?.numero).toBe(1);
    expect(mesa?.estado).toBe('disponible');

    expect(await obtenerMesa(999999)).toBeNull();
  });

  it('crearMesa persiste una mesa disponible y rechaza números duplicados', async () => {
    const creada = await crearMesa({ numero: 50 });
    expect(creada.numero).toBe(50);
    expect(creada.estado).toBe('disponible');
    expect(creada.comensales).toBe(0);

    await expect(crearMesa({ numero: 1 })).rejects.toBeInstanceOf(MesaNumeroDuplicadoError);

    const mesas = await env.db.select().from(schema.mesas);
    expect(mesas.filter((m: any) => m.numero === 1)).toHaveLength(1);
  });

  it('actualizarMesa modifica los campos y devuelve null si no existe', async () => {
    const id = await env.idMesa();
    const actualizada = await actualizarMesa(id, {
      comensales: 3,
      estado: 'ocupada',
    });
    expect(actualizada?.comensales).toBe(3);
    expect(actualizada?.estado).toBe('ocupada');

    expect(await actualizarMesa(999999, { estado: 'disponible', comensales: 2 })).toBeNull();
  });

  it('cambiarEstadoMesa actualiza el estado y devuelve null si no existe', async () => {
    const id = await env.idMesa();
    const actualizada = await cambiarEstadoMesa(id, { estado: 'pendiente' });
    expect(actualizada?.estado).toBe('pendiente');

    expect(await cambiarEstadoMesa(999999, { estado: 'disponible' })).toBeNull();
  });

  it('desactivarMesa libera una mesa y devuelve null si no existe', async () => {
    const creada = await crearMesa({ numero: 51 });
    await actualizarMesa(creada.id, { estado: 'ocupada', comensales: 2 });

    const liberada = await desactivarMesa(creada.id);
    expect(liberada?.id).toBe(creada.id);
    expect(liberada?.estado).toBe('disponible');
    expect(liberada?.comensales).toBe(0);

    const persistida = await obtenerMesa(creada.id);
    expect(persistida?.estado).toBe('disponible');
    expect(persistida?.comensales).toBe(0);

    expect(await desactivarMesa(999999)).toBeNull();
  });

  it('desactivarMesa rechaza una mesa con pedido abierto', async () => {
    const creada = await crearMesa({ numero: 52 });
    const token = await env.tokenAdmin();
    const pedido = await env.app.inject({
      method: 'POST',
      url: '/api/v1/pedidos',
      headers: { authorization: `Bearer ${token}` },
      body: { mesaId: creada.id, tipoServicio: 'mesa' },
    });
    expect(pedido.statusCode, pedido.body).toBe(201);

    await expect(desactivarMesa(creada.id)).rejects.toBeInstanceOf(MesaConPedidoAbiertoError);
    expect(await obtenerMesa(creada.id)).not.toBeNull();
  });
});
