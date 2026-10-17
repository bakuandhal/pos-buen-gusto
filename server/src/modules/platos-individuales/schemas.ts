import { z } from 'zod';

// ── Esquemas para Platos Individuales ──
export const platoCreateSchema = z.object({
  productoId: z.number().int().positive('ID de producto inválido'),
  modalidadId: z.number().int().positive('ID de modalidad inválido'),
  cantidad: z.number().int().min(1).default(1),
});

export const platoUpdateSchema = z.object({
  cantidad: z.number().int().min(1).optional(),
  estado: z.enum(['borrador', 'confirmado', 'en_cocina', 'cancelado']).optional(),
});

// ── Tipos inferidos ──
export type PlatoCreateInput = z.infer<typeof platoCreateSchema>;
export type PlatoUpdateInput = z.infer<typeof platoUpdateSchema>;
