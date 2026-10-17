import { FastifyInstance } from 'fastify';
import { pedidosRoutes } from './routes';

export async function registerPedidosModule(app: FastifyInstance) {
  await app.register(pedidosRoutes, { prefix: '/api/v1/pedidos' });
}
