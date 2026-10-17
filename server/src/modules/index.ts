import { FastifyInstance } from 'fastify';
import { registerAuthModule } from './auth';
import { registerCatalogModule } from './catalog';
import { registerPricingModule } from './pricing';

export async function registerModules(app: FastifyInstance) {
  await registerAuthModule(app);
  await registerCatalogModule(app);
  await registerPricingModule(app);
}
