/**
 * Prepara la base de datos aislada de pruebas.
 *
 * - Verifica que la identidad de la base de pruebas sea segura ANTES de tocar nada.
 * - Aplica las migraciones de Drizzle.
 * - NO recrea bases de datos ni ejecuta operaciones destructivas salvo que se
 *   pase explícitamente el flag `--reset`.
 *
 * Uso: npm run db:test:setup            (desde server/)
 *      npm run db:test:setup -- --reset (vacía los esquemas de la base de pruebas)
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { getConfig, extractDatabaseName } from '../src/config';
import * as schema from '../src/db/schema';

function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  const raw = readFileSync(path, 'utf8');
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const serverRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
loadEnvFile(resolve(serverRoot, '..', '.env'));
loadEnvFile(resolve(serverRoot, '.env'));

async function main() {
  const env = getConfig();

  if (!env.TEST_DATABASE_URL) {
    console.error(
      'TEST_DATABASE_URL no está configurada. No se puede preparar la base de pruebas.'
    );
    process.exit(1);
  }

  // ── Guardas de seguridad ──
  const testDbName = extractDatabaseName(env.TEST_DATABASE_URL);

  if (!testDbName.endsWith('_test')) {
    console.error(
      `ABORTADO: la base de pruebas "${testDbName}" no termina en "_test". ` +
        'Se exige un nombre inequívoco para no afectar datos reales.'
    );
    process.exit(1);
  }

  if (env.DATABASE_URL && env.TEST_DATABASE_URL === env.DATABASE_URL) {
    console.error(
      'ABORTADO: TEST_DATABASE_URL y DATABASE_URL son iguales. ' +
        'Las pruebas podrían borrar datos reales.'
    );
    process.exit(1);
  }

  if (env.DATABASE_URL && extractDatabaseName(env.DATABASE_URL) === testDbName) {
    console.error(
      'ABORTADO: TEST_DATABASE_URL y DATABASE_URL apuntan al mismo nombre de base de datos. ' +
        'Las pruebas podrían borrar datos reales.'
    );
    process.exit(1);
  }

  console.log(`Base de datos de pruebas: ${testDbName}`);

  const pool = new Pool({ connectionString: env.TEST_DATABASE_URL });

  try {
    // Verificar que la base existe (no se crea aquí).
    const { rows } = await pool.query('SELECT current_database() AS nombre');
    const actual = rows[0].nombre as string;

    if (actual !== testDbName) {
      console.error(
        `ABORTADO: se esperaba la base "${testDbName}" pero el servidor reporta "${actual}".`
      );
      process.exit(1);
    }

    // ── Reset explícito (opt-in) ──
    // Solo se permite tras verificar la identidad de la base de pruebas.
    // Se eliminan también los metadatos de Drizzle para que las migraciones
    // se apliquen de nuevo sobre un esquema vacío.
    if (process.argv.includes('--reset')) {
      console.log(
        'Aplicando --reset: se vacían los esquemas public y drizzle de la base de pruebas.'
      );
      await pool.query('DROP SCHEMA IF EXISTS public CASCADE');
      await pool.query('DROP SCHEMA IF EXISTS drizzle CASCADE');
      await pool.query('CREATE SCHEMA public');
      console.log('Esquemas recreados.');
    }

    console.log('Conexión verificada. Aplicando migraciones...');

    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: resolve(serverRoot, 'drizzle') });

    console.log('Migraciones aplicadas correctamente.');

    // Verificar que las tablas clave existen.
    const { rows: tablas } = await pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' ORDER BY table_name`
    );
    const nombres = tablas.map((t: any) => t.table_name as string);

    const requeridas = [
      'mesas',
      'pedidos',
      'platos_individuales',
      'comandas',
      'productos',
      'modalidades',
      'roles',
      'users',
      'operaciones_idempotentes',
    ];

    const faltantes = requeridas.filter((t) => !nombres.includes(t));
    if (faltantes.length > 0) {
      console.error(`Faltan tablas tras la migración: ${faltantes.join(', ')}`);
      process.exit(1);
    }

    console.log(`Tablas verificadas (${nombres.length} en total).`);
    console.log('Base de datos de pruebas lista.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Error preparando la base de datos de pruebas:', error);
  process.exit(1);
});
