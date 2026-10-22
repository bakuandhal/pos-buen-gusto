import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida de PostgreSQL').optional(),
  TEST_DATABASE_URL: z
    .string()
    .url('TEST_DATABASE_URL debe ser una URL válida de PostgreSQL')
    .optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:1420'),
});

type Env = z.infer<typeof envSchema>;

let envCache: Env | null = null;

export function getConfig(): Env {
  if (envCache) {
    return envCache;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const missing = Object.keys(parsed.error.flatten().fieldErrors);
    throw new Error(`Variables de entorno faltantes o inválidas: ${missing.join(', ')}`);
  }

  envCache = parsed.data;
  return envCache;
}

export function resetConfig(): void {
  envCache = null;
}

/**
 * Nombre de la base de datos extraído de una URL de PostgreSQL.
 * Se usa para verificar el aislamiento entre base de datos de pruebas y producción.
 */
export function extractDatabaseName(url: string): string {
  try {
    const parsed = new URL(url);
    const name = parsed.pathname.replace(/^\//, '');
    return name;
  } catch {
    return '';
  }
}

/**
 * Resuelve la URL de base de datos según el entorno.
 *
 * En modo `test` exige `TEST_DATABASE_URL` y aplica dos guardas de seguridad:
 *  1. La base de pruebas debe ser distinta de la de producción.
 *  2. El nombre de la base de pruebas debe terminar en `_test`.
 *
 * Esto evita que una ejecución de pruebas borre datos de una base real.
 */
export function getDatabaseUrl(): string {
  const env = getConfig();

  if (env.NODE_ENV === 'test') {
    if (!env.TEST_DATABASE_URL) {
      throw new Error(
        'TEST_DATABASE_URL es obligatoria cuando NODE_ENV=test. ' +
          'Las pruebas de integración no deben ejecutarse contra la base de datos de desarrollo.'
      );
    }

    if (env.DATABASE_URL && env.TEST_DATABASE_URL === env.DATABASE_URL) {
      throw new Error(
        'TEST_DATABASE_URL y DATABASE_URL apuntan a la misma base de datos. ' +
          'Se rechaza la ejecución para no afectar datos reales.'
      );
    }

    const testDbName = extractDatabaseName(env.TEST_DATABASE_URL);
    if (!testDbName.endsWith('_test')) {
      throw new Error(
        `La base de datos de pruebas debe terminar en "_test" (recibido: "${testDbName}"). ` +
          'Se rechaza la ejecución para no afectar datos reales.'
      );
    }

    return env.TEST_DATABASE_URL;
  }

  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL es obligatoria fuera del modo test.');
  }

  return env.DATABASE_URL;
}

// Alias para compatibilidad con imports existentes
export const config = getConfig;

export type { Env };
