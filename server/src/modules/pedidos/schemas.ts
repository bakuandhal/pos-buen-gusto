import { z } from 'zod';

// ── Esquemas para Pedidos ──
export const pedidoCreateSchema = z.object({
  mesaId: z.number().int().positive('ID de mesa inválido').optional(),
  tipoServicio: z.enum(['mesa', 'para_llevar']).default('mesa'),
});

export const pedidoUpdateSchema = z.object({
  estado: z.enum(['borrador', 'confirmado', 'enviado_cocina', 'cancelado']),
});

// ── Tipos inferidos ──
export type PedidoCreateInput = z.infer<typeof pedidoCreateSchema>;
export type PedidoUpdateInput = z.infer<typeof pedidoUpdateSchema>;
