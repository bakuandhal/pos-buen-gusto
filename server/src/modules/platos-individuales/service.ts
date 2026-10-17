import { eq } from 'drizzle-orm';
import { getDb, schema } from '../../db/connection';
import type {
  PlatoCreateInput,
  PlatoUpdateInput,
} from './schemas';

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
  productoNombre?: string;
  modalidadNombre?: string;
}

export async function crearPlato(
  pedidoId: number,
  input: PlatoCreateInput
): Promise<PlatoIndividual> {
  const db = getDb() as any;

  const [modalidad] = await db
    .select()
    .from(schema.modalidades)
    .where(eq(schema.modalidades.id, input.modalidadId))
    .limit(1);

  if (!modalidad) {
    throw new Error('Modalidad no encontrada');
  }

  const [producto] = await db
    .select()
    .from(schema.productos)
    .where(eq(schema.productos.id, input.productoId))
    .limit(1);

  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  const [plato] = await db
    .insert(schema.platosIndividuales)
    .values({
      pedidoId,
      productoId: input.productoId,
      modalidadId: input.modalidadId,
      cantidad: input.cantidad,
      precioUnitarioCentavos: modalidad.precioBaseCentavos,
      subtotalCentavos: modalidad.precioBaseCentavos * input.cantidad,
      configuracion: {
        modalidad: modalidad.nombre,
        sopa: modalidad.incluyeSopa ? 'incluida' : 'omitida',
        proteina: '',
        principio: '',
        acompañamientos: [],
        extras: [],
        observaciones: '',
      },
      revisionTarifaId: null,
      estado: 'borrador',
    })
    .returning();

  return {
    id: plato.id,
    pedidoId: plato.pedidoId,
    productoId: plato.productoId,
    modalidadId: plato.modalidadId,
    cantidad: plato.cantidad,
    precioUnitarioCentavos: plato.precioUnitarioCentavos,
    subtotalCentavos: plato.subtotalCentavos,
    configuracion: plato.configuracion,
    estado: plato.estado,
    revisionTarifaId: plato.revisionTarifaId,
    creadoEn: plato.creadoEn,
    actualizadoEn: plato.actualizadoEn,
    productoNombre: producto.nombre,
    modalidadNombre: modalidad.nombre,
  };
}

export async function obtenerPlato(id: number): Promise<PlatoIndividual | null> {
  const db = getDb() as any;
  const [plato] = await db
    .select()
    .from(schema.platosIndividuales)
    .where(eq(schema.platosIndividuales.id, id))
    .limit(1);

  if (!plato) return null;

  return {
    id: plato.id,
    pedidoId: plato.pedidoId,
    productoId: plato.productoId,
    modalidadId: plato.modalidadId,
    cantidad: plato.cantidad,
    precioUnitarioCentavos: plato.precioUnitarioCentavos,
    subtotalCentavos: plato.subtotalCentavos,
    configuracion: plato.configuracion,
    estado: plato.estado,
    revisionTarifaId: plato.revisionTarifaId,
    creadoEn: plato.creadoEn,
    actualizadoEn: plato.actualizadoEn,
  };
}

export async function actualizarPlato(
  id: number,
  input: PlatoUpdateInput
): Promise<PlatoIndividual | null> {
  const db = getDb() as any;

  const [platoExistente] = await db
    .select()
    .from(schema.platosIndividuales)
    .where(eq(schema.platosIndividuales.id, id))
    .limit(1);

  if (!platoExistente) return null;

  const [plato] = await db
    .update(schema.platosIndividuales)
    .set({
      ...(input.cantidad !== undefined && { cantidad: input.cantidad }),
      ...(input.cantidad !== undefined && {
        subtotalCentavos:
          platoExistente.precioUnitarioCentavos * input.cantidad,
      }),
      ...(input.estado !== undefined && { estado: input.estado }),
      actualizadoEn: new Date(),
    })
    .where(eq(schema.platosIndividuales.id, id))
    .returning();

  if (!plato) return null;

  return {
    id: plato.id,
    pedidoId: plato.pedidoId,
    productoId: plato.productoId,
    modalidadId: plato.modalidadId,
    cantidad: plato.cantidad,
    precioUnitarioCentavos: plato.precioUnitarioCentavos,
    subtotalCentavos: plato.subtotalCentavos,
    configuracion: plato.configuracion,
    estado: plato.estado,
    revisionTarifaId: plato.revisionTarifaId,
    creadoEn: plato.creadoEn,
    actualizadoEn: plato.actualizadoEn,
  };
}

export async function eliminarPlato(id: number): Promise<PlatoIndividual | null> {
  const db = getDb() as any;
  const [plato] = await db
    .delete(schema.platosIndividuales)
    .where(eq(schema.platosIndividuales.id, id))
    .returning();

  if (!plato) return null;

  return {
    id: plato.id,
    pedidoId: plato.pedidoId,
    productoId: plato.productoId,
    modalidadId: plato.modalidadId,
    cantidad: plato.cantidad,
    precioUnitarioCentavos: plato.precioUnitarioCentavos,
    subtotalCentavos: plato.subtotalCentavos,
    configuracion: plato.configuracion,
    estado: plato.estado,
    revisionTarifaId: plato.revisionTarifaId,
    creadoEn: plato.creadoEn,
    actualizadoEn: plato.actualizadoEn,
  };
}
