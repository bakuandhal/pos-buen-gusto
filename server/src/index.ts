import { createApp } from './app';
import { config } from './config';

const env = config();

const app = await createApp();

const port = parseInt(env.PORT, 10);
const host = env.HOST;

await app.listen({ port, host });
app.log.info(`Servidor escuchando en http://${host}:${port}`);

export { app };
