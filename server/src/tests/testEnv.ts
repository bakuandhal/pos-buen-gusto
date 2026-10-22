import { expect } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { createApp } from '../app';
import { connectDb, closeDb, getDb, schema } from '../db/connection';
import { extractDatabaseName, getDatabaseUrl } from '../config';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Entorno de pruebas de integración.
 *
 * - Conecta contra la base de datos AISLADA (TEST_DATABASE_URL, verificada
 *   por `getDatabaseUrl()` que exige sufijo `_test`).
 * - Comprueba que la base conectada es realmente la de pruebas.
 * - Limpia las tablas operativas antes de cada prueba.
 * - Proporciona tokens JWT reales para los roles de prueba.
 *
 * Si la base no está preparada o sembrada, la creación falla con un mensaje
 * explícito. Las pruebas nunca se marcan como aprobadas por omisión.
 */
export class TestEnv {
  app: FastifyInstance;

  constructor(app: FastifyInstance) {
    this.app = app;
  }

  static async create(): Promise<TestEnv> {
    try {
      await connectDb();
    } catch (error) {
      const wrapped = new Error(
        'No se pudo conectar a la base de datos de pruebas. ' +
          'Ejecute "npm run db:test:setup" y "npm run db:test:seed" en server/. ' +
          `Causa: ${error instanceof Error ? error.message : String(error)}`
      );
      (wrapped as Error & { cause?: unknown }).cause = error;
      throw wrapped;
    }

    const db = getDb() as any;

    // Defensa en profundidad: la URL configurada y la base realmente
    // conectada deben coincidir y terminar en "_test".
    const esperada = extractDatabaseName(getDatabaseUrl());
    const resultado = await db.execute(sql`SELECT current_database() AS nombre`);
    const filas = Array.isArray(resultado) ? resultado : (resultado?.rows ?? []);
    const actual = filas[0]?.nombre as string | undefined;

    if (!actual || !actual.endsWith('_test') || actual !== esperada) {
      throw new Error(
        `Base de datos de pruebas insegura: se esperaba "${esperada}" (_test) ` +
          `pero se conectó a "${actual ?? 'desconocida'}". Se abortan las pruebas.`
      );
    }

    const [admin] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.username, 'admin_test'))
      .limit(1);

    if (!admin) {
      throw new Error(
        'La base de datos de pruebas no está sembrada. ' +
          'Ejecute "npm run db:test:seed" en server/.'
      );
    }

    const app = await createApp();
    await app.ready();
    return new TestEnv(app);
  }

  /** Acceso directo a la base de pruebas para comprobaciones puntuales. */
  get db(): any {
    return getDb() as any;
  }

  async close(): Promise<void> {
    await this.app.close();
    await closeDb();
  }

  /** Elimina los datos operativos conservando roles, permisos, usuarios y catálogo. */
  async limpiar(): Promise<void> {
    const db = this.db;
    await db.delete(schema.comandas);
    await db.delete(schema.platosIndividuales);
    await db.delete(schema.pedidos);
    await db.delete(schema.operacionesIdempotentes);
    await db.delete(schema.refreshTokens);
    await db.update(schema.mesas).set({ estado: 'disponible', comensales: 0 });
    // Las pruebas pueden crear mesas adicionales; la mesa 1 es la sembrada.
    await db.delete(schema.mesas).where(sql`${schema.mesas.numero} <> 1`);
  }

  /** Inicia sesión y devuelve los tokens. */
  async login(username: string, password = 'PasswordPruebas123'): Promise<TokenResponse> {
    const res = await this.app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      body: { username, password },
    });

    expect(res.statusCode, `login falló: ${res.body}`).toBe(200);

    const body = res.json() as { tokens: TokenResponse };
    return body.tokens;
  }

  /** Token de administrador (tiene todos los permisos). */
  async tokenAdmin(): Promise<string> {
    const tokens = await this.login('admin_test');
    return tokens.accessToken;
  }

  /** Token de mesero. */
  async tokenMesero(): Promise<string> {
    const tokens = await this.login('mesero_test');
    return tokens.accessToken;
  }

  /** Token de caja (sin permisos de pedidos ni de comandas). */
  async tokenCaja(): Promise<string> {
    const tokens = await this.login('caja_test');
    return tokens.accessToken;
  }

  /** Identificador de la modalidad "Almuerzo en Mesa". */
  async idModalidadEnMesa(): Promise<number> {
    return this.idModalidad('Almuerzo en Mesa');
  }

  /** Identificador de la modalidad "Almuerzo Para Llevar". */
  async idModalidadParaLlevar(): Promise<number> {
    return this.idModalidad('Almuerzo Para Llevar');
  }

  async idModalidad(nombre: string): Promise<number> {
    const [modalidad] = await this.db
      .select()
      .from(schema.modalidades)
      .where(eq(schema.modalidades.nombre, nombre))
      .limit(1);
    expect(modalidad, `no existe la modalidad de prueba "${nombre}"`).toBeDefined();
    return modalidad.id;
  }

  /** Identificador del producto "Almuerzo Completo". */
  async idProducto(): Promise<number> {
    return this.idProductoPorNombre('Almuerzo Completo');
  }

  async idProductoPorNombre(nombre: string): Promise<number> {
    const [producto] = await this.db
      .select()
      .from(schema.productos)
      .where(eq(schema.productos.nombre, nombre))
      .limit(1);
    expect(producto, `no existe el producto de prueba "${nombre}"`).toBeDefined();
    return producto.id;
  }

  async obtenerModalidad(id: number): Promise<any> {
    const [modalidad] = await this.db
      .select()
      .from(schema.modalidades)
      .where(eq(schema.modalidades.id, id))
      .limit(1);
    expect(modalidad, `no existe la modalidad ${id}`).toBeDefined();
    return modalidad;
  }

  async actualizarPrecioModalidad(id: number, precioBaseCentavos: number): Promise<void> {
    await this.db
      .update(schema.modalidades)
      .set({ precioBaseCentavos, actualizadoEn: new Date() })
      .where(eq(schema.modalidades.id, id));
  }

  async idOpcion(nombre: string): Promise<number> {
    const [opcion] = await this.db
      .select()
      .from(schema.opciones)
      .where(eq(schema.opciones.nombre, nombre))
      .limit(1);
    expect(opcion, `no existe la opción de prueba "${nombre}"`).toBeDefined();
    return opcion.id;
  }

  async idAdicional(nombre: string): Promise<number> {
    const [adicional] = await this.db
      .select()
      .from(schema.adicionales)
      .where(eq(schema.adicionales.nombre, nombre))
      .limit(1);
    expect(adicional, `no existe el adicional de prueba "${nombre}"`).toBeDefined();
    return adicional.id;
  }

  /** Identificador de la mesa 1. */
  async idMesa(): Promise<number> {
    const [mesa] = await this.db
      .select()
      .from(schema.mesas)
      .where(eq(schema.mesas.numero, 1))
      .limit(1);
    expect(mesa, 'no existe la mesa de prueba').toBeDefined();
    return mesa.id;
  }
}
