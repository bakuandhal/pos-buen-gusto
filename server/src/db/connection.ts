import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { getDatabaseUrl } from '../config';
import * as schema from './schema';

let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    throw new Error('Base de datos no inicializada. Llame a connectDb() primero.');
  }
  return dbInstance;
}

export async function connectDb() {
  if (pool) {
    return dbInstance;
  }

  const connectionString = getDatabaseUrl();

  try {
    pool = new Pool({ connectionString });
    dbInstance = drizzle(pool, { schema });

    // Verificar conexión con una consulta simple
    await dbInstance.select().from(schema.roles).limit(1);

    return dbInstance;
  } catch (error) {
    pool = null;
    dbInstance = null;
    // eslint-disable-next-line preserve-caught-error
    throw new Error(
      `No se pudo conectar a la base de datos: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
    dbInstance = null;
  }
}

export { schema };
