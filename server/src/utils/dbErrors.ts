interface ErrorConCodigo {
  code?: unknown;
  constraint?: unknown;
  cause?: unknown;
}

/**
 * Extrae el código SQLSTATE de un error de PostgreSQL.
 *
 * Drizzle puede envolver el error original en un `DrizzleQueryError`, por lo
 * que se recorre la cadena de `cause` hasta encontrar el código real.
 */
export function codigoPostgres(error: unknown): string | undefined {
  let actual: unknown = error;

  for (let intento = 0; intento < 5 && actual && typeof actual === 'object'; intento++) {
    const candidato = actual as ErrorConCodigo;
    if (typeof candidato.code === 'string') {
      return candidato.code;
    }
    actual = candidato.cause;
  }

  return undefined;
}

/** Indica si el error es una violación de unicidad (SQLSTATE 23505). */
export function esViolacionUnica(error: unknown, constraint?: string): boolean {
  if (codigoPostgres(error) !== '23505') {
    return false;
  }

  if (!constraint) {
    return true;
  }

  let actual: unknown = error;
  for (let intento = 0; intento < 5 && actual && typeof actual === 'object'; intento++) {
    const candidato = actual as ErrorConCodigo;
    if (candidato.constraint === constraint) {
      return true;
    }
    actual = candidato.cause;
  }

  return false;
}
