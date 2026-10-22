import { z } from 'zod';

// ── Esquemas para Platos Individuales ──
export const platoCreateSchema = z.object({
  productoId: z.number().int().positive('ID de producto inválido'),
  modalidadId: z.number().int().positive('ID de modalidad inválido'),
  cantidad: z.number().int().min(1).max(50).default(1),
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
        cantidad: z.number().int().min(1).max(20).default(1),
      })
    )
    .default([]),
  configuracion: z
    .object({
      modalidad: z.string().optional(),
      sopa: z.string().optional(),
      proteina: z.string().optional(),
      principio: z.string().optional(),
      observaciones: z.string().max(500).optional(),
    })
    .optional(),
});

export const platoUpdateSchema = z.object({
  cantidad: z.number().int().min(1).max(50).optional(),
  modalidadId: z.number().int().positive().optional(),
  opcionesSeleccionadas: z.array(z.number().int().positive()).optional(),
  sustituciones: z
    .array(
      z.object({
        opcionOriginalId: z.number().int().positive(),
        opcionSustitutaId: z.number().int().positive(),
      })
    )
    .optional(),
  adicionales: z
    .array(
      z.object({
        adicionalId: z.number().int().positive(),
        cantidad: z.number().int().min(1).max(20).default(1),
      })
    )
    .optional(),
  configuracion: z
    .object({
      modalidad: z.string().optional(),
      sopa: z.string().optional(),
      proteina: z.string().optional(),
      principio: z.string().optional(),
      observaciones: z.string().max(500).optional(),
    })
    .optional(),
});

// ── Tipos inferidos ──
export type PlatoCreateInput = z.infer<typeof platoCreateSchema>;
export type PlatoUpdateInput = z.infer<typeof platoUpdateSchema>;
