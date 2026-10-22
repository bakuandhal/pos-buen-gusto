import { eq, and, inArray } from 'drizzle-orm';
import { getDb, schema } from '../../db/connection';
import {
  ComandaNoEncontradaError,
  PedidoNoEncontradoError,
  PedidoNoEditableError,
  SinPlatosParaEnviarError,
  TransicionInvalidaError,
} from '../../shared/errors/dominio';
import { ESTADOS_PEDIDO } from '../pedidos/service';
import type { ComandaCreateInput, ComandaUpdateInput } from './schemas';

/** Transiciones válidas del estado de una comanda. */
const TRANSICIONES_COMANDA: Record<string, string[]> = {
  borrador: ['enviado', 'cancelado'],
  enviado: ['servido', 'cancelado'],
  servido: [],
  cancelado: [],
};

export interface Comanda {
  id: number;
  pedidoId: number;
  numeroComanda: number;
  estado: string;
  usuarioId: number;
  platosSnapshot: any;
  creadoEn: string;
  actualizadoEn: string;
}

export async function listarComandas(filtros?: {
  pedidoId?: number;
  estado?: string;
}): Promise<Comanda[]> {
  const db = getDb() as any;

  const condiciones = [];
  if (filtros?.pedidoId !== undefined) {
    condiciones.push(eq(schema.comandas.pedidoId, filtros.pedidoId));
  }
  if (filtros?.estado) {
    condiciones.push(eq(schema.comandas.estado, filtros.estado));
  }

  const base = db.select().from(schema.comandas);
  const comandas = await (condiciones.length ? base.where(and(...condiciones)) : base).orderBy(
    schema.comandas.creadoEn,
    'desc'
  );

  return comandas;
}

export async function obtenerComanda(id: number): Promise<Comanda | null> {
  const db = getDb() as any;
  const [comanda] = await db
    .select()
    .from(schema.comandas)
    .where(eq(schema.comandas.id, id))
    .limit(1);
  return comanda || null;
}

/**
 * Envía a cocina los platos pendientes de un pedido.
 *
 * Solo se incluyen los platos en estado `borrador`: los ya enviados en
 * una comanda anterior no se duplican. La comanda guarda una instantánea
 * legible de los platos para que la Fase 6 pueda imprimirla sin
 * reconstruir el pedido ni recalcular el precio.
 */
export async function crearComanda(input: ComandaCreateInput, usuarioId: number): Promise<Comanda> {
  const db = getDb() as any;

  // Bloquear el pedido impide que dos envíos concurrentes generen dos
  // comandas con los mismos platos o números correlativos duplicados.
  return db.transaction(async (tx: any) => {
    const [pedido] = await tx
      .select()
      .from(schema.pedidos)
      .where(eq(schema.pedidos.id, input.pedidoId))
      .for('update')
      .limit(1);

    if (!pedido) {
      throw new PedidoNoEncontradoError(input.pedidoId);
    }

    if (pedido.estado === ESTADOS_PEDIDO.CANCELADO) {
      throw new PedidoNoEditableError(input.pedidoId, pedido.estado);
    }

    // Platos pendientes de enviar (no duplicar los ya enviados).
    const platosPendientes = await tx
      .select()
      .from(schema.platosIndividuales)
      .where(
        and(
          eq(schema.platosIndividuales.pedidoId, input.pedidoId),
          eq(schema.platosIndividuales.estado, 'borrador')
        )
      )
      .orderBy(schema.platosIndividuales.id);

    if (platosPendientes.length === 0) {
      throw new SinPlatosParaEnviarError(input.pedidoId);
    }

    // Número correlativo de comanda para el pedido.
    const [ultima] = await tx
      .select()
      .from(schema.comandas)
      .where(eq(schema.comandas.pedidoId, input.pedidoId))
      .orderBy(schema.comandas.numeroComanda, 'desc')
      .limit(1);

    const numeroComanda = ultima ? ultima.numeroComanda + 1 : 1;

    // Instantánea legible de los platos para impresión futura.
    // Se consultan los productos y modalidades realmente referenciados por
    // los platos pendientes (no los identificadores de los platos).
    const productosIds: number[] = [
      ...new Set<number>(platosPendientes.map((p: any) => p.productoId as number)),
    ];
    const modalidadesIds: number[] = [
      ...new Set<number>(platosPendientes.map((p: any) => p.modalidadId as number)),
    ];

    const productos = await tx
      .select({
        id: schema.productos.id,
        nombre: schema.productos.nombre,
      })
      .from(schema.productos)
      .where(inArray(schema.productos.id, productosIds));

    const modalidades = await tx
      .select({
        id: schema.modalidades.id,
        nombre: schema.modalidades.nombre,
      })
      .from(schema.modalidades)
      .where(inArray(schema.modalidades.id, modalidadesIds));

    const nombreProducto = new Map(productos.map((p: any) => [p.id, p.nombre]));
    const nombreModalidad = new Map(modalidades.map((m: any) => [m.id, m.nombre]));

    const platosSnapshot = platosPendientes.map((p: any) => ({
      platoId: p.id,
      producto: nombreProducto.get(p.productoId) ?? null,
      modalidad: nombreModalidad.get(p.modalidadId) ?? null,
      cantidad: p.cantidad,
      precioUnitarioCentavos: p.precioUnitarioCentavos,
      subtotalCentavos: p.subtotalCentavos,
      configuracion: p.configuracion,
    }));

    const [comanda] = await tx
      .insert(schema.comandas)
      .values({
        pedidoId: input.pedidoId,
        numeroComanda,
        estado: 'enviado',
        usuarioId,
        platosSnapshot,
      })
      .returning();

    // Marcar los platos enviados como no editables.
    await tx
      .update(schema.platosIndividuales)
      .set({ estado: 'en_cocina', actualizadoEn: new Date() })
      .where(
        and(
          eq(schema.platosIndividuales.pedidoId, input.pedidoId),
          eq(schema.platosIndividuales.estado, 'borrador')
        )
      );

    // Actualizar el estado del pedido según si quedan platos pendientes.
    const [restantes] = await tx
      .select()
      .from(schema.platosIndividuales)
      .where(
        and(
          eq(schema.platosIndividuales.pedidoId, input.pedidoId),
          eq(schema.platosIndividuales.estado, 'borrador')
        )
      )
      .limit(1);

    const nuevoEstado = restantes
      ? ESTADOS_PEDIDO.PARCIALMENTE_ENVIADO
      : ESTADOS_PEDIDO.ENVIADO_COCINA;

    await tx
      .update(schema.pedidos)
      .set({
        estado: nuevoEstado,
        version: pedido.version + 1,
        actualizadoEn: new Date(),
      })
      .where(eq(schema.pedidos.id, input.pedidoId));

    return comanda;
  });
}

export async function actualizarEstadoComanda(
  id: number,
  input: ComandaUpdateInput
): Promise<Comanda> {
  const db = getDb() as any;

  return db.transaction(async (tx: any) => {
    const [existente] = await tx
      .select()
      .from(schema.comandas)
      .where(eq(schema.comandas.id, id))
      .for('update')
      .limit(1);

    if (!existente) {
      throw new ComandaNoEncontradaError(id);
    }

    const permitidas = TRANSICIONES_COMANDA[existente.estado] ?? [];
    if (!permitidas.includes(input.estado)) {
      throw new TransicionInvalidaError(existente.estado, input.estado);
    }

    const [comanda] = await tx
      .update(schema.comandas)
      .set({
        estado: input.estado,
        actualizadoEn: new Date(),
      })
      .where(eq(schema.comandas.id, id))
      .returning();

    return comanda;
  });
}
