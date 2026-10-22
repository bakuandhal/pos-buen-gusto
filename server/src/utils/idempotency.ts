import { eq, and } from 'drizzle-orm';
import { getDb, schema } from '../db/connection';
import { esViolacionUnica } from './dbErrors';

/**
 * Resultado de una operación idempotente.
 * `replayed` indica que el resultado provino de una ejecución previa
 * con la misma clave, en lugar de una ejecución nueva.
 */
export interface IdempotentResult<T> {
  data: T;
  replayed: boolean;
}

/**
 * Ejecuta una operación de forma idempotente usando una clave de operación.
 *
 * Si la misma clave y operación ya se ejecutaron, devuelve el resultado
 * almacenado sin repetir los efectos. Esto evita que un doble clic, un
 * reintento de red o un timeout generen duplicados.
 */
export async function withIdempotency<T>(
  clave: string | undefined,
  operacion: string,
  ejecutar: () => Promise<T>
): Promise<IdempotentResult<T>> {
  if (!clave) {
    // Sin clave de idempotencia la operación se ejecuta directamente.
    const data = await ejecutar();
    return { data, replayed: false };
  }

  const db = getDb() as any;

  // Intentar reservar la clave antes de ejecutar.
  try {
    await db.insert(schema.operacionesIdempotentes).values({
      clave,
      operacion,
      resultado: null,
    });
  } catch (error: any) {
    // Solo una violación de unicidad significa que la clave ya existe.
    // Cualquier otro error (conexión, longitud, etc.) debe propagarse.
    if (!esViolacionUnica(error)) {
      throw error;
    }

    const [existente] = await db
      .select()
      .from(schema.operacionesIdempotentes)
      .where(
        and(
          eq(schema.operacionesIdempotentes.clave, clave),
          eq(schema.operacionesIdempotentes.operacion, operacion)
        )
      )
      .limit(1);

    if (existente && existente.resultado !== null) {
      return { data: existente.resultado as T, replayed: true };
    }

    // La clave está reservada pero la operación anterior no terminó.
    throw new IdempotenciaEnCursoError(clave, operacion);
  }

  let data: T;
  try {
    data = await ejecutar();
  } catch (error) {
    // Si la operación falló, liberar la reserva para permitir un reintento
    // corregido con la misma clave. No se ejecutó ningún efecto persistente
    // porque la operación es transaccional.
    await db
      .delete(schema.operacionesIdempotentes)
      .where(
        and(
          eq(schema.operacionesIdempotentes.clave, clave),
          eq(schema.operacionesIdempotentes.operacion, operacion)
        )
      );
    throw error;
  }

  await db
    .update(schema.operacionesIdempotentes)
    .set({ resultado: data as any })
    .where(
      and(
        eq(schema.operacionesIdempotentes.clave, clave),
        eq(schema.operacionesIdempotentes.operacion, operacion)
      )
    );

  return { data, replayed: false };
}

/**
 * Error lanzado cuando una operación idempotente está en curso.
 * El cliente debe consultar el estado antes de reintentar.
 */
export class IdempotenciaEnCursoError extends Error {
  public clave: string;
  public operacion: string;

  constructor(clave: string, operacion: string) {
    super(
      `La operación "${operacion}" con la clave "${clave}" ya está en curso. ` +
        'Consulte el resultado antes de reintentar.'
    );
    this.name = 'IdempotenciaEnCursoError';
    this.clave = clave;
    this.operacion = operacion;
  }
}
