import { eq } from 'drizzle-orm';
import { getDb, schema } from '../../db/connection';
import type {
  ProductoCreateInput,
  ProductoUpdateInput,
  ModalidadCreateInput,
  ModalidadUpdateInput,
  GrupoOpcionesCreateInput,
  GrupoOpcionesUpdateInput,
  OpcionCreateInput,
  OpcionUpdateInput,
  OpcionIncluidaCreateInput,
  SustitucionCreateInput,
  SustitucionUpdateInput,
  AdicionalCreateInput,
  AdicionalUpdateInput,
} from './schemas';

// ── Productos ──
export async function listarProductos() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  return await db.select().from(schema.productos).orderBy(schema.productos.ordenPresentacion);
}

export async function obtenerProducto(id: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [producto] = await db
    .select()
    .from(schema.productos)
    .where(eq(schema.productos.id, id))
    .limit(1);
  return producto || null;
}

export async function crearProducto(input: ProductoCreateInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [producto] = await db
    .insert(schema.productos)
    .values({
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      ordenPresentacion: input.ordenPresentacion,
    })
    .returning();
  return producto;
}

export async function actualizarProducto(id: number, input: ProductoUpdateInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [producto] = await db
    .update(schema.productos)
    .set({
      ...(input.nombre !== undefined && { nombre: input.nombre }),
      ...(input.descripcion !== undefined && { descripcion: input.descripcion }),
      ...(input.ordenPresentacion !== undefined && { ordenPresentacion: input.ordenPresentacion }),
      ...(input.estaActivo !== undefined && { estaActivo: input.estaActivo }),
      actualizadoEn: new Date(),
    })
    .where(eq(schema.productos.id, id))
    .returning();
  return producto || null;
}

export async function desactivarProducto(id: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [producto] = await db
    .update(schema.productos)
    .set({ estaActivo: false, actualizadoEn: new Date() })
    .where(eq(schema.productos.id, id))
    .returning();
  return producto || null;
}

// ── Modalidades ──
export async function listarModalidades(productoId?: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  if (productoId) {
    return await db
      .select()
      .from(schema.modalidades)
      .where(eq(schema.modalidades.productoId, productoId));
  }
  return await db.select().from(schema.modalidades);
}

export async function obtenerModalidad(id: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [modalidad] = await db
    .select()
    .from(schema.modalidades)
    .where(eq(schema.modalidades.id, id))
    .limit(1);
  return modalidad || null;
}

export async function crearModalidad(input: ModalidadCreateInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [modalidad] = await db
    .insert(schema.modalidades)
    .values({
      productoId: input.productoId,
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      precioBaseCentavos: input.precioBaseCentavos,
      incluyeSopa: input.incluyeSopa,
      disponibleDesde: input.disponibleDesde ? new Date(input.disponibleDesde) : null,
      disponibleHasta: input.disponibleHasta ? new Date(input.disponibleHasta) : null,
    })
    .returning();
  return modalidad;
}

export async function actualizarModalidad(id: number, input: ModalidadUpdateInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [modalidad] = await db
    .update(schema.modalidades)
    .set({
      ...(input.nombre !== undefined && { nombre: input.nombre }),
      ...(input.descripcion !== undefined && { descripcion: input.descripcion }),
      ...(input.precioBaseCentavos !== undefined && {
        precioBaseCentavos: input.precioBaseCentavos,
      }),
      ...(input.incluyeSopa !== undefined && { incluyeSopa: input.incluyeSopa }),
      ...(input.estaActivo !== undefined && { estaActivo: input.estaActivo }),
      ...(input.disponibleDesde !== undefined && {
        disponibleDesde: new Date(input.disponibleDesde),
      }),
      ...(input.disponibleHasta !== undefined && {
        disponibleHasta: new Date(input.disponibleHasta),
      }),
      actualizadoEn: new Date(),
    })
    .where(eq(schema.modalidades.id, id))
    .returning();
  return modalidad || null;
}

// ── Grupos de Opciones ──
export async function listarGruposOpciones(productoId?: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  if (productoId) {
    return await db
      .select()
      .from(schema.gruposOpciones)
      .where(eq(schema.gruposOpciones.productoId, productoId));
  }
  return await db.select().from(schema.gruposOpciones);
}

export async function crearGrupoOpciones(input: GrupoOpcionesCreateInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [grupo] = await db
    .insert(schema.gruposOpciones)
    .values({
      productoId: input.productoId,
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      esObligatorio: input.esObligatorio,
      cantidadMinima: input.cantidadMinima,
      cantidadMaxima: input.cantidadMaxima,
      permiteVariasElecciones: input.permiteVariasElecciones,
    })
    .returning();
  return grupo;
}

export async function actualizarGrupoOpciones(id: number, input: GrupoOpcionesUpdateInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [grupo] = await db
    .update(schema.gruposOpciones)
    .set({
      ...(input.nombre !== undefined && { nombre: input.nombre }),
      ...(input.descripcion !== undefined && { descripcion: input.descripcion }),
      ...(input.esObligatorio !== undefined && { esObligatorio: input.esObligatorio }),
      ...(input.cantidadMinima !== undefined && { cantidadMinima: input.cantidadMinima }),
      ...(input.cantidadMaxima !== undefined && { cantidadMaxima: input.cantidadMaxima }),
      ...(input.permiteVariasElecciones !== undefined && {
        permiteVariasElecciones: input.permiteVariasElecciones,
      }),
      ...(input.estaActivo !== undefined && { estaActivo: input.estaActivo }),
      actualizadoEn: new Date(),
    })
    .where(eq(schema.gruposOpciones.id, id))
    .returning();
  return grupo || null;
}

// ── Opciones ──
export async function listarOpciones(grupoId?: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  if (grupoId) {
    return await db.select().from(schema.opciones).where(eq(schema.opciones.grupoId, grupoId));
  }
  return await db.select().from(schema.opciones);
}

export async function crearOpcion(input: OpcionCreateInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [opcion] = await db
    .insert(schema.opciones)
    .values({
      grupoId: input.grupoId,
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      ordenPresentacion: input.ordenPresentacion,
    })
    .returning();
  return opcion;
}

export async function actualizarOpcion(id: number, input: OpcionUpdateInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [opcion] = await db
    .update(schema.opciones)
    .set({
      ...(input.nombre !== undefined && { nombre: input.nombre }),
      ...(input.descripcion !== undefined && { descripcion: input.descripcion }),
      ...(input.ordenPresentacion !== undefined && { ordenPresentacion: input.ordenPresentacion }),
      ...(input.estaActivo !== undefined && { estaActivo: input.estaActivo }),
      actualizadoEn: new Date(),
    })
    .where(eq(schema.opciones.id, id))
    .returning();
  return opcion || null;
}

// ── Opciones Incluidas en Modalidad ──
export async function agregarOpcionIncluida(input: OpcionIncluidaCreateInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [incluida] = await db
    .insert(schema.opcionesIncluidasModalidad)
    .values({
      modalidadId: input.modalidadId,
      opcionId: input.opcionId,
    })
    .returning();
  return incluida;
}

export async function listarOpcionesIncluidas(modalidadId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  return await db
    .select()
    .from(schema.opcionesIncluidasModalidad)
    .where(eq(schema.opcionesIncluidasModalidad.modalidadId, modalidadId));
}

// ── Sustituciones ──
export async function crearSustitucion(input: SustitucionCreateInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [sustitucion] = await db
    .insert(schema.sustituciones)
    .values({
      modalidadId: input.modalidadId,
      opcionOriginalId: input.opcionOriginalId,
      opcionSustitutaId: input.opcionSustitutaId,
      ajustePrecioCentavos: input.ajustePrecioCentavos,
    })
    .returning();
  return sustitucion;
}

export async function listarSustituciones(modalidadId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  return await db
    .select()
    .from(schema.sustituciones)
    .where(eq(schema.sustituciones.modalidadId, modalidadId));
}

export async function actualizarSustitucion(id: number, input: SustitucionUpdateInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [sustitucion] = await db
    .update(schema.sustituciones)
    .set({
      ...(input.ajustePrecioCentavos !== undefined && {
        ajustePrecioCentavos: input.ajustePrecioCentavos,
      }),
      ...(input.estaActivo !== undefined && { estaActivo: input.estaActivo }),
      actualizadoEn: new Date(),
    })
    .where(eq(schema.sustituciones.id, id))
    .returning();
  return sustitucion || null;
}

// ── Adicionales ──
export async function listarAdicionales(productoId?: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  if (productoId) {
    return await db
      .select()
      .from(schema.adicionales)
      .where(eq(schema.adicionales.productoId, productoId));
  }
  return await db.select().from(schema.adicionales);
}

export async function crearAdicional(input: AdicionalCreateInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [adicional] = await db
    .insert(schema.adicionales)
    .values({
      productoId: input.productoId,
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      precioCentavos: input.precioCentavos,
      cantidadMaxima: input.cantidadMaxima,
    })
    .returning();
  return adicional;
}

export async function actualizarAdicional(id: number, input: AdicionalUpdateInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const [adicional] = await db
    .update(schema.adicionales)
    .set({
      ...(input.nombre !== undefined && { nombre: input.nombre }),
      ...(input.descripcion !== undefined && { descripcion: input.descripcion }),
      ...(input.precioCentavos !== undefined && { precioCentavos: input.precioCentavos }),
      ...(input.estaActivo !== undefined && { estaActivo: input.estaActivo }),
      ...(input.cantidadMaxima !== undefined && { cantidadMaxima: input.cantidadMaxima }),
      actualizadoEn: new Date(),
    })
    .where(eq(schema.adicionales.id, id))
    .returning();
  return adicional || null;
}
