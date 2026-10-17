import { eq } from 'drizzle-orm';
import { getDb, schema } from '../../db/connection';
import { comparePassword } from '../../utils/password';
import { generateRefreshToken, hashToken } from '../../utils/auth';
import { config } from '../../config';
import type { FastifyInstance } from 'fastify';
import type { JwtPayload, AuthTokens } from './types';

export interface AuthUser {
  userId: number;
  username: string;
  role: string;
  permissions: string[];
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<AuthUser | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .limit(1);

  if (!user || !user.isActive) {
    return null;
  }

  const passwordValid = await comparePassword(password, user.passwordHash);
  if (!passwordValid) {
    return null;
  }

  // Cargar rol y permisos por separado
  const [role] = await db
    .select()
    .from(schema.roles)
    .where(eq(schema.roles.id, user.roleId))
    .limit(1);

  if (!role) {
    return null;
  }

  const rolePermissions = await db
    .select()
    .from(schema.rolePermissions)
    .where(eq(schema.rolePermissions.roleId, role.id));

  const permissionIds = rolePermissions.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (rp: any) => rp.permissionId
  );

  const permissions = await db
    .select()
    .from(schema.permissions)
    .where(eq(schema.permissions.id, permissionIds[0]));

  const permissionActions = permissions.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p.action
  );

  return {
    userId: user.id,
    username: user.username,
    role: role.name,
    permissions: permissionActions,
  };
}

export async function createTokens(
  app: FastifyInstance,
  userId: number,
  username: string,
  role: string,
  permissions: string[]
): Promise<AuthTokens> {
  const payload: JwtPayload = {
    userId,
    username,
    role,
    permissions,
  };

  const accessToken = await app.jwt.sign(payload, {
    expiresIn: config().JWT_ACCESS_TOKEN_EXPIRY,
  });

  const refreshTokenString = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshTokenString);
  const refreshTokenExpiresAt = new Date(
    Date.now() + parseExpiryMs(config().JWT_REFRESH_TOKEN_EXPIRY)
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  await db.insert(schema.refreshTokens).values({
    userId,
    tokenHash: refreshTokenHash,
    expiresAt: refreshTokenExpiresAt,
  });

  return {
    accessToken,
    refreshToken: refreshTokenString,
    accessTokenExpiresAt: new Date(Date.now() + parseExpiryMs(config().JWT_ACCESS_TOKEN_EXPIRY)),
    refreshTokenExpiresAt,
  };
}

export async function verifyRefreshToken(refreshToken: string): Promise<{ userId: number } | null> {
  const tokenHash = hashToken(refreshToken);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;

  const [token] = await db
    .select()
    .from(schema.refreshTokens)
    .where(eq(schema.refreshTokens.tokenHash, tokenHash))
    .limit(1);

  if (!token) {
    return null;
  }

  if (token.expiresAt < new Date()) {
    return null;
  }

  // Verificar que el usuario exista y esté activo
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, token.userId))
    .limit(1);

  if (!user || !user.isActive) {
    return null;
  }

  return { userId: token.userId };
}

export async function revokeRefreshToken(tokenHash: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  await db
    .update(schema.refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(schema.refreshTokens.tokenHash, tokenHash));
}

export async function revokeAllUserRefreshTokens(userId: number): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  await db
    .update(schema.refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(schema.refreshTokens.userId, userId));
}

export async function getUserById(userId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);

  if (!user) return null;

  const [role] = await db
    .select()
    .from(schema.roles)
    .where(eq(schema.roles.id, user.roleId))
    .limit(1);

  const rolePermissions = await db
    .select()
    .from(schema.rolePermissions)
    .where(eq(schema.rolePermissions.roleId, role.id));

  const permissionIds = rolePermissions.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (rp: any) => rp.permissionId
  );

  const permissions = await db
    .select()
    .from(schema.permissions)
    .where(eq(schema.permissions.id, permissionIds[0]));

  return {
    ...user,
    role: role?.name || '',
    permissions: permissions.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => p.action
    ),
  };
}

function parseExpiryMs(expiry: string): number {
  const match = expiry.match(/^(\d+)([mhd])$/);
  if (!match) return 15 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 15 * 60 * 1000;
  }
}
