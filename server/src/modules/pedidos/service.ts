import { eq } from 'drizzle-orm';
import {
  getDb,
  schema,
} from '../../db/connection';
import type {
  PedidoCreateInput,
  PedidoUpdateInput,
} from './schemas';

export interface PlatoIndividual {
  id: number;
  platoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  configuracion: {
    modalidad: string;
    sopa: string;
    proteina: string;
    principio: string;
    acompañamientos: string[];
    extras: string[];
    observaciones?: string;
  };
  estado: string;
}

export interface Pedido {
  id: number;
  mesaId: number | null;
  tipoServicio: string;
  estado: string;
  usuarioId: number;
  totalCentavos: number;
  creadoEn: string;
  actualizadoEn: string;
  platos: PlatoIndividual[];
}

// ── Pedidos ──
export async function listarPedidos(mesaId?: number): Promise<Pedido[]> {
  const db = getDb() as any;

  const pedidos = await db
    .select()
    .from(schema.pedidos)
    .where(mesaId ? eq(schema.pedidos.mesaId, mesaId) : undefined);

  const resultado = [];
  for (const p of pedidos) {
    const platos = await db
      .select()
      .from(schema.platosIndividuales)
      .where(eq(schema.platosIndividuales.pedidoId, p.id));

    resultado.push({
      id: p.id,
      mesaId: p.mesaId,
      tipoServicio: p.tipoServicio,
      estado: p.estado,
      usuarioId: p.usuarioId,
      totalCentavos: p.totalCentavos,
      creadoEn: p.creadoEn,
      actualizadoEn: p.actualizadoEn,
      platos: platos,
    });
  }

  return resultado;
}

export async function obtenerPedido(id: number): Promise<Pedido | null> {
  const db = getDb() as any;
  const [pedido] = await db
    .select()
    .from(schema.pedidos)
    .where(eq(schema.pedidos.id, id))
    .limit(1);

  if (!pedido) return null;

  const platos = await db
    .select()
    .from(schema.platosIndividuales)
    .where(eq(schema.platosIndividuales.pedidoId, pedido.id));

  return {
    id: pedido.id,
    mesaId: pedido.mesaId,
    tipoServicio: pedido.tipoServicio,
    estado: pedido.estado,
    usuarioId: pedido.usuarioId,
    totalCentavos: pedido.totalCentavos,
    creadoEn: pedido.creadoEn,
    actualizadoEn: pedido.actualizadoEn,
    platos: platos,
  };
}

export async function crearPedido(input: PedidoCreateInput): Promise<Pedido> {
  const db = getDb() as any;

  const [pedido] = await db
    .insert(schema.pedidos)
    .values({
      mesaId: input.mesaId || null,
      tipoServicio: input.tipoServicio,
      estado: 'borrador',
      totalCentavos: 0,
    })
    .returning();

  return {
    id: pedido.id,
    mesaId: pedido.mesaId,
    tipoServicio: pedido.tipoServicio,
    estado: pedido.estado,
    usuarioId: pedido.usuarioId,
    totalCentavos: pedido.totalCentavos,
    creadoEn: pedido.creadoEn,
    actualizadoEn: pedido.actualizadoEn,
    platos: [],
  };
}

export async function actualizarEstadoPedido(
  id: number,
  input: PedidoUpdateInput
): Promise<Pedido | null> {
  const db = getDb() as any;
  const [pedido] = await db
    .update(schema.pedidos)
    .set({
      estado: input.estado,
      actualizadoEn: new Date(),
    })
    .where(eq(schema.pedidos.id, id))
    .returning();

  if (!pedido) return null;

  const platos = await db
    .select()
    .from(schema.platosIndividuales)
    .where(eq(schema.platosIndividuales.pedidoId, pedido.id));

  return {
    id: pedido.id,
    mesaId: pedido.mesaId,
    tipoServicio: pedido.tipoServicio,
    estado: pedido.estado,
    usuarioId: pedido.usuarioId,
    totalCentavos: pedido.totalCentavos,
    creadoEn: pedido.creadoEn,
    actualizadoEn: pedido.actualizadoEn,
    platos: platos,
  };
}

export async function cancelarPedido(id: number): Promise<Pedido | null> {
  const db = getDb() as any;
  const [pedido] = await db
    .update(schema.pedidos)
    .set({
      estado: 'cancelado',
      actualizadoEn: new Date(),
    })
    .where(eq(schema.pedidos.id, id))
    .returning();

  if (!pedido) return null;

  const platos = await db
    .select()
    .from(schema.platosIndividuales)
    .where(eq(schema.platosIndividuales.pedidoId, pedido.id));

  return {
    id: pedido.id,
    mesaId: pedido.mesaId,
    tipoServicio: pedido.tipoServicio,
    estado: pedido.estado,
    usuarioId: pedido.usuarioId,
    totalCentavos: pedido.totalCentavos,
    creadoEn: pedido.creadoEn,
    actualizadoEn: pedido.actualizadoEn,
    platos: platos,
  };
}
