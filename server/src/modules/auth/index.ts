import { FastifyInstance } from 'fastify';
import { authRoutes } from './routes';

export async function registerAuthModule(app: FastifyInstance) {
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
}
