import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Enumeraciones ──
export const userRoleEnum = pgEnum('user_role', ['administrador', 'mesero', 'caja']);
export const permissionActionEnum = pgEnum('permission_action', [
  'abrir_mesa',
  'agregar_pedido',
  'modificar_pedido',
  'cancelar_plato',
  'enviar_comanda',
  'configurar_precios',
  'registrar_cobro',
  'cerrar_cuenta',
  'gestionar_usuarios',
]);
export const auditActionEnum = pgEnum('audit_action', [
  'create',
  'read',
  'update',
  'delete',
  'login',
  'logout',
  'refresh',
]);
export const tipoAjusteEnum = pgEnum('tipo_ajuste', ['incluso', 'adicional', 'sustitucion']);

// ── Tablas ──
export const roles = pgTable(
  'roles',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    description: text('description'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index('roles_name_idx').on(table.name),
  })
);

export const permissions = pgTable(
  'permissions',
  {
    id: serial('id').primaryKey(),
    action: permissionActionEnum('action').notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    actionIdx: index('permissions_action_idx').on(table.action),
  })
);

export const rolePermissions = pgTable(
  'role_permissions',
  {
    id: serial('id').primaryKey(),
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: integer('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqueRolePermission: unique('role_permissions_unique').on(table.roleId, table.permissionId),
  })
);

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    fullName: varchar('full_name', { length: 100 }).notNull(),
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    usernameIdx: index('users_username_idx').on(table.username),
    emailIdx: index('users_email_idx').on(table.email),
  })
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('refresh_tokens_user_id_idx').on(table.userId),
    tokenHashIdx: index('refresh_tokens_token_hash_idx').on(table.tokenHash),
  })
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: auditActionEnum('action').notNull(),
    entity: varchar('entity', { length: 100 }),
    entityId: varchar('entity_id', { length: 100 }),
    details: text('details'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
    actionIdx: index('audit_logs_action_idx').on(table.action),
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
  })
);

// ── Tablas del catálogo de precios (Fase 4) ──
export const productos = pgTable(
  'productos',
  {
    id: serial('id').primaryKey(),
    nombre: varchar('nombre', { length: 100 }).notNull(),
    descripcion: text('descripcion'),
    ordenPresentacion: integer('orden_presentacion').notNull().default(0),
    estaActivo: boolean('esta_activo').notNull().default(true),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nombreIdx: index('productos_nombre_idx').on(table.nombre),
  })
);

export const modalidades = pgTable(
  'modalidades',
  {
    id: serial('id').primaryKey(),
    productoId: integer('producto_id')
      .notNull()
      .references(() => productos.id, { onDelete: 'cascade' }),
    nombre: varchar('nombre', { length: 100 }).notNull(),
    descripcion: text('descripcion'),
    precioBaseCentavos: integer('precio_base_centavos').notNull(),
    incluyeSopa: boolean('incluye_sopa').notNull().default(false),
    estaActivo: boolean('esta_activo').notNull().default(true),
    disponibleDesde: timestamp('disponible_desde', { withTimezone: true }),
    disponibleHasta: timestamp('disponible_hasta', { withTimezone: true }),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productoIdx: index('modalidades_producto_id_idx').on(table.productoId),
  })
);

export const revisionesTarifa = pgTable(
  'revisiones_tarifa',
  {
    id: serial('id').primaryKey(),
    numeroRevision: integer('numero_revision').notNull(),
    descripcion: text('descripcion'),
    publicada: boolean('publicada').notNull().default(false),
    publicadaPorId: integer('publicada_por_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    publicadaEn: timestamp('publicada_en', { withTimezone: true }),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    versionAnteriorId: integer('version_anterior_id'),
  },
  (table) => ({
    numeroRevisionIdx: index('revisiones_tarifa_numero_revision_idx').on(table.numeroRevision),
    publicadaIdx: index('revisiones_tarifa_publicada_idx').on(table.publicada),
  })
);

export const gruposOpciones = pgTable(
  'grupos_opciones',
  {
    id: serial('id').primaryKey(),
    productoId: integer('producto_id')
      .notNull()
      .references(() => productos.id, { onDelete: 'cascade' }),
    nombre: varchar('nombre', { length: 100 }).notNull(),
    descripcion: text('descripcion'),
    esObligatorio: boolean('es_obligatorio').notNull().default(false),
    cantidadMinima: integer('cantidad_minima').notNull().default(0),
    cantidadMaxima: integer('cantidad_maxima').notNull().default(1),
    permiteVariasElecciones: boolean('permite_varias_elecciones').notNull().default(false),
    estaActivo: boolean('esta_activo').notNull().default(true),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productoIdx: index('grupos_opciones_producto_id_idx').on(table.productoId),
  })
);

export const opciones = pgTable(
  'opciones',
  {
    id: serial('id').primaryKey(),
    grupoId: integer('grupo_id')
      .notNull()
      .references(() => gruposOpciones.id, { onDelete: 'cascade' }),
    nombre: varchar('nombre', { length: 100 }).notNull(),
    descripcion: text('descripcion'),
    estaActivo: boolean('esta_activo').notNull().default(true),
    ordenPresentacion: integer('orden_presentacion').notNull().default(0),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    grupoIdx: index('opciones_grupo_id_idx').on(table.grupoId),
  })
);

export const opcionesIncluidasModalidad = pgTable(
  'opciones_incluidas_modalidad',
  {
    id: serial('id').primaryKey(),
    modalidadId: integer('modalidad_id')
      .notNull()
      .references(() => modalidades.id, { onDelete: 'cascade' }),
    opcionId: integer('opcion_id')
      .notNull()
      .references(() => opciones.id, { onDelete: 'cascade' }),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqueModalidadOpcion: unique('opciones_incluidas_modalidad_unique').on(
      table.modalidadId,
      table.opcionId
    ),
    modalidadIdx: index('opciones_incluidas_modalidad_modalidad_id_idx').on(table.modalidadId),
    opcionIdx: index('opciones_incluidas_modalidad_opcion_id_idx').on(table.opcionId),
  })
);

export const sustituciones = pgTable(
  'sustituciones',
  {
    id: serial('id').primaryKey(),
    modalidadId: integer('modalidad_id')
      .notNull()
      .references(() => modalidades.id, { onDelete: 'cascade' }),
    opcionOriginalId: integer('opcion_original_id')
      .notNull()
      .references(() => opciones.id, { onDelete: 'cascade' }),
    opcionSustitutaId: integer('opcion_sustituta_id')
      .notNull()
      .references(() => opciones.id, { onDelete: 'cascade' }),
    ajustePrecioCentavos: integer('ajuste_precio_centavos').notNull().default(0),
    estaActivo: boolean('esta_activo').notNull().default(true),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    modalidadIdx: index('sustituciones_modalidad_id_idx').on(table.modalidadId),
    opcionOriginalIdx: index('sustituciones_opcion_original_id_idx').on(table.opcionOriginalId),
    opcionSustitutaIdx: index('sustituciones_opcion_sustituta_id_idx').on(table.opcionSustitutaId),
    uniqueSustitucion: unique('sustituciones_unique').on(
      table.modalidadId,
      table.opcionOriginalId,
      table.opcionSustitutaId
    ),
  })
);

export const adicionales = pgTable(
  'adicionales',
  {
    id: serial('id').primaryKey(),
    productoId: integer('producto_id')
      .notNull()
      .references(() => productos.id, { onDelete: 'cascade' }),
    nombre: varchar('nombre', { length: 100 }).notNull(),
    descripcion: text('descripcion'),
    precioCentavos: integer('precio_centavos').notNull(),
    estaActivo: boolean('esta_activo').notNull().default(true),
    cantidadMaxima: integer('cantidad_maxima').notNull().default(1),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productoIdx: index('adicionales_producto_id_idx').on(table.productoId),
  })
);

// ── Relaciones ──
export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  users: many(users),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  refreshTokens: many(refreshTokens),
  auditLogs: many(auditLogs),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const productosRelations = relations(productos, ({ many }) => ({
  modalidades: many(modalidades),
  gruposOpciones: many(gruposOpciones),
  adicionales: many(adicionales),
}));

export const modalidadesRelations = relations(modalidades, ({ one, many }) => ({
  producto: one(productos, {
    fields: [modalidades.productoId],
    references: [productos.id],
  }),
  opcionesIncluidas: many(opcionesIncluidasModalidad),
  sustituciones: many(sustituciones),
}));

export const revisionesTarifaRelations = relations(revisionesTarifa, ({ one }) => ({
  publicadaPor: one(users, {
    fields: [revisionesTarifa.publicadaPorId],
    references: [users.id],
  }),
}));

export const gruposOpcionesRelations = relations(gruposOpciones, ({ one, many }) => ({
  producto: one(productos, {
    fields: [gruposOpciones.productoId],
    references: [productos.id],
  }),
  opciones: many(opciones),
}));

export const opcionesRelations = relations(opciones, ({ one, many }) => ({
  grupo: one(gruposOpciones, {
    fields: [opciones.grupoId],
    references: [gruposOpciones.id],
  }),
  incluidasEnModalidades: many(opcionesIncluidasModalidad),
  comoOriginal: many(sustituciones, {
    relationName: 'sustitucion_opcion_original',
  }),
  comoSustituta: many(sustituciones, {
    relationName: 'sustitucion_opcion_sustituta',
  }),
}));

export const opcionesIncluidasModalidadRelations = relations(
  opcionesIncluidasModalidad,
  ({ one }) => ({
    modalidad: one(modalidades, {
      fields: [opcionesIncluidasModalidad.modalidadId],
      references: [modalidades.id],
    }),
    opcion: one(opciones, {
      fields: [opcionesIncluidasModalidad.opcionId],
      references: [opciones.id],
    }),
  })
);

export const sustitucionesRelations = relations(sustituciones, ({ one }) => ({
  modalidad: one(modalidades, {
    fields: [sustituciones.modalidadId],
    references: [modalidades.id],
  }),
  opcionOriginal: one(opciones, {
    fields: [sustituciones.opcionOriginalId],
    references: [opciones.id],
    relationName: 'sustitucion_opcion_original',
  }),
  opcionSustituta: one(opciones, {
    fields: [sustituciones.opcionSustitutaId],
    references: [opciones.id],
    relationName: 'sustitucion_opcion_sustituta',
  }),
}));

export const adicionalesRelations = relations(adicionales, ({ one }) => ({
  producto: one(productos, {
    fields: [adicionales.productoId],
    references: [productos.id],
  }),
}));
