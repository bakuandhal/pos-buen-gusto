import { eq, and } from 'drizzle-orm';
import { getDb, schema } from '../../db/connection';
import type { PricingQuoteRequest } from './schemas';

// ── Tipos de respuesta ──
export interface PrecioDesglose {
  productoId: number;
  productoNombre: string;
  modalidadId: number;
  modalidadNombre: string;
  precioBaseCentavos: number;
  opcionesIncluidas: {
    opcionId: number;
    nombre: string;
  }[];
  sustitucionesAplicadas: {
    opcionOriginalId: number;
    opcionOriginalNombre: string;
    opcionSustitutaId: number;
    opcionSustitutaNombre: string;
    ajustePrecioCentavos: number;
  }[];
  adicionales: {
    adicionalId: number;
    nombre: string;
    precioUnitarioCentavos: number;
    cantidad: number;
    subtotalCentavos: number;
  }[];
  totalCentavos: number;
}

// ── Errores de validación ──
export class PrecioValidacionError extends Error {
  public codigo: string;
  public detalles: Record<string, string>[];

  constructor(codigo: string, mensaje: string, detalles: Record<string, string>[] = []) {
    super(mensaje);
    this.name = 'PrecioValidacionError';
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

/**
 * Motor de precios - Calcula el importe de un producto configurado
 * según las reglas de tarifa vigentes.
 */
export async function cotizarPrecio(input: PricingQuoteRequest): Promise<PrecioDesglose> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const detalles: Record<string, string>[] = [];

  // ── 1. Validar producto existe y está activo ──
  const [producto] = await db
    .select()
    .from(schema.productos)
    .where(eq(schema.productos.id, input.productoId))
    .limit(1);

  if (!producto) {
    throw new PrecioValidacionError('producto_no_encontrado', 'El producto no existe', [
      { campo: 'productoId', valor: String(input.productoId), problema: 'no existe' },
    ]);
  }

  if (!producto.estaActivo) {
    throw new PrecioValidacionError('producto_inactivo', 'El producto no está activo', [
      { campo: 'productoId', valor: String(input.productoId), problema: 'inactivo' },
    ]);
  }

  // ── 2. Validar modalidad pertenece al producto y está activa ──
  const [modalidad] = await db
    .select()
    .from(schema.modalidades)
    .where(
      and(
        eq(schema.modalidades.id, input.modalidadId),
        eq(schema.modalidades.productoId, input.productoId)
      )
    )
    .limit(1);

  if (!modalidad) {
    throw new PrecioValidacionError(
      'modalidad_no_valida',
      'La modalidad no pertenece al producto o no existe',
      [
        {
          campo: 'modalidadId',
          valor: String(input.modalidadId),
          problema: 'no pertenece al producto',
        },
        { campo: 'productoId', valor: String(input.productoId), problema: '' },
      ]
    );
  }

  if (!modalidad.estaActivo) {
    throw new PrecioValidacionError('modalidad_inactiva', 'La modalidad no está activa', [
      { campo: 'modalidadId', valor: String(input.modalidadId), problema: 'inactiva' },
    ]);
  }

  // ── 3. Validar disponibilidad temporal de la modalidad ──
  const ahora = new Date();
  if (modalidad.disponibleDesde && new Date(modalidad.disponibleDesde) > ahora) {
    throw new PrecioValidacionError(
      'modalidad_no_disponible',
      'La modalidad no está disponible todavía',
      [{ campo: 'modalidadId', valor: String(input.modalidadId), problema: 'no disponible aún' }]
    );
  }
  if (modalidad.disponibleHasta && new Date(modalidad.disponibleHasta) < ahora) {
    throw new PrecioValidacionError(
      'modalidad_no_disponible',
      'La modalidad ya no está disponible',
      [{ campo: 'modalidadId', valor: String(input.modalidadId), problema: 'ya expirada' }]
    );
  }

  // ── 4. Obtener grupos de opciones del producto ──
  const gruposOpciones = await db
    .select()
    .from(schema.gruposOpciones)
    .where(eq(schema.gruposOpciones.productoId, input.productoId));

  // ── 5. Obtener opciones incluidas en la modalidad ──
  const opcionesIncluidasResult = await db
    .select({
      id: schema.opciones.id,
      nombre: schema.opciones.nombre,
    })
    .from(schema.opcionesIncluidasModalidad)
    .innerJoin(schema.opciones, eq(schema.opcionesIncluidasModalidad.opcionId, schema.opciones.id))
    .where(eq(schema.opcionesIncluidasModalidad.modalidadId, input.modalidadId));

  // ── 6. Obtener opciones disponibles (activas) del producto ──
  const opcionesDisponiblesMap = new Map<number, any>();
  for (const grupo of gruposOpciones) {
    const opcionesGrupo = await db
      .select()
      .from(schema.opciones)
      .where(eq(schema.opciones.grupoId, grupo.id));
    for (const opcion of opcionesGrupo) {
      if (opcion.estaActivo) {
        opcionesDisponiblesMap.set(opcion.id, opcion);
      }
    }
  }

  // ── 7. Validar opciones seleccionadas ──
  const opcionesSeleccionadasMap = new Map<number, number>(); // opcionId -> cantidad (siempre 1 para opciones simples)
  for (const opcionId of input.opcionesSeleccionadas) {
    const opcion = opcionesDisponiblesMap.get(opcionId);
    if (!opcion) {
      throw new PrecioValidacionError(
        'opcion_no_valida',
        `La opción ${opcionId} no está disponible para este producto`,
        [{ campo: 'opcionesSeleccionadas', valor: String(opcionId), problema: 'no disponible' }]
      );
    }
    detalles.push({ campo: 'opcionesSeleccionadas', valor: String(opcionId), problema: 'ok' });
    opcionesSeleccionadasMap.set(opcionId, 1);
  }

  // ── 8. Validar mínimos y máximos por grupo ──
  for (const grupo of gruposOpciones) {
    const opcionesDelGrupo = await db
      .select()
      .from(schema.opciones)
      .where(eq(schema.opciones.grupoId, grupo.id));

    const seleccionadasEnGrupo = opcionesDelGrupo.filter((o: any) =>
      opcionesSeleccionadasMap.has(o.id)
    ).length;

    if (seleccionadasEnGrupo < grupo.cantidadMinima) {
      throw new PrecioValidacionError(
        'minimo_no_cumplido',
        `El grupo "${grupo.nombre}" requiere al menos ${grupo.cantidadMinima} selección(es)`,
        [{ campo: 'grupoId', valor: String(grupo.id), problema: 'mínimo no cumplido' }]
      );
    }

    if (seleccionadasEnGrupo > grupo.cantidadMaxima) {
      throw new PrecioValidacionError(
        'maximo_excedido',
        `El grupo "${grupo.nombre}" permite máximo ${grupo.cantidadMaxima} selección(es)`,
        [{ campo: 'grupoId', valor: String(grupo.id), problema: 'máximo excedido' }]
      );
    }
  }

  // ── 9. Validar y procesar sustituciones ──
  const sustitucionesModalidad = await db
    .select()
    .from(schema.sustituciones)
    .where(eq(schema.sustituciones.modalidadId, input.modalidadId));

  const sustitucionesMap = new Map<string, any>(); // "originalId:sustitutaId" -> sustitución
  for (const s of sustitucionesModalidad) {
    if (s.estaActivo) {
      sustitucionesMap.set(`${s.opcionOriginalId}:${s.opcionSustitutaId}`, s);
    }
  }

  const sustitucionesAplicadas: PrecioDesglose['sustitucionesAplicadas'] = [];
  let ajusteSustitucionesTotal = 0;

  for (const sustitucionInput of input.sustituciones) {
    const sustitucion = sustitucionesMap.get(
      `${sustitucionInput.opcionOriginalId}:${sustitucionInput.opcionSustitutaId}`
    );

    if (!sustitucion) {
      throw new PrecioValidacionError(
        'sustitucion_no_valida',
        'La sustitución no está autorizada para esta modalidad',
        [
          {
            campo: 'opcionOriginalId',
            valor: String(sustitucionInput.opcionOriginalId),
            problema: '',
          },
          {
            campo: 'opcionSustitutaId',
            valor: String(sustitucionInput.opcionSustitutaId),
            problema: '',
          },
        ]
      );
    }

    // Verificar que la opción original esté seleccionada
    if (!opcionesSeleccionadasMap.has(sustitucionInput.opcionOriginalId)) {
      throw new PrecioValidacionError(
        'sustitucion_sin_opcion_original',
        'No se puede sustituir una opción que no está seleccionada',
        [
          {
            campo: 'opcionOriginalId',
            valor: String(sustitucionInput.opcionOriginalId),
            problema: 'no seleccionada',
          },
        ]
      );
    }

    // Verificar que la opción sustituta exista y esté activa
    const opcionSustituta = opcionesDisponiblesMap.get(sustitucionInput.opcionSustitutaId);
    if (!opcionSustituta) {
      throw new PrecioValidacionError(
        'opcion_sustituta_no_valida',
        'La opción sustituta no está disponible',
        [
          {
            campo: 'opcionSustitutaId',
            valor: String(sustitucionInput.opcionSustitutaId),
            problema: 'no disponible',
          },
        ]
      );
    }

    sustitucionesAplicadas.push({
      opcionOriginalId: sustitucionInput.opcionOriginalId,
      opcionOriginalNombre: '', // Se llena abajo
      opcionSustitutaId: sustitucionInput.opcionSustitutaId,
      opcionSustitutaNombre: opcionSustituta.nombre,
      ajustePrecioCentavos: sustitucion.ajustePrecioCentavos,
    });

    ajusteSustitucionesTotal += sustitucion.ajustePrecioCentavos;

    // La opción original deja de contarse como seleccionada, la sustituta sí
    opcionesSeleccionadasMap.delete(sustitucionInput.opcionOriginalId);
    opcionesSeleccionadasMap.set(sustitucionInput.opcionSustitutaId, 1);
  }

  // Llenar nombres de opciones originales en sustituciones
  for (const s of sustitucionesAplicadas) {
    const opcionOriginal = opcionesDisponiblesMap.get(s.opcionOriginalId);
    if (opcionOriginal) {
      s.opcionOriginalNombre = opcionOriginal.nombre;
    }
  }

  // ── 10. Validar y procesar adicionales ──
  const adicionalesProducto = await db
    .select()
    .from(schema.adicionales)
    .where(eq(schema.adicionales.productoId, input.productoId));

  const adicionalesMap = new Map<number, any>();
  for (const a of adicionalesProducto) {
    if (a.estaActivo) {
      adicionalesMap.set(a.id, a);
    }
  }

  const adicionalesAplicados: PrecioDesglose['adicionales'] = [];
  let ajusteAdicionalesTotal = 0;

  for (const adicionalInput of input.adicionales) {
    const adicional = adicionalesMap.get(adicionalInput.adicionalId);
    if (!adicional) {
      throw new PrecioValidacionError(
        'adicional_no_valido',
        'El adicional no está disponible para este producto',
        [
          {
            campo: 'adicionalId',
            valor: String(adicionalInput.adicionalId),
            problema: 'no disponible',
          },
        ]
      );
    }

    const cantidad = adicionalInput.cantidad ?? 1;
    if (cantidad > adicional.cantidadMaxima) {
      throw new PrecioValidacionError(
        'cantidad_adicional_excedida',
        `El adicional "${adicional.nombre}" permite máximo ${adicional.cantidadMaxima} unidad(es)`,
        [{ campo: 'cantidad', valor: String(cantidad), problema: 'excede máximo' }]
      );
    }

    const subtotal = adicional.precioCentavos * cantidad;
    ajusteAdicionalesTotal += subtotal;

    adicionalesAplicados.push({
      adicionalId: adicional.id,
      nombre: adicional.nombre,
      precioUnitarioCentavos: adicional.precioCentavos,
      cantidad,
      subtotalCentavos: subtotal,
    });
  }

  // ── 11. Calcular total ──
  // Fórmula: Precio base de la modalidad + Ajustes de sustituciones + Adicionales
  // Las opciones incluidas no generan recargo (ya están en el precio base)
  const precioBase = modalidad.precioBaseCentavos;
  const totalCentavos = precioBase + ajusteSustitucionesTotal + ajusteAdicionalesTotal;

  // ── 12. Construir desglose ──
  return {
    productoId: producto.id,
    productoNombre: producto.nombre,
    modalidadId: modalidad.id,
    modalidadNombre: modalidad.nombre,
    precioBaseCentavos: precioBase,
    opcionesIncluidas: opcionesIncluidasResult.map((o: any) => ({
      opcionId: o.id,
      nombre: o.nombre,
    })),
    sustitucionesAplicadas,
    adicionales: adicionalesAplicados,
    totalCentavos,
  };
}
