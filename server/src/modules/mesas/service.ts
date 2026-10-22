import { and, eq, sql } from 'drizzle-orm';
import { getDb, schema } from '../../db/connection';
import { esViolacionUnica } from '../../utils/dbErrors';
import { MesaConPedidoAbiertoError, MesaNumeroDuplicadoError } from '../../shared/errors/dominio';
import type { MesaCreateInput, MesaUpdateInput, MesaEstadoInput } from './schemas';

export interface Mesa {
  id: number;
  numero: number;
  estado: string;
  comensales: number;
  ultimaActualizacion: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export async function listarMesas(): Promise<Mesa[]> {
  const db = getDb() as any;
  return await db.select().from(schema.mesas).orderBy(schema.mesas.numero);
}

export async function obtenerMesa(id: number): Promise<Mesa | null> {
  const db = getDb() as any;
  const [mesa] = await db.select().from(schema.mesas).where(eq(schema.mesas.id, id)).limit(1);
  return mesa || null;
}

export async function crearMesa(input: MesaCreateInput): Promise<Mesa> {
  const db = getDb() as any;
  try {
    const [mesa] = await db
      .insert(schema.mesas)
      .values({
        numero: input.numero,
        estado: 'disponible',
        comensales: 0,
      })
      .returning();
    return mesa;
  } catch (error: any) {
    // Violación de unicidad del número de mesa: es un conflicto de negocio,
    // no un error interno del servidor.
    if (esViolacionUnica(error)) {
      throw new MesaNumeroDuplicadoError(input.numero);
    }
    throw error;
  }
}

export async function actualizarMesa(id: number, input: MesaUpdateInput): Promise<Mesa | null> {
  const db = getDb() as any;
  const [mesa] = await db
    .update(schema.mesas)
    .set({
      ...(input.estado !== undefined && { estado: input.estado }),
      ...(input.comensales !== undefined && { comensales: input.comensales }),
      actualizadoEn: new Date(),
    })
    .where(eq(schema.mesas.id, id))
    .returning();
  return mesa || null;
}

export async function cambiarEstadoMesa(id: number, input: MesaEstadoInput): Promise<Mesa | null> {
  const db = getDb() as any;
  const [mesa] = await db
    .update(schema.mesas)
    .set({
      estado: input.estado,
      actualizadoEn: new Date(),
    })
    .where(eq(schema.mesas.id, id))
    .returning();
  return mesa || null;
}

export async function desactivarMesa(id: number): Promise<Mesa | null> {
  const db = getDb() as any;

  return db.transaction(async (tx: any) => {
    const [mesa] = await tx
      .select()
      .from(schema.mesas)
      .where(eq(schema.mesas.id, id))
      .for('update')
      .limit(1);

    if (!mesa) return null;

    // No liberar una mesa con un servicio abierto: dejaría el pedido huérfano.
    const [pedidoAbierto] = await tx
      .select()
      .from(schema.pedidos)
      .where(and(eq(schema.pedidos.mesaId, id), sql`${schema.pedidos.estado} <> 'cancelado'`))
      .limit(1);

    if (pedidoAbierto) {
      throw new MesaConPedidoAbiertoError(id);
    }

    const [actualizada] = await tx
      .update(schema.mesas)
      .set({
        estado: 'disponible',
        comensales: 0,
        actualizadoEn: new Date(),
      })
      .where(eq(schema.mesas.id, id))
      .returning();

    return actualizada;
  });
}
