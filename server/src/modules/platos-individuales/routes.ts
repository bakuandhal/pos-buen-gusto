import { FastifyInstance } from 'fastify';
import { platoUpdateSchema, type PlatoUpdateInput } from './schemas';
import { actualizarPlato, eliminarPlato } from './service';

export async function platosRoutes(app: FastifyInstance) {
  const requireModificarPedido = (app as any).requirePermission('modificar_pedido');
  const requireCancelarPlato = (app as any).requirePermission('cancelar_plato');

  // PATCH /api/v1/platos-individuales/:id - Actualizar un plato en borrador
  app.patch('/:id', { preHandler: requireModificarPedido }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const parseResult = platoUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'validacion_fallida',
        message: 'Datos de entrada inválidos',
      });
    }
    const plato = await actualizarPlato(id, parseResult.data as PlatoUpdateInput);
    return reply.send(plato);
  });

  // DELETE /api/v1/platos-individuales/:id - Eliminar un plato en borrador
  app.delete('/:id', { preHandler: requireCancelarPlato }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const plato = await eliminarPlato(id);
    return reply.send({ message: 'Plato eliminado', plato });
  });
}
