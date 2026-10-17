import { FastifyInstance } from 'fastify';
import {
  platoCreateSchema,
  platoUpdateSchema,
  type PlatoCreateInput,
  type PlatoUpdateInput,
} from './schemas';
import {
  crearPlato,
  actualizarPlato,
  eliminarPlato,
} from './service';

export async function platosRoutes(app: FastifyInstance) {
  const requireMesero = (app as any).requirePermission('abrir_mesa');

  // POST /pedidos/:pedidoId/platos - Agregar un plato a un pedido
  app.post(
    '/pedidos/:pedidoId/platos',
    { preHandler: requireMesero },
    async (request, reply) => {
      const pedidoId = Number((request.params as any).pedidoId);
      const parseResult = platoCreateSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'validacion_fallida',
          message: 'Datos de entrada inválidos',
        });
      }
      const plato = await crearPlato(pedidoId, parseResult.data as PlatoCreateInput);
      return reply.status(201).send(plato);
    }
  );

  // PATCH /platos-individuales/:id - Actualizar un plato
  app.patch(
    '/platos-individuales/:id',
    { preHandler: requireMesero },
    async (request, reply) => {
      const id = Number((request.params as any).id);
      const parseResult = platoUpdateSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'validacion_fallida',
          message: 'Datos de entrada inválidos',
        });
      }
      const plato = await actualizarPlato(id, parseResult.data as PlatoUpdateInput);
      if (!plato) {
        return reply.status(404).send({
          error: 'plato_no_encontrado',
          message: 'Plato no encontrado',
        });
      }
      return reply.send(plato);
    }
  );

  // DELETE /platos-individuales/:id - Eliminar un plato del pedido
  app.delete(
    '/platos-individuales/:id',
    { preHandler: requireMesero },
    async (request, reply) => {
      const id = Number((request.params as any).id);
      const plato = await eliminarPlato(id);
      if (!plato) {
        return reply.status(404).send({
          error: 'plato_no_encontrado',
          message: 'Plato no encontrado',
        });
      }
      return reply.send({ message: 'Plato eliminado', plato });
    }
  );
}
