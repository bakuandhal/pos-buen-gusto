import { eq, and, sql } from 'drizzle-orm';
import { getDb, schema } from '../../db/connection';
import { esViolacionUnica } from '../../utils/dbErrors';
import {
  PedidoNoEncontradoError,
  PedidoNoEditableError,
  MesaNoEncontradaError,
  MesaOcupadaError,
  TransicionInvalidaError,
  ErrorNegocio,
} from '../../shared/errors/dominio';
import type { PedidoCreateInput, PedidoUpdateInput } from './schemas';

// ── Estados del pedido ──
export const ESTADOS_PEDIDO = {
  BORRADOR: 'borrador',
  CONFIRMADO: 'confirmado',
  PARCIALMENTE_ENVIADO: 'parcialmente_enviado',
  ENVIADO_COCINA: 'enviado_cocina',
  CANCELADO: 'cancelado',
} as const;

export type EstadoPedido = (typeof ESTADOS_PEDIDO)[keyof typeof ESTADOS_PEDIDO];

/** Transiciones válidas de estado del pedido. */
const TRANSICIONES: Record<string, string[]> = {
  [ESTADOS_PEDIDO.BORRADOR]: [ESTADOS_PEDIDO.CONFIRMADO, ESTADOS_PEDIDO.CANCELADO],
  [ESTADOS_PEDIDO.CONFIRMADO]: [ESTADOS_PEDIDO.CANCELADO],
  [ESTADOS_PEDIDO.PARCIALMENTE_ENVIADO]: [ESTADOS_PEDIDO.CANCELADO],
  [ESTADOS_PEDIDO.ENVIADO_COCINA]: [ESTADOS_PEDIDO.CANCELADO],
  [ESTADOS_PEDIDO.CANCELADO]: [],
};

/**
 * Estados en los que el pedido admite altas o cambios controlados.
 *
 * Un pedido ya enviado a cocina puede recibir platos nuevos (BR-18), pero
 * los platos ya enviados siguen siendo inmutables y se conservan en su
 * comanda histórica.
 */
const ESTADOS_EDITABLES: string[] = [
  ESTADOS_PEDIDO.BORRADOR,
  ESTADOS_PEDIDO.CONFIRMADO,
  ESTADOS_PEDIDO.PARCIALMENTE_ENVIADO,
  ESTADOS_PEDIDO.ENVIADO_COCINA,
];

export function esPedidoEditable(estado: string): boolean {
  return ESTADOS_EDITABLES.includes(estado);
}

export interface PlatoIndividual {
  id: number;
  pedidoId: number;
  productoId: number;
  modalidadId: number;
  cantidad: number;
  precioUnitarioCentavos: number;
  subtotalCentavos: number;
  configuracion: any;
  estado: string;
  revisionTarifaId: number | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface Pedido {
  id: number;
  mesaId: number | null;
  tipoServicio: string;
  estado: string;
  usuarioId: number;
  totalCentavos: number;
  version: number;
  creadoEn: string;
  actualizadoEn: string;
  platos: PlatoIndividual[];
}

function mapearPlato(p: any): PlatoIndividual {
  return {
    id: p.id,
    pedidoId: p.pedidoId,
    productoId: p.productoId,
    modalidadId: p.modalidadId,
    cantidad: p.cantidad,
    precioUnitarioCentavos: p.precioUnitarioCentavos,
    subtotalCentavos: p.subtotalCentavos,
    configuracion: p.configuracion,
    estado: p.estado,
    revisionTarifaId: p.revisionTarifaId,
    creadoEn: p.creadoEn,
    actualizadoEn: p.actualizadoEn,
  };
}

function mapearPedido(p: any, platos: PlatoIndividual[] = []): Pedido {
  return {
    id: p.id,
    mesaId: p.mesaId,
    tipoServicio: p.tipoServicio,
    estado: p.estado,
    usuarioId: p.usuarioId,
    totalCentavos: p.totalCentavos,
    version: p.version,
    creadoEn: p.creadoEn,
    actualizadoEn: p.actualizadoEn,
    platos,
  };
}

async function cargarPlatos(pedidoId: number, ejecutor?: unknown): Promise<PlatoIndividual[]> {
  const db = (ejecutor ?? getDb()) as any;
  const platos = await db
    .select()
    .from(schema.platosIndividuales)
    .where(eq(schema.platosIndividuales.pedidoId, pedidoId))
    .orderBy(schema.platosIndividuales.id);
  return platos.map(mapearPlato);
}

/** Recalcula el total del pedido a partir de sus platos y lo persiste. */
export async function recalcularTotalPedido(pedidoId: number, ejecutor?: unknown): Promise<number> {
  const db = (ejecutor ?? getDb()) as any;
  const platos = await db
    .select()
    .from(schema.platosIndividuales)
    .where(
      and(
        eq(schema.platosIndividuales.pedidoId, pedidoId),
        sql`${schema.platosIndividuales.estado} <> 'cancelado'`
      )
    );

  const total = platos.reduce((sum: number, p: any) => sum + p.subtotalCentavos, 0);

  await db
    .update(schema.pedidos)
    .set({ totalCentavos: total, actualizadoEn: new Date() })
    .where(eq(schema.pedidos.id, pedidoId));

  return total;
}

// ── Consultas ──
export async function listarPedidos(filtros?: {
  mesaId?: number;
  estado?: string;
  limite?: number;
}): Promise<Pedido[]> {
  const db = getDb() as any;

  const condiciones = [];
  if (filtros?.mesaId !== undefined) {
    condiciones.push(eq(schema.pedidos.mesaId, filtros.mesaId));
  }
  if (filtros?.estado) {
    condiciones.push(eq(schema.pedidos.estado, filtros.estado));
  }

  const pedidoBase = db.select().from(schema.pedidos);
  const pedidos = await (
    condiciones.length ? pedidoBase.where(and(...condiciones)) : pedidoBase
  ).orderBy(schema.pedidos.creadoEn, 'desc');

  const limitado = filtros?.limite ? pedidos.slice(0, filtros.limite) : pedidos;

  const resultado: Pedido[] = [];
  for (const p of limitado) {
    resultado.push({
      id: p.id,
      mesaId: p.mesaId,
      tipoServicio: p.tipoServicio,
      estado: p.estado,
      usuarioId: p.usuarioId,
      totalCentavos: p.totalCentavos,
      version: p.version,
      creadoEn: p.creadoEn,
      actualizadoEn: p.actualizadoEn,
      platos: await cargarPlatos(p.id),
    });
  }

  return resultado;
}

export async function obtenerPedido(id: number): Promise<Pedido | null> {
  const db = getDb() as any;
  const [pedido] = await db.select().from(schema.pedidos).where(eq(schema.pedidos.id, id)).limit(1);

  if (!pedido) return null;

  return {
    id: pedido.id,
    mesaId: pedido.mesaId,
    tipoServicio: pedido.tipoServicio,
    estado: pedido.estado,
    usuarioId: pedido.usuarioId,
    totalCentavos: pedido.totalCentavos,
    version: pedido.version,
    creadoEn: pedido.creadoEn,
    actualizadoEn: pedido.actualizadoEn,
    platos: await cargarPlatos(pedido.id),
  };
}

// ── Mutaciones ──
export async function crearPedido(input: PedidoCreateInput, usuarioId: number): Promise<Pedido> {
  const db = getDb() as any;

  if (input.tipoServicio === 'mesa' && !input.mesaId) {
    throw new ErrorNegocio('mesa_requerida', 'Un pedido de mesa debe indicar la mesa', 400, [
      { campo: 'mesaId', valor: '', problema: 'obligatorio para tipo mesa' },
    ]);
  }

  if (input.tipoServicio === 'para_llevar' && input.mesaId) {
    throw new ErrorNegocio('mesa_no_permitida', 'Un pedido para llevar no debe indicar mesa', 400, [
      { campo: 'mesaId', valor: String(input.mesaId), problema: 'no permitido para para llevar' },
    ]);
  }

  // La transacción y el bloqueo de la mesa serializan dos aperturas
  // concurrentes del mismo servicio, evitando pedidos duplicados.
  return db.transaction(async (tx: any) => {
    if (input.mesaId) {
      const [mesa] = await tx
        .select()
        .from(schema.mesas)
        .where(eq(schema.mesas.id, input.mesaId))
        .for('update')
        .limit(1);

      if (!mesa) {
        throw new MesaNoEncontradaError(input.mesaId);
      }

      // Prevenir dos servicios abiertos incompatibles en la misma mesa.
      const [pedidoAbierto] = await tx
        .select()
        .from(schema.pedidos)
        .where(
          and(eq(schema.pedidos.mesaId, input.mesaId), sql`${schema.pedidos.estado} <> 'cancelado'`)
        )
        .limit(1);

      if (pedidoAbierto) {
        throw new MesaOcupadaError(input.mesaId);
      }
    }

    let pedido: any;
    try {
      [pedido] = await tx
        .insert(schema.pedidos)
        .values({
          mesaId: input.mesaId || null,
          tipoServicio: input.tipoServicio,
          estado: ESTADOS_PEDIDO.BORRADOR,
          usuarioId,
          totalCentavos: 0,
          version: 1,
        })
        .returning();
    } catch (error: any) {
      // El índice único parcial protege incluso si el bloqueo no bastara.
      if (esViolacionUnica(error, 'pedidos_mesa_abierta_unique') && input.mesaId) {
        throw new MesaOcupadaError(input.mesaId);
      }
      throw error;
    }

    // Marcar la mesa como ocupada.
    if (input.mesaId) {
      await tx
        .update(schema.mesas)
        .set({ estado: 'ocupada', actualizadoEn: new Date() })
        .where(eq(schema.mesas.id, input.mesaId));
    }

    return mapearPedido(pedido, []);
  });
}

/**
 * Cancela un pedido dentro de una transacción ya abierta.
 *
 * - Cancela todos los platos aún no cancelados.
 * - Deja el total en 0 (los platos cancelados no se cobran).
 * - Libera la mesa asociada.
 * - La comanda ya enviada se conserva como histórico inmutable.
 */
async function cancelarPedidoEnTransaccion(tx: any, pedido: any): Promise<Pedido> {
  const [cancelado] = await tx
    .update(schema.pedidos)
    .set({
      estado: ESTADOS_PEDIDO.CANCELADO,
      totalCentavos: 0,
      version: pedido.version + 1,
      actualizadoEn: new Date(),
    })
    .where(eq(schema.pedidos.id, pedido.id))
    .returning();

  await tx
    .update(schema.platosIndividuales)
    .set({ estado: 'cancelado', actualizadoEn: new Date() })
    .where(
      and(
        eq(schema.platosIndividuales.pedidoId, pedido.id),
        sql`${schema.platosIndividuales.estado} <> 'cancelado'`
      )
    );

  if (pedido.mesaId) {
    await tx
      .update(schema.mesas)
      .set({ estado: 'disponible', comensales: 0, actualizadoEn: new Date() })
      .where(eq(schema.mesas.id, pedido.mesaId));
  }

  return mapearPedido(cancelado, await cargarPlatos(pedido.id, tx));
}

export async function actualizarEstadoPedido(
  id: number,
  input: PedidoUpdateInput
): Promise<Pedido | null> {
  const db = getDb() as any;

  return db.transaction(async (tx: any) => {
    const [pedido] = await tx
      .select()
      .from(schema.pedidos)
      .where(eq(schema.pedidos.id, id))
      .for('update')
      .limit(1);

    if (!pedido) {
      throw new PedidoNoEncontradoError(id);
    }

    const destino = input.estado as EstadoPedido;
    const permitidas = TRANSICIONES[pedido.estado] ?? [];

    if (!permitidas.includes(destino)) {
      throw new TransicionInvalidaError(pedido.estado, destino);
    }

    // Cancelar por cambio de estado debe tener los mismos efectos que DELETE:
    // cancelar platos, total 0 y liberar la mesa.
    if (destino === ESTADOS_PEDIDO.CANCELADO) {
      return cancelarPedidoEnTransaccion(tx, pedido);
    }

    const [actualizado] = await tx
      .update(schema.pedidos)
      .set({
        estado: destino,
        version: pedido.version + 1,
        actualizadoEn: new Date(),
      })
      .where(eq(schema.pedidos.id, id))
      .returning();

    return mapearPedido(actualizado, await cargarPlatos(id, tx));
  });
}

export async function cancelarPedido(id: number): Promise<Pedido | null> {
  const db = getDb() as any;

  return db.transaction(async (tx: any) => {
    const [pedido] = await tx
      .select()
      .from(schema.pedidos)
      .where(eq(schema.pedidos.id, id))
      .for('update')
      .limit(1);

    if (!pedido) {
      throw new PedidoNoEncontradoError(id);
    }

    if (pedido.estado === ESTADOS_PEDIDO.CANCELADO) {
      throw new TransicionInvalidaError(pedido.estado, ESTADOS_PEDIDO.CANCELADO);
    }

    return cancelarPedidoEnTransaccion(tx, pedido);
  });
}

/** Obtiene el pedido bloqueando la fila para serializar operaciones concurrentes. */
export async function obtenerPedidoBloqueado(
  id: number,
  ejecutor?: unknown
): Promise<{ pedido: any; platos: PlatoIndividual[] }> {
  const db = (ejecutor ?? getDb()) as any;

  const [pedido] = await db
    .select()
    .from(schema.pedidos)
    .where(eq(schema.pedidos.id, id))
    .for('update')
    .limit(1);

  if (!pedido) {
    throw new PedidoNoEncontradoError(id);
  }

  return { pedido, platos: await cargarPlatos(id, db) };
}

export { PedidoNoEditableError };
