import { FastifyInstance } from 'fastify';
import {
  comandaCreateSchema,
  comandaUpdateSchema,
  type ComandaCreateInput,
  type ComandaUpdateInput,
} from './schemas';
import {
  listarComandas,
  obtenerComanda,
  crearComanda,
  actualizarEstadoComanda,
} from './service';

export async function comandasRoutes(app: FastifyInstance) {
  const requireMesero = (app as any).requirePermission('abrir_mesa');

  // GET /comandas - Listar comandas
  app.get('/comandas', async (_request, reply) => {
    const comandas = await listarComandas();
    return reply.send(comandas);
  });

  // GET /comandas/:id - Obtener una comanda
  app.get('/comandas/:id', async (request, reply) => {
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

  // POST /comandas - Crear una comanda (enviar a cocina)
  app.post(
    '/comandas',
    { preHandler: requireMesero },
    async (request, reply) => {
      const parseResult = comandaCreateSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'validacion_fallida',
          message: 'Datos de entrada inválidos',
        });
      }
      const comanda = await crearComanda(parseResult.data as ComandaCreateInput);
      return reply.status(201).send(comanda);
    }
  );

  // PATCH /comandas/:id - Actualizar estado de una comanda
  app.patch(
    '/comandas/:id',
    { preHandler: requireMesero },
    async (request, reply) => {
      const id = Number((request.params as any).id);
      const parseResult = comandaUpdateSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'validacion_fallida',
          message: 'Datos de entrada inválidos',
        });
      }
      const comanda = await actualizarEstadoComanda(
        id,
        parseResult.data as ComandaUpdateInput
      );
      if (!comanda) {
        return reply.status(404).send({
          error: 'comanda_no_encontrada',
          message: 'Comanda no encontrada',
        });
      }
      return reply.send(comanda);
    }
  );
}
