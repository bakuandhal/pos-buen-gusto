import { eq } from 'drizzle-orm';
import { getDb, schema } from '../../db/connection';
import { cotizarPrecio, PrecioValidacionError } from '../pricing/service';
import {
  PedidoNoEditableError,
  PlatoNoEncontradoError,
  PlatoNoEditableError,
} from '../../shared/errors/dominio';
import {
  ESTADOS_PEDIDO,
  esPedidoEditable,
  recalcularTotalPedido,
  obtenerPedidoBloqueado,
} from '../pedidos/service';
import type { PlatoCreateInput, PlatoUpdateInput } from './schemas';

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

/**
 * Crea un plato dentro de un pedido abierto.
 *
 * El precio NO se toma del cliente: se obtiene del motor de precios de la
 * Fase 4 (`cotizarPrecio`), que valida la configuración contra las reglas
 * vigentes de la modalidad y devuelve el desglose y el total.
 */
export async function crearPlato(
  pedidoId: number,
  input: PlatoCreateInput
): Promise<PlatoIndividual> {
  const db = getDb() as any;

  // Bloquear el pedido serializa las altas concurrentes y el recálculo del
  // total, evitando que dos platos simultáneos dejen un total incorrecto.
  return db.transaction(async (tx: any) => {
    const { pedido } = await obtenerPedidoBloqueado(pedidoId, tx);

    if (!esPedidoEditable(pedido.estado)) {
      throw new PedidoNoEditableError(pedidoId, pedido.estado);
    }

    // Cotizar con el motor real de precios (Fase 4). Es la única autoridad.
    const cotizacion = await cotizarPrecio(
      {
        productoId: input.productoId,
        modalidadId: input.modalidadId,
        opcionesSeleccionadas: input.opcionesSeleccionadas ?? [],
        sustituciones: input.sustituciones ?? [],
        adicionales: input.adicionales ?? [],
      },
      tx
    );

    const [plato] = await tx
      .insert(schema.platosIndividuales)
      .values({
        pedidoId,
        productoId: input.productoId,
        modalidadId: input.modalidadId,
        cantidad: input.cantidad,
        precioUnitarioCentavos: cotizacion.totalCentavos,
        subtotalCentavos: cotizacion.totalCentavos * input.cantidad,
        configuracion: {
          ...input.configuracion,
          opcionesSeleccionadas: input.opcionesSeleccionadas ?? [],
          sustituciones: input.sustituciones ?? [],
          adicionales: input.adicionales ?? [],
          desglose: cotizacion,
        },
        revisionTarifaId: null,
        estado: 'borrador',
      })
      .returning();

    await recalcularTotalPedido(pedidoId, tx);

    // Un pedido ya enviado vuelve a un estado parcial mientras tenga platos
    // nuevos pendientes de enviar.
    if (pedido.estado === ESTADOS_PEDIDO.ENVIADO_COCINA) {
      await tx
        .update(schema.pedidos)
        .set({
          estado: ESTADOS_PEDIDO.PARCIALMENTE_ENVIADO,
          version: pedido.version + 1,
          actualizadoEn: new Date(),
        })
        .where(eq(schema.pedidos.id, pedidoId));
    }

    return mapear(plato);
  });
}

function mapear(p: any): PlatoIndividual {
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

export async function obtenerPlato(id: number): Promise<PlatoIndividual | null> {
  const db = getDb() as any;
  const [plato] = await db
    .select()
    .from(schema.platosIndividuales)
    .where(eq(schema.platosIndividuales.id, id))
    .limit(1);
  return plato ? mapear(plato) : null;
}

/**
 * Actualiza un plato. Solo se admiten platos en estado `borrador`;
 * un plato ya enviado a cocina no se modifica de forma silenciosa.
 */
export async function actualizarPlato(
  id: number,
  input: PlatoUpdateInput
): Promise<PlatoIndividual | null> {
  const db = getDb() as any;

  return db.transaction(async (tx: any) => {
    // Identificar el pedido sin bloquear; luego se bloquea el pedido y el
    // plato en ese orden para mantener un orden de bloqueo consistente.
    const [referencia] = await tx
      .select({ pedidoId: schema.platosIndividuales.pedidoId })
      .from(schema.platosIndividuales)
      .where(eq(schema.platosIndividuales.id, id))
      .limit(1);

    if (!referencia) {
      throw new PlatoNoEncontradoError(id);
    }

    await tx
      .select()
      .from(schema.pedidos)
      .where(eq(schema.pedidos.id, referencia.pedidoId))
      .for('update')
      .limit(1);

    const [existente] = await tx
      .select()
      .from(schema.platosIndividuales)
      .where(eq(schema.platosIndividuales.id, id))
      .for('update')
      .limit(1);

    if (!existente) {
      throw new PlatoNoEncontradoError(id);
    }

    if (existente.estado !== 'borrador') {
      throw new PlatoNoEditableError(id, existente.estado);
    }

    const configuracionActual = existente.configuracion ?? {};
    let precioUnitario = existente.precioUnitarioCentavos;
    let configuracion = configuracionActual;

    const cambioConfiguracion =
      input.modalidadId !== undefined ||
      input.configuracion !== undefined ||
      input.opcionesSeleccionadas !== undefined ||
      input.sustituciones !== undefined ||
      input.adicionales !== undefined;

    if (cambioConfiguracion) {
      // Conservar las selecciones previas que no se envíen en la petición.
      const opcionesSeleccionadas =
        input.opcionesSeleccionadas ?? configuracionActual.opcionesSeleccionadas ?? [];
      const sustituciones = input.sustituciones ?? configuracionActual.sustituciones ?? [];
      const adicionales = input.adicionales ?? configuracionActual.adicionales ?? [];

      const cotizacion = await cotizarPrecio(
        {
          productoId: existente.productoId,
          modalidadId: input.modalidadId ?? existente.modalidadId,
          opcionesSeleccionadas,
          sustituciones,
          adicionales,
        },
        tx
      );

      precioUnitario = cotizacion.totalCentavos;
      configuracion = {
        ...configuracionActual,
        ...(input.configuracion ?? {}),
        opcionesSeleccionadas,
        sustituciones,
        adicionales,
        desglose: cotizacion,
      };
    }

    const cantidad = input.cantidad ?? existente.cantidad;

    const [plato] = await tx
      .update(schema.platosIndividuales)
      .set({
        ...(input.cantidad !== undefined && { cantidad }),
        ...(input.modalidadId !== undefined && { modalidadId: input.modalidadId }),
        ...(cambioConfiguracion && {
          precioUnitarioCentavos: precioUnitario,
          configuracion,
        }),
        subtotalCentavos: precioUnitario * cantidad,
        actualizadoEn: new Date(),
      })
      .where(eq(schema.platosIndividuales.id, id))
      .returning();

    await recalcularTotalPedido(plato.pedidoId, tx);

    return mapear(plato);
  });
}

/**
 * Elimina un plato del pedido. Solo se admiten platos en estado `borrador`.
 */
export async function eliminarPlato(id: number): Promise<PlatoIndividual | null> {
  const db = getDb() as any;

  return db.transaction(async (tx: any) => {
    const [referencia] = await tx
      .select({ pedidoId: schema.platosIndividuales.pedidoId })
      .from(schema.platosIndividuales)
      .where(eq(schema.platosIndividuales.id, id))
      .limit(1);

    if (!referencia) {
      throw new PlatoNoEncontradoError(id);
    }

    await tx
      .select()
      .from(schema.pedidos)
      .where(eq(schema.pedidos.id, referencia.pedidoId))
      .for('update')
      .limit(1);

    const [existente] = await tx
      .select()
      .from(schema.platosIndividuales)
      .where(eq(schema.platosIndividuales.id, id))
      .for('update')
      .limit(1);

    if (!existente) {
      throw new PlatoNoEncontradoError(id);
    }

    if (existente.estado !== 'borrador') {
      throw new PlatoNoEditableError(id, existente.estado);
    }

    const [plato] = await tx
      .delete(schema.platosIndividuales)
      .where(eq(schema.platosIndividuales.id, id))
      .returning();

    await recalcularTotalPedido(existente.pedidoId, tx);

    return mapear(plato);
  });
}

export { PrecioValidacionError, obtenerPedidoBloqueado };
