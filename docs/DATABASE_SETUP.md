# Configuración de Base de Datos — POS Buen Gusto

## Visión general

La base de datos utiliza PostgreSQL con Drizzle ORM para la persistencia y Drizzle Kit para la gestión de migraciones versionadas.

## Stack

| Componente | Versión | Propósito |
|------------|---------|-----------|
| PostgreSQL | 14+ | Motor de base de datos relacional |
| Drizzle ORM | ^0.45.0 | ORM tipado para TypeScript |
| Drizzle Kit | ^0.30.0 | Generación y aplicación de migraciones |
| pg | ^8.13.0 | Controlador de PostgreSQL para Node.js |

## Variables de entorno

Definidas en `.env.example`:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión a PostgreSQL principal | `postgresql://usuario:pass@localhost:5432/pos_buen_gusto` |
| `TEST_DATABASE_URL` | Conexión a base de datos de pruebas | `postgresql://usuario:pass@localhost:5432/pos_buen_gusto_test` |

**Nunca commitear credenciales reales.** El archivo `.env` está en `.gitignore`.

## Esquema de base de datos

El esquema está definido en `server/src/db/schema/index.ts` y contempla las siguientes tablas:

| Tabla | Descripción |
|-------|-------------|
| `roles` | Roles del sistema (administrador, mesero, caja) |
| `permissions` | Permisos individuales (abrir_mesa, agregar_pedido, etc.) |
| `role_permissions` | Asociación muchos-a-muchos entre roles y permisos |
| `users` | Usuarios del sistema con hash de contraseña |
| `refresh_tokens` | Tokens de renovación de sesión (hash almacenado) |
| `audit_logs` | Registro de operaciones de auditoría |

## Migraciones

Drizzle Kit gestiona las migraciones versionadas en `server/drizzle/`.

### Comandos disponibles

```powershell
# Generar una nueva migración a partir de cambios en el esquema
npm run db:generate

# Aplicar migraciones pendientes a la base de datos
npm run db:migrate

# Abrir Drizzle Studio (interfaz visual de la base de datos)
npm run db:studio
```

### Flujo de trabajo

1. Modificar `server/src/db/schema/index.ts` con los cambios de esquema.
2. Ejecutar `npm run db:generate` para crear el archivo de migración SQL.
3. Inspeccionar el archivo generado en `server/drizzle/meta/` o `server/drizzle/`.
4. Ejecutar `npm run db:migrate` para aplicar a la base de datos.
5. Verificar que la aplicación funcione correctamente.

**Nunca ejecutar migraciones destructivas en producción.**

## Conexión

La conexión se gestiona en `server/src/db/connection.ts`:
- Pool de conexiones de `pg` con manejo de errores.
- `connectDb()` establece la conexión y verifica que la base de datos responde.
- `closeDb()` cierra el pool ordenadamente al apagar el servidor.
- `getDb()` devuelve la instancia de Drizzle para consultas.

## Esquema inicial (Fase 3)

La Fase 3 implementa las tablas de identidad, seguridad y auditoría. Las tablas de negocio (mesas, platos, pedidos, comandas, cuentas, pagos, modalidades, tarifas) se implementarán en fases posteriores (4 y 5).

No se implementa `drizzle-kit push` para cambios que deban quedar auditados; se usan migraciones versionadas exclusivamente.
