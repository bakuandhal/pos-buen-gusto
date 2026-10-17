import { createApp } from './app';
import { config } from './config';
import { connectDb, getDb, schema } from './db/connection';

const env = config();

const app = await createApp();

// Endpoint de disponibilidad: verifica dependencias esenciales (base de datos)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.get('/ready', async (request: any, reply: any) => {
  try {
    await connectDb();
    const db = getDb();
    await db.select().from(schema.roles).limit(1);
    return {
      status: 'ok',
      service: 'pos-buen-gusto-api',
      database: 'connected',
    };
  } catch (error) {
    request.log.error(error);
    return reply.status(503).send({
      status: 'error',
      service: 'pos-buen-gusto-api',
      database: 'disconnected',
    });
  }
});

const port = parseInt(env.PORT, 10);
const host = env.HOST;

await app.listen({ port, host });
app.log.info(`Servidor escuchando en http://${host}:${port}`);

export { app };
