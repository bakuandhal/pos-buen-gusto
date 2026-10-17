import { z } from 'zod';

// ── Esquemas para Mesas ──
export const mesaCreateSchema = z.object({
  numero: z.number().int().positive('El número de mesa debe ser un entero positivo'),
});

export const mesaUpdateSchema = z.object({
  estado: z.enum(['disponible', 'ocupada', 'pendiente']),
  comensales: z.number().int().min(0).optional(),
});

export const mesaEstadoSchema = z.object({
  estado: z.enum(['disponible', 'ocupada', 'pendiente']),
});

// ── Tipos inferidos ──
export type MesaCreateInput = z.infer<typeof mesaCreateSchema>;
export type MesaUpdateInput = z.infer<typeof mesaUpdateSchema>;
export type MesaEstadoInput = z.infer<typeof mesaEstadoSchema>;
