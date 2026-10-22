import { FastifyInstance } from 'fastify';
import {
  mesaCreateSchema,
  mesaUpdateSchema,
  mesaEstadoSchema,
  type MesaCreateInput,
  type MesaUpdateInput,
  type MesaEstadoInput,
} from './schemas';
import {
  listarMesas,
  obtenerMesa,
  crearMesa,
  actualizarMesa,
  desactivarMesa,
  cambiarEstadoMesa,
} from './service';

export async function mesasRoutes(app: FastifyInstance) {
  const requireAdmin = (app as any).requirePermission('configurar_precios');
  const requireMesero = (app as any).requirePermission('abrir_mesa');

  // GET /api/v1/mesas - Listar todas las mesas
  app.get('/', async (_request, reply) => {
    const mesas = await listarMesas();
    return reply.send(mesas);
  });

  // GET /api/v1/mesas/:id - Obtener una mesa específica
  app.get('/:id', async (request, reply) => {
    const id = Number((request.params as any).id);
    const mesa = await obtenerMesa(id);
    if (!mesa) {
      return reply.status(404).send({
        error: 'mesa_no_encontrada',
        message: 'Mesa no encontrada',
      });
    }
    return reply.send(mesa);
  });

  // POST /api/v1/mesas - Crear una nueva mesa
  app.post('/', { preHandler: requireAdmin }, async (request, reply) => {
    const parseResult = mesaCreateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'validacion_fallida',
        message: 'Datos de entrada inválidos',
      });
    }
    const mesa = await crearMesa(parseResult.data as MesaCreateInput);
    return reply.status(201).send(mesa);
  });

  // PATCH /api/v1/mesas/:id - Actualizar una mesa (estado, comensales)
  app.patch('/:id', { preHandler: requireMesero }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const parseResult = mesaUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'validacion_fallida',
        message: 'Datos de entrada inválidos',
      });
    }
    const mesa = await actualizarMesa(id, parseResult.data as MesaUpdateInput);
    if (!mesa) {
      return reply.status(404).send({
        error: 'mesa_no_encontrada',
        message: 'Mesa no encontrada',
      });
    }
    return reply.send(mesa);
  });

  // PATCH /api/v1/mesas/:id/estado - Cambiar solo el estado de una mesa
  app.patch('/:id/estado', { preHandler: requireMesero }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const parseResult = mesaEstadoSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'validacion_fallida',
        message: 'Datos de entrada inválidos',
      });
    }
    const mesa = await cambiarEstadoMesa(id, parseResult.data as MesaEstadoInput);
    if (!mesa) {
      return reply.status(404).send({
        error: 'mesa_no_encontrada',
        message: 'Mesa no encontrada',
      });
    }
    return reply.send(mesa);
  });

  // DELETE /api/v1/mesas/:id - Desactivar mesa (volver a disponible sin comensales)
  app.delete('/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const mesa = await desactivarMesa(id);
    if (!mesa) {
      return reply.status(404).send({
        error: 'mesa_no_encontrada',
        message: 'Mesa no encontrada',
      });
    }
    return reply.send({ message: 'Mesa desactivada', mesa });
  });
}
