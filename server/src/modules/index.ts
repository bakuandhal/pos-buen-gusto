import { FastifyInstance } from 'fastify';
import { registerAuthModule } from './auth';
import { registerCatalogModule } from './catalog';
import { registerPricingModule } from './pricing';
import { registerMesasModule } from './mesas';
import { registerPedidosModule } from './pedidos';
import { registerPlatosModule } from './platos-individuales';
import { registerComandasModule } from './comandas';

export async function registerModules(app: FastifyInstance) {
  await registerAuthModule(app);
  await registerCatalogModule(app);
  await registerPricingModule(app);
  await registerMesasModule(app);
  await registerPedidosModule(app);
  await registerPlatosModule(app);
  await registerComandasModule(app);
}
