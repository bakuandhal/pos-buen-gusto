import { eq } from 'drizzle-orm';
import { getDb, schema } from '../../db/connection';
import type {
  ComandaCreateInput,
  ComandaUpdateInput,
} from './schemas';

export interface Comanda {
  id: number;
  pedidoId: number;
  numeroComanda: number;
  estado: string;
  usuarioId: number;
  creadoEn: string;
  actualizadoEn: string;
}

export async function listarComandas(): Promise<Comanda[]> {
  const db = getDb() as any;
  return await db
    .select()
    .from(schema.comandas)
    .orderBy(schema.comandas.numeroComanda);
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

export async function crearComanda(input: ComandaCreateInput): Promise<Comanda> {
  const db = getDb() as any;

  // Obtener el siguiente número de comanda para el pedido
  const [ultima] = await db
    .select()
    .from(schema.comandas)
    .where(eq(schema.comandas.pedidoId, input.pedidoId))
    .orderBy(schema.comandas.numeroComanda, 'desc')
    .limit(1);

  const numeroComanda = ultima ? ultima.numeroComanda + 1 : 1;

  const [comanda] = await db
    .insert(schema.comandas)
    .values({
      pedidoId: input.pedidoId,
      numeroComanda,
      estado: 'borrador',
    })
    .returning();

  return comanda;
}

export async function actualizarEstadoComanda(
  id: number,
  input: ComandaUpdateInput
): Promise<Comanda | null> {
  const db = getDb() as any;
  const [comanda] = await db
    .update(schema.comandas)
    .set({
      estado: input.estado,
      actualizadoEn: new Date(),
    })
    .where(eq(schema.comandas.id, id))
    .returning();

  return comanda || null;
}
