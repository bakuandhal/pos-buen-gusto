import { z } from 'zod';

// ── Esquemas para Productos ──
export const productoCreateSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100),
  descripcion: z.string().optional(),
  ordenPresentacion: z.number().int().min(0).default(0),
});

export const productoUpdateSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  descripcion: z.string().optional(),
  ordenPresentacion: z.number().int().min(0).optional(),
  estaActivo: z.boolean().optional(),
});

// ── Esquemas para Modalidades ──
export const modalidadCreateSchema = z.object({
  productoId: z.number().int().positive('ID de producto inválido'),
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100),
  descripcion: z.string().optional(),
  precioBaseCentavos: z.number().int().min(0, 'El precio no puede ser negativo'),
  incluyeSopa: z.boolean().default(false),
  disponibleDesde: z.string().datetime().optional(),
  disponibleHasta: z.string().datetime().optional(),
});

export const modalidadUpdateSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  descripcion: z.string().optional(),
  precioBaseCentavos: z.number().int().min(0).optional(),
  incluyeSopa: z.boolean().optional(),
  estaActivo: z.boolean().optional(),
  disponibleDesde: z.string().datetime().optional(),
  disponibleHasta: z.string().datetime().optional(),
});

// ── Esquemas para Grupos de Opciones ──
export const grupoOpcionesCreateSchema = z.object({
  productoId: z.number().int().positive('ID de producto inválido'),
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100),
  descripcion: z.string().optional(),
  esObligatorio: z.boolean().default(false),
  cantidadMinima: z.number().int().min(0).default(0),
  cantidadMaxima: z.number().int().min(1).default(1),
  permiteVariasElecciones: z.boolean().default(false),
});

export const grupoOpcionesUpdateSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  descripcion: z.string().optional(),
  esObligatorio: z.boolean().optional(),
  cantidadMinima: z.number().int().min(0).optional(),
  cantidadMaxima: z.number().int().min(1).optional(),
  permiteVariasElecciones: z.boolean().optional(),
  estaActivo: z.boolean().optional(),
});

// ── Esquemas para Opciones ──
export const opcionCreateSchema = z.object({
  grupoId: z.number().int().positive('ID de grupo inválido'),
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100),
  descripcion: z.string().optional(),
  ordenPresentacion: z.number().int().min(0).default(0),
});

export const opcionUpdateSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  descripcion: z.string().optional(),
  ordenPresentacion: z.number().int().min(0).optional(),
  estaActivo: z.boolean().optional(),
});

// ── Esquemas para Opciones Incluidas en Modalidad ──
export const opcionIncluidaCreateSchema = z.object({
  modalidadId: z.number().int().positive('ID de modalidad inválido'),
  opcionId: z.number().int().positive('ID de opción inválido'),
});

// ── Esquemas para Sustituciones ──
export const sustitucionCreateSchema = z.object({
  modalidadId: z.number().int().positive('ID de modalidad inválido'),
  opcionOriginalId: z.number().int().positive('ID de opción original inválido'),
  opcionSustitutaId: z.number().int().positive('ID de opción sustituta inválido'),
  ajustePrecioCentavos: z.number().int().default(0),
});

export const sustitucionUpdateSchema = z.object({
  ajustePrecioCentavos: z.number().int().optional(),
  estaActivo: z.boolean().optional(),
});

// ── Esquemas para Adicionales ──
export const adicionalCreateSchema = z.object({
  productoId: z.number().int().positive('ID de producto inválido'),
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100),
  descripcion: z.string().optional(),
  precioCentavos: z.number().int().min(0, 'El precio no puede ser negativo'),
  cantidadMaxima: z.number().int().min(1).default(1),
});

export const adicionalUpdateSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  descripcion: z.string().optional(),
  precioCentavos: z.number().int().min(0).optional(),
  estaActivo: z.boolean().optional(),
  cantidadMaxima: z.number().int().min(1).optional(),
});

// ── Esquema para Revisión de Tarifa ──
export const revisionTarifaPublishSchema = z.object({
  numeroRevision: z.number().int().min(1),
  descripcion: z.string().optional(),
});

// ── Esquema para Cotización de Precios ──
export const pricingQuoteSchema = z.object({
  productoId: z.number().int().positive(),
  modalidadId: z.number().int().positive(),
  opcionesSeleccionadas: z.array(z.number().int().positive()).default([]),
  sustituciones: z
    .array(
      z.object({
        opcionOriginalId: z.number().int().positive(),
        opcionSustitutaId: z.number().int().positive(),
      })
    )
    .default([]),
  adicionales: z
    .array(
      z.object({
        adicionalId: z.number().int().positive(),
        cantidad: z.number().int().min(1).default(1),
      })
    )
    .default([]),
});

// ── Tipos inferidos ──
export type ProductoCreateInput = z.infer<typeof productoCreateSchema>;
export type ProductoUpdateInput = z.infer<typeof productoUpdateSchema>;
export type ModalidadCreateInput = z.infer<typeof modalidadCreateSchema>;
export type ModalidadUpdateInput = z.infer<typeof modalidadUpdateSchema>;
export type GrupoOpcionesCreateInput = z.infer<typeof grupoOpcionesCreateSchema>;
export type GrupoOpcionesUpdateInput = z.infer<typeof grupoOpcionesUpdateSchema>;
export type OpcionCreateInput = z.infer<typeof opcionCreateSchema>;
export type OpcionUpdateInput = z.infer<typeof opcionUpdateSchema>;
export type OpcionIncluidaCreateInput = z.infer<typeof opcionIncluidaCreateSchema>;
export type SustitucionCreateInput = z.infer<typeof sustitucionCreateSchema>;
export type SustitucionUpdateInput = z.infer<typeof sustitucionUpdateSchema>;
export type AdicionalCreateInput = z.infer<typeof adicionalCreateSchema>;
export type AdicionalUpdateInput = z.infer<typeof adicionalUpdateSchema>;
export type RevisionTarifaPublishInput = z.infer<typeof revisionTarifaPublishSchema>;
export type PricingQuoteInput = z.infer<typeof pricingQuoteSchema>;
