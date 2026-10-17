import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida de PostgreSQL'),
  TEST_DATABASE_URL: z.string().url().optional(),
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

// Alias para compatibilidad con imports existentes
export const config = getConfig;

export type { Env };
