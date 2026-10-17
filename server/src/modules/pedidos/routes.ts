import { FastifyInstance } from 'fastify';
import {
  pedidoCreateSchema,
  pedidoUpdateSchema,
  type PedidoCreateInput,
  type PedidoUpdateInput,
} from './schemas';
import {
  listarPedidos,
  obtenerPedido,
  crearPedido,
  actualizarEstadoPedido,
  cancelarPedido,
} from './service';

export async function pedidosRoutes(app: FastifyInstance) {
const requireMesero = (app as any).requirePermission('abrir_mesa');

  // GET /pedidos - Listar pedidos (con filtro opcional por mesa)
  app.get('/pedidos', async (request, reply) => {
    const mesaId = (request.query as any).mesaId
      ? Number((request.query as any).mesaId)
      : undefined;
    const pedidos = await listarPedidos(mesaId);
    return reply.send(pedidos);
  });

  // GET /pedidos/:id - Obtener un pedido con sus platos
  app.get('/pedidos/:id', async (request, reply) => {
    const id = Number((request.params as any).id);
    const pedido = await obtenerPedido(id);
    if (!pedido) {
      return reply.status(404).send({
        error: 'pedido_no_encontrado',
        message: 'Pedido no encontrado',
      });
    }
    return reply.send(pedido);
  });

  // POST /pedidos - Crear un nuevo pedido (abrir servicio)
  app.post(
    '/pedidos',
    { preHandler: requireMesero },
    async (request, reply) => {
      const parseResult = pedidoCreateSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'validacion_fallida',
          message: 'Datos de entrada inválidos',
        });
      }
      const pedido = await crearPedido(parseResult.data as PedidoCreateInput);
      return reply.status(201).send(pedido);
    }
  );

  // PATCH /pedidos/:id - Actualizar estado de un pedido
  app.patch(
    '/pedidos/:id',
    { preHandler: requireMesero },
    async (request, reply) => {
      const id = Number((request.params as any).id);
      const parseResult = pedidoUpdateSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'validacion_fallida',
          message: 'Datos de entrada inválidos',
        });
      }
      const pedido = await actualizarEstadoPedido(
        id,
        parseResult.data as PedidoUpdateInput
      );
      if (!pedido) {
        return reply.status(404).send({
          error: 'pedido_no_encontrado',
          message: 'Pedido no encontrado',
        });
      }
      return reply.send(pedido);
    }
  );

  // DELETE /pedidos/:id - Cancelar un pedido
  app.delete(
    '/pedidos/:id',
    { preHandler: requireMesero },
    async (request, reply) => {
      const id = Number((request.params as any).id);
      const pedido = await cancelarPedido(id);
      if (!pedido) {
        return reply.status(404).send({
          error: 'pedido_no_encontrado',
          message: 'Pedido no encontrado',
        });
      }
      return reply.send({ message: 'Pedido cancelado', pedido });
    }
  );
}
