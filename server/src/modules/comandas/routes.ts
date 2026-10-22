import { FastifyInstance } from 'fastify';
import {
  comandaCreateSchema,
  comandaUpdateSchema,
  type ComandaCreateInput,
  type ComandaUpdateInput,
} from './schemas';
import { listarComandas, obtenerComanda, crearComanda, actualizarEstadoComanda } from './service';
import { withIdempotency } from '../../utils/idempotency';
import { obtenerUsuario } from '../../utils/authContext';

export async function comandasRoutes(app: FastifyInstance) {
  const requireEnviarComanda = (app as any).requirePermission('enviar_comanda');

  function usuarioId(request: any): number {
    return obtenerUsuario(request).id;
  }

  // GET /api/v1/comandas - Listar comandas
  app.get('/', async (request, reply) => {
    const query = (request.query ?? {}) as any;
    const comandas = await listarComandas({
      pedidoId: query.pedidoId ? Number(query.pedidoId) : undefined,
      estado: query.estado ? String(query.estado) : undefined,
    });
    return reply.send(comandas);
  });

  // GET /api/v1/comandas/:id - Obtener una comanda
  app.get('/:id', async (request, reply) => {
    const id = Number((request.params as any).id);
    const comanda = await obtenerComanda(id);
    if (!comanda) {
      return reply.status(404).send({
        error: 'comanda_no_encontrada',
        message: 'Comanda no encontrada',
      });
    }
    return reply.send(comanda);
  });

  // POST /api/v1/comandas - Enviar a cocina los platos pendientes
  app.post('/', { preHandler: requireEnviarComanda }, async (request, reply) => {
    const parseResult = comandaCreateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'validacion_fallida',
        message: 'Datos de entrada inválidos',
      });
    }

    const userId = usuarioId(request);
    const clave = request.headers['idempotency-key'] as string | undefined;

    const { data, replayed } = await withIdempotency(clave, 'crear_comanda', () =>
      crearComanda(parseResult.data as ComandaCreateInput, userId)
    );

    return reply.status(replayed ? 200 : 201).send(data);
  });

  // PATCH /api/v1/comandas/:id - Actualizar estado de una comanda
  app.patch('/:id', { preHandler: requireEnviarComanda }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const parseResult = comandaUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'validacion_fallida',
        message: 'Datos de entrada inválidos',
      });
    }
    const comanda = await actualizarEstadoComanda(id, parseResult.data as ComandaUpdateInput);
    return reply.send(comanda);
  });
}
