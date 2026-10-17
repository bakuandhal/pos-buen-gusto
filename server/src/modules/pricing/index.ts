import { FastifyInstance } from 'fastify';
import { pricingRoutes } from './routes';

export async function registerPricingModule(app: FastifyInstance) {
  await app.register(pricingRoutes, { prefix: '/api/v1/pricing' });
}
