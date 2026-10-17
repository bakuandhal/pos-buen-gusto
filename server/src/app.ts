import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { config } from './config';
import { closeDb, connectDb, getDb, schema } from './db/connection';
import { registerModules } from './modules';

export async function createApp(): Promise<FastifyInstance> {
  const env = config();

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      serializers: {
        // Nunca serializar contraseñas ni tokens en los logs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req: (request: any) => ({
          method: request.method,
          url: request.url,
          hostname: request.hostname,
          remoteAddress: request.socket?.remoteAddress,
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res: (response: any) => ({
          statusCode: response.statusCode,
        }),
      },
    },
  });

  // CORS con orígenes explícitos
  await app.register(cors, {
    origin: env.CORS_ORIGINS.split(',').map((o: string) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // JWT
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_ACCESS_TOKEN_EXPIRY,
    },
  });

  // Decorador para verificar autenticación (usado como preHandler)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.decorate('authenticate', async (_request: any, _reply: any) => {
    try {
      await _request.jwtVerify();
    } catch {
      return _reply.status(401).send({
        error: 'no_autorizado',
        message: 'Token de acceso inválido o expirado',
      });
    }
  });

  // Decorador para verificar permisos específicos
  app.decorate('requirePermission', (requiredAction: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (request: any, reply: any) => {
      const user = request.user as
        | {
            id: number;
            role: string;
            permissions: string[];
          }
        | undefined;

      if (!user) {
        return reply.status(401).send({
          error: 'no_autenticado',
          message: 'Usuario no autenticado',
        });
      }

      if (!user.permissions.includes(requiredAction)) {
        return reply.status(403).send({
          error: 'sin_permisos',
          message: 'El usuario no tiene permiso para realizar esta acción',
        });
      }
    }
  );

  // Registro de auditoría en cada solicitud (sin datos sensibles)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.addHook('onRequest', async (_request: any, _reply: any) => {
    _request.log.debug({
      method: _request.method,
      path: _request.url,
    });
  });

  // Manejo global de errores
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.setErrorHandler((error: any, request: any, reply: any) => {
    request.log.error(error);

    // Nunca exponer detalles internos al cliente
    const statusCode = error.statusCode ?? 500;
    const message =
      statusCode === 500 ? 'Error interno del servidor' : (error.message ?? 'Error desconocido');

    return reply.status(statusCode).send({
      error: 'error_servidor',
      message,
    });
  });

  // Cerrar base de datos al apagar
  app.addHook('onClose', async () => {
    await closeDb();
  });

  // Registrar módulos de la aplicación
  await registerModules(app);

  // Endpoint de diagnóstico: servidor responde
  app.get('/health', async () => {
    return { status: 'ok', service: 'pos-buen-gusto-api' };
  });

  // Endpoint de disponibilidad: verifica dependencias esenciales (base de datos)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.get('/ready', async (_request: any, reply: any) => {
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
      _request.log.error(error);
      return reply.status(503).send({
        status: 'error',
        service: 'pos-buen-gusto-api',
        database: 'disconnected',
      });
    }
  });

  return app;
}

export type { FastifyInstance };
