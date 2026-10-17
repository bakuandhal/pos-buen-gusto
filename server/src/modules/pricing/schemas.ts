import { z } from 'zod';

// ── Esquema para cotización de precios ──
export const pricingQuoteRequestSchema = z.object({
  productoId: z.number().int().positive('ID de producto inválido'),
  modalidadId: z.number().int().positive('ID de modalidad inválido'),
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
export type PricingQuoteRequest = z.infer<typeof pricingQuoteRequestSchema>;
