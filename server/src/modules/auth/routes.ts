import { FastifyInstance } from 'fastify';
import {
  loginSchema,
  refreshSchema,
  logoutSchema,
  type LoginInput,
  type RefreshInput,
  type LogoutInput,
} from './schemas';
import {
  authenticateUser,
  createTokens,
  verifyRefreshToken,
  revokeRefreshToken,
  getUserById,
} from './service';
import { hashToken } from '../../utils/auth';

export async function authRoutes(app: FastifyInstance) {
  // POST /api/v1/auth/login
  app.post('/login', async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'validacion_fallida',
        message: 'Datos de entrada inválidos',
      });
    }

    const { username, password } = parseResult.data as LoginInput;

    const user = await authenticateUser(username, password);

    if (!user) {
      return reply.status(401).send({
        error: 'credenciales_invalidas',
        message: 'Nombre de usuario o contraseña incorrectos',
      });
    }

    const tokens = await createTokens(app, user.userId, user.username, user.role, user.permissions);

    return {
      user: {
        id: user.userId,
        username: user.username,
        email: '',
        fullName: '',
        role: user.role,
        permissions: user.permissions,
      },
      tokens,
    };
  });

  // POST /api/v1/auth/refresh
  app.post('/refresh', async (request, reply) => {
    const parseResult = refreshSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'validacion_fallida',
        message: 'Datos de entrada inválidos',
      });
    }

    const { refreshToken } = parseResult.data as RefreshInput;

    const tokenData = await verifyRefreshToken(refreshToken);

    if (!tokenData) {
      return reply.status(401).send({
        error: 'token_invalido',
        message: 'Token de renovación inválido o expirado',
      });
    }

    const user = await getUserById(tokenData.userId);

    if (!user || !user.isActive) {
      await revokeRefreshToken(hashToken(refreshToken));
      return reply.status(401).send({
        error: 'usuario_inactivo',
        message: 'El usuario no está activo',
      });
    }

    // Revocar el token viejo y crear uno nuevo (rotación)
    await revokeRefreshToken(hashToken(refreshToken));

    const tokens = await createTokens(
      app,
      user.id,
      user.username,
      user.role.name,
      user.role.rolePermissions.map(
        (rp: { permission: { action: string } }) => rp.permission.action
      )
    );

    return tokens;
  });

  // POST /api/v1/auth/logout
  app.post('/logout', async (request, reply) => {
    const parseResult = logoutSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'validacion_fallida',
        message: 'Datos de entrada inválidos',
      });
    }

    const { refreshToken } = parseResult.data as LogoutInput;

    if (refreshToken) {
      await revokeRefreshToken(hashToken(refreshToken));
    }

    return { message: 'Sesión cerrada' };
  });

  // GET /api/v1/auth/me
  app.get('/me', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({
        error: 'no_autorizado',
        message: 'Token de acceso inválido o expirado',
      });
    }

    const user = request.user as {
      id: number;
      username: string;
      role: string;
      permissions: string[];
    };

    return {
      user: {
        id: user.id,
        username: user.username,
        email: '',
        fullName: '',
        role: user.role,
        permissions: user.permissions,
      },
    };
  });
}
