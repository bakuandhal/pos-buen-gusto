import { FastifyInstance } from 'fastify';
import { catalogRoutes } from './routes';

export async function registerCatalogModule(app: FastifyInstance) {
  await app.register(catalogRoutes, { prefix: '/api/v1/catalog' });
}
