import Fastify from 'fastify';

const fastify = Fastify({
  logger: true,
});

fastify.get('/health', async () => {
  return { status: 'ok', service: 'pos-buen-gusto-api' };
});

const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';

fastify.listen({ port, host }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Servidor escuchando en ${address}`);
});

export { fastify };
