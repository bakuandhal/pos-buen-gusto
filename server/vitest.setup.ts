import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// ── Carga de .env local (no versionado) ──
// Permite usar credenciales reales de PostgreSQL sin commitearlas.
function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;

  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Las variables ya definidas en el entorno tienen prioridad
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const serverRoot = resolve(__dirname, "..");
const projectRoot = resolve(serverRoot, "..");

loadEnvFile(resolve(projectRoot, ".env"));
loadEnvFile(resolve(serverRoot, ".env"));

// ── Modo de pruebas ──
process.env.NODE_ENV = "test";

// Base de datos de DESARROLLO (no de pruebas).
// Se define solo para que el guardia de aislamiento pueda compararla con
// la base de pruebas. Nunca se usa para conectar en modo test.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://postgres:postgres@localhost:5432/pos_buen_gusto";
}

// Base de datos AISLADA de pruebas. Debe terminar en "_test".
if (!process.env.TEST_DATABASE_URL) {
  process.env.TEST_DATABASE_URL =
    "postgresql://postgres:postgres@localhost:5432/pos_buen_gusto_test";
}

process.env.JWT_SECRET =
  process.env.JWT_SECRET || "clave-de-prueba-para-desarrollo-solo-123456789012";
process.env.JWT_ACCESS_TOKEN_EXPIRY = "15m";
process.env.JWT_REFRESH_TOKEN_EXPIRY = "7d";
process.env.CORS_ORIGINS = "http://localhost:1420";
process.env.PORT = "3000";
process.env.HOST = "0.0.0.0";
