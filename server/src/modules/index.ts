import { FastifyInstance } from 'fastify';
import { registerAuthModule } from './auth';

export async function registerModules(app: FastifyInstance) {
  await registerAuthModule(app);
}
