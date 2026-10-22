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
import { crearPlato } from '../platos-individuales/service';
import { platoCreateSchema, type PlatoCreateInput } from '../platos-individuales/schemas';
import { withIdempotency } from '../../utils/idempotency';
import { obtenerUsuario } from '../../utils/authContext';

export async function pedidosRoutes(app: FastifyInstance) {
  const requireAgregarPedido = (app as any).requirePermission('agregar_pedido');
  const requireModificarPedido = (app as any).requirePermission('modificar_pedido');

  /** Identificador del usuario autenticado tomado del token JWT. */
  function usuarioId(request: any): number {
    return obtenerUsuario(request).id;
  }

  // GET /api/v1/pedidos - Listar pedidos (filtros opcionales)
  app.get('/', async (request, reply) => {
    const query = (request.query ?? {}) as any;
    const pedidos = await listarPedidos({
      mesaId: query.mesaId ? Number(query.mesaId) : undefined,
      estado: query.estado ? String(query.estado) : undefined,
      limite: query.limite ? Number(query.limite) : undefined,
    });
    return reply.send(pedidos);
  });

  // GET /api/v1/pedidos/:id - Obtener un pedido con sus platos
  app.get('/:id', async (request, reply) => {
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

  // POST /api/v1/pedidos - Crear un nuevo pedido (abrir servicio)
  app.post('/', { preHandler: requireAgregarPedido }, async (request, reply) => {
    const parseResult = pedidoCreateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'validacion_fallida',
        message: 'Datos de entrada inválidos',
      });
    }

    const userId = usuarioId(request);
    const clave = request.headers['idempotency-key'] as string | undefined;

    const { data, replayed } = await withIdempotency(clave, 'crear_pedido', () =>
      crearPedido(parseResult.data as PedidoCreateInput, userId)
    );

    return reply.status(replayed ? 200 : 201).send(data);
  });

  // PATCH /api/v1/pedidos/:id - Actualizar estado de un pedido
  app.patch('/:id', { preHandler: requireModificarPedido }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const parseResult = pedidoUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'validacion_fallida',
        message: 'Datos de entrada inválidos',
      });
    }
    const pedido = await actualizarEstadoPedido(id, parseResult.data as PedidoUpdateInput);
    return reply.send(pedido);
  });

  // DELETE /api/v1/pedidos/:id - Cancelar un pedido
  app.delete('/:id', { preHandler: requireModificarPedido }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const pedido = await cancelarPedido(id);
    return reply.send({ message: 'Pedido cancelado', pedido });
  });

  // POST /api/v1/pedidos/:id/platos - Añadir un plato a un pedido abierto
  app.post('/:id/platos', { preHandler: requireAgregarPedido }, async (request, reply) => {
    const pedidoId = Number((request.params as any).id);
    const parseResult = platoCreateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'validacion_fallida',
        message: 'Datos de entrada inválidos',
      });
    }

    const clave = request.headers['idempotency-key'] as string | undefined;

    const { data, replayed } = await withIdempotency(
      clave,
      `agregar_plato_pedido_${pedidoId}`,
      () => crearPlato(pedidoId, parseResult.data as PlatoCreateInput)
    );

    return reply.status(replayed ? 200 : 201).send(data);
  });
}
