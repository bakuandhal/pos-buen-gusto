import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createApp } from '../app';
import { config, resetConfig } from '../config';
import { hashPassword, comparePassword } from '../utils/password';

describe('Configuración del servidor', () => {
  beforeEach(() => {
    resetConfig();
  });

  it('debe cargar variables de entorno válidas', () => {
    const cfg = config();
    expect(cfg.PORT).toBeDefined();
    expect(cfg.HOST).toBeDefined();
    expect(cfg.NODE_ENV).toBeDefined();
  });

  it('debe fallar cuando falta DATABASE_URL', () => {
    const original = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    expect(() => config()).toThrow();
    process.env.DATABASE_URL = original;
    resetConfig();
  });

  it('debe fallar cuando JWT_SECRET es muy corto', () => {
    const original = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'corto';
    expect(() => config()).toThrow();
    process.env.JWT_SECRET = original;
    resetConfig();
  });
});

describe('GET /health', () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('debe responder con status ok', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { status: string; service: string };
    expect(body.status).toBe('ok');
    expect(body.service).toBe('pos-buen-gusto-api');
  });
});

describe('Autenticación (sin base de datos)', () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/auth/login devuelve error de servidor sin base de datos', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      body: { username: 'admin', password: 'password123' },
    });
    expect([500]).toContain(res.statusCode);
  });

  it('GET /api/v1/auth/me sin token debe devolver 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
    });
    expect(res.statusCode).toBe(401);
  });
});

describe('Hash de contraseñas', () => {
  it('debe hashear y verificar una contraseña correctamente', async () => {
    const hash = await hashPassword('mi-contraseña-segura');
    expect(hash).toBeDefined();
    expect(hash).not.toBe('mi-contraseña-segura');

    const isValid = await comparePassword('mi-contraseña-segura', hash);
    expect(isValid).toBe(true);

    const isInvalid = await comparePassword('contraseña-incorrecta', hash);
    expect(isInvalid).toBe(false);
  });
});
