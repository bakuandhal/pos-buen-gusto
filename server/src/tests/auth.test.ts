import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { TestEnv } from './testEnv';
import { config, resetConfig, getDatabaseUrl, extractDatabaseName } from '../config';
import { schema } from '../db/connection';
import { hashPassword, comparePassword } from '../utils/password';

describe('Configuración y aislamiento de base de datos', () => {
  it('carga una configuración válida en modo test', () => {
    resetConfig();
    const cfg = config();
    expect(cfg.NODE_ENV).toBe('test');
    expect(cfg.PORT).toBeDefined();
    expect(cfg.HOST).toBeDefined();
    expect(cfg.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
  });

  it('la URL de pruebas es distinta de la de desarrollo y termina en _test', () => {
    resetConfig();
    const url = getDatabaseUrl();
    expect(extractDatabaseName(url)).toMatch(/_test$/);
    expect(url).not.toBe(process.env.DATABASE_URL);
  });

  it('falla si TEST_DATABASE_URL no está definida', () => {
    const original = process.env.TEST_DATABASE_URL;
    try {
      delete process.env.TEST_DATABASE_URL;
      resetConfig();
      expect(() => getDatabaseUrl()).toThrow(/TEST_DATABASE_URL/);
    } finally {
      process.env.TEST_DATABASE_URL = original;
      resetConfig();
    }
  });

  it('rechaza una base de pruebas que no termina en _test', () => {
    const original = process.env.TEST_DATABASE_URL;
    try {
      process.env.TEST_DATABASE_URL =
        'postgresql://postgres:postgres@localhost:5432/pos_buen_gusto';
      resetConfig();
      expect(() => getDatabaseUrl()).toThrow(/_test/);
    } finally {
      process.env.TEST_DATABASE_URL = original;
      resetConfig();
    }
  });

  it('rechaza que TEST_DATABASE_URL y DATABASE_URL sean iguales', () => {
    const original = process.env.TEST_DATABASE_URL;
    try {
      process.env.TEST_DATABASE_URL = process.env.DATABASE_URL;
      resetConfig();
      expect(() => getDatabaseUrl()).toThrow(/misma base de datos/);
    } finally {
      process.env.TEST_DATABASE_URL = original;
      resetConfig();
    }
  });

  it('falla si JWT_SECRET es demasiado corto', () => {
    const original = process.env.JWT_SECRET;
    try {
      process.env.JWT_SECRET = 'corto';
      resetConfig();
      expect(() => config()).toThrow();
    } finally {
      process.env.JWT_SECRET = original;
      resetConfig();
    }
  });
});

describe('Autenticación y sesiones', () => {
  let env: TestEnv;

  beforeAll(async () => {
    env = await TestEnv.create();
  });

  afterAll(async () => {
    await env.close();
  });

  beforeEach(async () => {
    await env.limpiar();
  });

  it('POST /auth/login autentica al administrador y devuelve permisos', async () => {
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      body: { username: 'admin_test', password: 'PasswordPruebas123' },
    });

    expect(res.statusCode, res.body).toBe(200);
    const body = res.json() as any;
    expect(body.user.username).toBe('admin_test');
    expect(body.user.role).toBe('administrador');
    expect(body.user.permissions).toContain('configurar_precios');
    expect(typeof body.tokens.accessToken).toBe('string');
    expect(typeof body.tokens.refreshToken).toBe('string');
  });

  it('POST /auth/login rechaza credenciales incorrectas con 401', async () => {
    const password = await env.app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      body: { username: 'admin_test', password: 'incorrecta' },
    });
    expect(password.statusCode).toBe(401);
    expect((password.json() as any).error).toBe('credenciales_invalidas');

    const username = await env.app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      body: { username: 'no_existe', password: 'PasswordPruebas123' },
    });
    expect(username.statusCode).toBe(401);
  });

  it('POST /auth/login rechaza usuarios inactivos', async () => {
    await env.db
      .update(schema.users)
      .set({ isActive: false })
      .where(eq(schema.users.username, 'admin_test'));

    try {
      const res = await env.app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        body: { username: 'admin_test', password: 'PasswordPruebas123' },
      });
      expect(res.statusCode).toBe(401);
    } finally {
      await env.db
        .update(schema.users)
        .set({ isActive: true })
        .where(eq(schema.users.username, 'admin_test'));
    }
  });

  it('POST /auth/login valida el cuerpo de la solicitud', async () => {
    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      body: {},
    });
    expect(res.statusCode).toBe(400);
    expect((res.json() as any).error).toBe('validacion_fallida');
  });

  it('GET /auth/me devuelve la identidad y permisos del token', async () => {
    const tokens = await env.login('admin_test');
    const res = await env.app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { authorization: `Bearer ${tokens.accessToken}` },
    });

    expect(res.statusCode, res.body).toBe(200);
    const user = (res.json() as any).user;
    expect(user.username).toBe('admin_test');
    expect(user.role).toBe('administrador');
    expect(user.id).toBeGreaterThan(0);
    expect(user.permissions).toContain('configurar_precios');
  });

  it('GET /auth/me rechaza solicitudes sin token o con token inválido', async () => {
    const sinToken = await env.app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
    });
    expect(sinToken.statusCode).toBe(401);

    const invalido = await env.app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { authorization: 'Bearer token-invalido' },
    });
    expect(invalido.statusCode).toBe(401);
  });

  it('POST /auth/refresh rota el token y rechaza la reutilización del anterior', async () => {
    const original = await env.login('admin_test');

    const res = await env.app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      body: { refreshToken: original.refreshToken },
    });
    expect(res.statusCode, res.body).toBe(200);
    const nuevos = res.json() as any;
    expect(nuevos.refreshToken).not.toBe(original.refreshToken);

    const me = await env.app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { authorization: `Bearer ${nuevos.accessToken}` },
    });
    expect(me.statusCode).toBe(200);
    expect((me.json() as any).user.username).toBe('admin_test');

    const reutilizado = await env.app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      body: { refreshToken: original.refreshToken },
    });
    expect(reutilizado.statusCode).toBe(401);
    expect((reutilizado.json() as any).error).toBe('token_invalido');
  });

  it('POST /auth/logout revoca el token de renovación', async () => {
    const tokens = await env.login('mesero_test');

    const logout = await env.app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      body: { refreshToken: tokens.refreshToken },
    });
    expect(logout.statusCode, logout.body).toBe(200);

    const refresh = await env.app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      body: { refreshToken: tokens.refreshToken },
    });
    expect(refresh.statusCode).toBe(401);
  });
});

describe('Hash de contraseñas', () => {
  it('hashea y verifica una contraseña correctamente', async () => {
    const hash = await hashPassword('mi-contraseña-segura');
    expect(hash).toBeDefined();
    expect(hash).not.toBe('mi-contraseña-segura');

    expect(await comparePassword('mi-contraseña-segura', hash)).toBe(true);
    expect(await comparePassword('contraseña-incorrecta', hash)).toBe(false);
  });
});
