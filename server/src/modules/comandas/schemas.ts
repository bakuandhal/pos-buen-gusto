import { z } from 'zod';

// ── Esquemas para Comandas ──
export const comandaCreateSchema = z.object({
  pedidoId: z.number().int().positive('ID de pedido inválido'),
});

export const comandaUpdateSchema = z.object({
  estado: z.enum(['borrador', 'enviado', 'servido', 'cancelado']),
});

// ── Tipos inferidos ──
export type ComandaCreateInput = z.infer<typeof comandaCreateSchema>;
export type ComandaUpdateInput = z.infer<typeof comandaUpdateSchema>;
