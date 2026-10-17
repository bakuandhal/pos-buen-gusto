import { FastifyInstance } from 'fastify';
import { platosRoutes } from './routes';

export async function registerPlatosModule(app: FastifyInstance) {
  await app.register(platosRoutes, { prefix: '/api/v1/platos-individuales' });
}
