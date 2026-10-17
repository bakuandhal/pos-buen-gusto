import { FastifyInstance } from 'fastify';
import { comandasRoutes } from './routes';

export async function registerComandasModule(app: FastifyInstance) {
  await app.register(comandasRoutes, { prefix: '/api/v1/comandas' });
}
