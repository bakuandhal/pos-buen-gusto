/**
 * Siembra datos mínimos de desarrollo en la base de datos de pruebas.
 *
 * Crea roles, permisos, usuarios de prueba y un catálogo de ejemplo.
 * Es idempotente: se puede ejecutar varias veces.
 *
 * Uso: npm run db:test:seed   (desde server/)
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { getConfig, extractDatabaseName } from '../src/config';
import * as schema from '../src/db/schema';
import { hashPassword } from '../src/utils/password';

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

const PERMISOS: { action: string; description: string }[] = [
  { action: 'abrir_mesa', description: 'Abrir mesas y servicios' },
  { action: 'agregar_pedido', description: 'Agregar platos a pedidos' },
  { action: 'modificar_pedido', description: 'Modificar pedidos en borrador' },
  { action: 'cancelar_plato', description: 'Cancelar platos de un pedido' },
  { action: 'enviar_comanda', description: 'Enviar comandas a cocina' },
  { action: 'configurar_precios', description: 'Administrar catálogo y tarifas' },
  { action: 'registrar_cobro', description: 'Registrar cobros' },
  { action: 'cerrar_cuenta', description: 'Cerrar cuentas' },
  { action: 'gestionar_usuarios', description: 'Gestionar usuarios y roles' },
];

const ROLES: { name: string; description: string; permisos: string[] }[] = [
  {
    name: 'administrador',
    description: 'Acceso total a administración',
    permisos: PERMISOS.map((p) => p.action),
  },
  {
    name: 'mesero',
    description: 'Toma pedidos y envía comandas',
    permisos: [
      'abrir_mesa',
      'agregar_pedido',
      'modificar_pedido',
      'cancelar_plato',
      'enviar_comanda',
    ],
  },
  {
    name: 'caja',
    description: 'Registra cobros y cierra cuentas',
    permisos: ['registrar_cobro', 'cerrar_cuenta', 'abrir_mesa'],
  },
];

async function main() {
  const env = getConfig();

  if (!env.TEST_DATABASE_URL) {
    console.error('TEST_DATABASE_URL no configurada.');
    process.exit(1);
  }

  const testDbName = extractDatabaseName(env.TEST_DATABASE_URL);
  if (!testDbName.endsWith('_test')) {
    console.error(
      `ABORTADO: la base "${testDbName}" no termina en "_test". No se siembra.`
    );
    process.exit(1);
  }
  if (env.DATABASE_URL && env.TEST_DATABASE_URL === env.DATABASE_URL) {
    console.error('ABORTADO: la base de pruebas es igual a la de desarrollo.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: env.TEST_DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    // ── Permisos ──
    for (const permiso of PERMISOS) {
      const [existente] = await db
        .select()
        .from(schema.permissions)
        .where(eq(schema.permissions.action, permiso.action as any))
        .limit(1);
      if (!existente) {
        await db.insert(schema.permissions).values(permiso as any);
      }
    }
    console.log(`Permisos verificados (${PERMISOS.length}).`);

    // ── Roles y sus permisos ──
    for (const rol of ROLES) {
      let [registro] = await db
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.name, rol.name))
        .limit(1);

      if (!registro) {
        [registro] = await db
          .insert(schema.roles)
          .values({ name: rol.name, description: rol.description, isActive: true })
          .returning();
        console.log(`Rol "${rol.name}" creado.`);
      }

      for (const accion of rol.permisos) {
        const [permiso] = await db
          .select()
          .from(schema.permissions)
          .where(eq(schema.permissions.action, accion as any))
          .limit(1);
        if (!permiso) continue;

        const [existente] = await db
          .select()
          .from(schema.rolePermissions)
          .where(
            and(
              eq(schema.rolePermissions.roleId, registro.id),
              eq(schema.rolePermissions.permissionId, permiso.id)
            )
          )
          .limit(1);

        if (!existente) {
          await db
            .insert(schema.rolePermissions)
            .values({ roleId: registro.id, permissionId: permiso.id });
        }
      }
    }
    console.log(`Roles verificados (${ROLES.length}).`);

    // ── Usuarios de prueba ──
    const usuarios = [
      {
        username: 'admin_test',
        email: 'admin_test@pos.local',
        fullName: 'Administrador de Pruebas',
        role: 'administrador',
      },
      {
        username: 'mesero_test',
        email: 'mesero_test@pos.local',
        fullName: 'Mesero de Pruebas',
        role: 'mesero',
      },
      {
        username: 'caja_test',
        email: 'caja_test@pos.local',
        fullName: 'Caja de Pruebas',
        role: 'caja',
      },
    ];

    const passwordHash = await hashPassword('PasswordPruebas123');

    for (const usuario of usuarios) {
      const [existente] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, usuario.username))
        .limit(1);
      if (existente) continue;

      const [rol] = await db
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.name, usuario.role))
        .limit(1);

      await db.insert(schema.users).values({
        username: usuario.username,
        email: usuario.email,
        fullName: usuario.fullName,
        passwordHash,
        roleId: rol.id,
        isActive: true,
      });
      console.log(`Usuario "${usuario.username}" creado.`);
    }

    // ── Catálogo mínimo ──
    const [producto] = await db
      .select()
      .from(schema.productos)
      .where(eq(schema.productos.nombre, 'Almuerzo Completo'))
      .limit(1);

    let productoId = producto?.id;
    if (!producto) {
      const [nuevo] = await db
        .insert(schema.productos)
        .values({
          nombre: 'Almuerzo Completo',
          descripcion: 'Almuerzo de prueba con sopa, proteína y acompañamientos',
          ordenPresentacion: 0,
          estaActivo: true,
        })
        .returning();
      productoId = nuevo.id;
      console.log('Producto "Almuerzo Completo" creado.');
    }

    const modalidades = [
      {
        nombre: 'Almuerzo en Mesa',
        precioBaseCentavos: 8500,
        incluyeSopa: true,
      },
      {
        nombre: 'Almuerzo Para Llevar',
        precioBaseCentavos: 7000,
        incluyeSopa: false,
      },
    ];

    for (const modalidad of modalidades) {
      const [existente] = await db
        .select()
        .from(schema.modalidades)
        .where(
          and(
            eq(schema.modalidades.productoId, productoId!),
            eq(schema.modalidades.nombre, modalidad.nombre)
          )
        )
        .limit(1);
      if (existente) continue;

      await db.insert(schema.modalidades).values({
        productoId: productoId!,
        nombre: modalidad.nombre,
        descripcion: 'Modalidad de prueba',
        precioBaseCentavos: modalidad.precioBaseCentavos,
        incluyeSopa: modalidad.incluyeSopa,
        estaActivo: true,
      });
      console.log(`Modalidad "${modalidad.nombre}" creada.`);
    }

    // ── Configuración de platos de prueba ──
    // Grupo opcional de proteína (no altera el precio base).
    let [grupoProteina] = await db
      .select()
      .from(schema.gruposOpciones)
      .where(
        and(
          eq(schema.gruposOpciones.productoId, productoId!),
          eq(schema.gruposOpciones.nombre, 'Proteína')
        )
      )
      .limit(1);

    if (!grupoProteina) {
      [grupoProteina] = await db
        .insert(schema.gruposOpciones)
        .values({
          productoId: productoId!,
          nombre: 'Proteína',
          descripcion: 'Elección de proteína (opcional para pruebas)',
          esObligatorio: false,
          cantidadMinima: 0,
          cantidadMaxima: 1,
          permiteVariasElecciones: false,
          estaActivo: true,
        })
        .returning();
      console.log('Grupo "Proteína" creado.');
    }

    let [grupoSopa] = await db
      .select()
      .from(schema.gruposOpciones)
      .where(
        and(
          eq(schema.gruposOpciones.productoId, productoId!),
          eq(schema.gruposOpciones.nombre, 'Sopa')
        )
      )
      .limit(1);

    if (!grupoSopa) {
      [grupoSopa] = await db
        .insert(schema.gruposOpciones)
        .values({
          productoId: productoId!,
          nombre: 'Sopa',
          descripcion: 'Sopa incluida o sustituible',
          esObligatorio: false,
          cantidadMinima: 0,
          cantidadMaxima: 1,
          permiteVariasElecciones: false,
          estaActivo: true,
        })
        .returning();
      console.log('Grupo "Sopa" creado.');
    }

    async function asegurarOpcion(grupoId: number, nombre: string) {
      let [opcion] = await db
        .select()
        .from(schema.opciones)
        .where(
          and(
            eq(schema.opciones.grupoId, grupoId),
            eq(schema.opciones.nombre, nombre)
          )
        )
        .limit(1);

      if (!opcion) {
        [opcion] = await db
          .insert(schema.opciones)
          .values({
            grupoId,
            nombre,
            estaActivo: true,
            ordenPresentacion: 0,
          })
          .returning();
        console.log(`Opción "${nombre}" creada.`);
      }

      return opcion;
    }

    await asegurarOpcion(grupoProteina.id, 'Pollo');
    await asegurarOpcion(grupoProteina.id, 'Carne');
    const opcionSopa = await asegurarOpcion(grupoSopa.id, 'Sopa del día');
    const opcionEnsalada = await asegurarOpcion(grupoSopa.id, 'Ensalada');

    const [modalidadMesa] = await db
      .select()
      .from(schema.modalidades)
      .where(
        and(
          eq(schema.modalidades.productoId, productoId!),
          eq(schema.modalidades.nombre, 'Almuerzo en Mesa')
        )
      )
      .limit(1);

    if (modalidadMesa) {
      const [incluida] = await db
        .select()
        .from(schema.opcionesIncluidasModalidad)
        .where(
          and(
            eq(schema.opcionesIncluidasModalidad.modalidadId, modalidadMesa.id),
            eq(schema.opcionesIncluidasModalidad.opcionId, opcionSopa.id)
          )
        )
        .limit(1);

      if (!incluida) {
        await db.insert(schema.opcionesIncluidasModalidad).values({
          modalidadId: modalidadMesa.id,
          opcionId: opcionSopa.id,
        });
        console.log('Opción "Sopa del día" incluida en modalidad de mesa.');
      }

      const [sustitucion] = await db
        .select()
        .from(schema.sustituciones)
        .where(
          and(
            eq(schema.sustituciones.modalidadId, modalidadMesa.id),
            eq(schema.sustituciones.opcionOriginalId, opcionSopa.id),
            eq(schema.sustituciones.opcionSustitutaId, opcionEnsalada.id)
          )
        )
        .limit(1);

      if (!sustitucion) {
        await db.insert(schema.sustituciones).values({
          modalidadId: modalidadMesa.id,
          opcionOriginalId: opcionSopa.id,
          opcionSustitutaId: opcionEnsalada.id,
          ajustePrecioCentavos: 500,
          estaActivo: true,
        });
        console.log('Sustitución "Sopa del día" → "Ensalada" (+500) creada.');
      }
    }

    const [adicional] = await db
      .select()
      .from(schema.adicionales)
      .where(
        and(
          eq(schema.adicionales.productoId, productoId!),
          eq(schema.adicionales.nombre, 'Doble proteína')
        )
      )
      .limit(1);

    if (!adicional) {
      await db.insert(schema.adicionales).values({
        productoId: productoId!,
        nombre: 'Doble proteína',
        descripcion: 'Porción adicional de proteína',
        precioCentavos: 1500,
        estaActivo: true,
        cantidadMaxima: 2,
      });
      console.log('Adicional "Doble proteína" creado.');
    }

    // ── Mesa de prueba ──
    const [mesa] = await db
      .select()
      .from(schema.mesas)
      .where(eq(schema.mesas.numero, 1))
      .limit(1);
    if (!mesa) {
      await db.insert(schema.mesas).values({
        numero: 1,
        estado: 'disponible',
        comensales: 0,
      });
      console.log('Mesa 1 creada.');
    }

    console.log('Semilla de pruebas aplicada.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Error aplicando la semilla de pruebas:', error);
  process.exit(1);
});
