import { FastifyInstance } from 'fastify';
import { mesasRoutes } from './routes';

export async function registerMesasModule(app: FastifyInstance) {
  await app.register(mesasRoutes, { prefix: '/api/v1/mesas' });
}
