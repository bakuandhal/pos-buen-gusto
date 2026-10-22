CREATE TYPE "public"."audit_action" AS ENUM('create', 'read', 'update', 'delete', 'login', 'logout', 'refresh');--> statement-breakpoint
CREATE TYPE "public"."permission_action" AS ENUM('abrir_mesa', 'agregar_pedido', 'modificar_pedido', 'cancelar_plato', 'enviar_comanda', 'configurar_precios', 'registrar_cobro', 'cerrar_cuenta', 'gestionar_usuarios');--> statement-breakpoint
CREATE TYPE "public"."tipo_ajuste" AS ENUM('incluso', 'adicional', 'sustitucion');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('administrador', 'mesero', 'caja');--> statement-breakpoint
CREATE TABLE "adicionales" (
	"id" serial PRIMARY KEY NOT NULL,
	"producto_id" integer NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"descripcion" text,
	"precio_centavos" integer NOT NULL,
	"esta_activo" boolean DEFAULT true NOT NULL,
	"cantidad_maxima" integer DEFAULT 1 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" "audit_action" NOT NULL,
	"entity" varchar(100),
	"entity_id" varchar(100),
	"details" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comandas" (
	"id" serial PRIMARY KEY NOT NULL,
	"pedido_id" integer NOT NULL,
	"numero_comanda" integer NOT NULL,
	"estado" varchar(20) DEFAULT 'borrador' NOT NULL,
	"usuario_id" integer NOT NULL,
	"platos_snapshot" jsonb,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comandas_pedido_id_numero_comanda_unique" UNIQUE("pedido_id","numero_comanda")
);
--> statement-breakpoint
CREATE TABLE "grupos_opciones" (
	"id" serial PRIMARY KEY NOT NULL,
	"producto_id" integer NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"descripcion" text,
	"es_obligatorio" boolean DEFAULT false NOT NULL,
	"cantidad_minima" integer DEFAULT 0 NOT NULL,
	"cantidad_maxima" integer DEFAULT 1 NOT NULL,
	"permite_varias_elecciones" boolean DEFAULT false NOT NULL,
	"esta_activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mesas" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero" integer NOT NULL,
	"estado" varchar(20) DEFAULT 'disponible' NOT NULL,
	"comensales" integer DEFAULT 0 NOT NULL,
	"ultima_actualizacion" timestamp with time zone,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mesas_numero_unique" UNIQUE("numero")
);
--> statement-breakpoint
CREATE TABLE "modalidades" (
	"id" serial PRIMARY KEY NOT NULL,
	"producto_id" integer NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"descripcion" text,
	"precio_base_centavos" integer NOT NULL,
	"incluye_sopa" boolean DEFAULT false NOT NULL,
	"esta_activo" boolean DEFAULT true NOT NULL,
	"disponible_desde" timestamp with time zone,
	"disponible_hasta" timestamp with time zone,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opciones" (
	"id" serial PRIMARY KEY NOT NULL,
	"grupo_id" integer NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"descripcion" text,
	"esta_activo" boolean DEFAULT true NOT NULL,
	"orden_presentacion" integer DEFAULT 0 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opciones_incluidas_modalidad" (
	"id" serial PRIMARY KEY NOT NULL,
	"modalidad_id" integer NOT NULL,
	"opcion_id" integer NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opciones_incluidas_modalidad_unique" UNIQUE("modalidad_id","opcion_id")
);
--> statement-breakpoint
CREATE TABLE "operaciones_idempotentes" (
	"id" serial PRIMARY KEY NOT NULL,
	"clave" varchar(200) NOT NULL,
	"operacion" varchar(100) NOT NULL,
	"resultado" jsonb,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "operaciones_idempotentes_clave_operacion_unique" UNIQUE("clave","operacion")
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" serial PRIMARY KEY NOT NULL,
	"mesa_id" integer,
	"tipo_servicio" varchar(20) DEFAULT 'mesa' NOT NULL,
	"estado" varchar(20) DEFAULT 'borrador' NOT NULL,
	"usuario_id" integer NOT NULL,
	"total_centavos" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" "permission_action" NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_action_unique" UNIQUE("action")
);
--> statement-breakpoint
CREATE TABLE "platos_individuales" (
	"id" serial PRIMARY KEY NOT NULL,
	"pedido_id" integer NOT NULL,
	"producto_id" integer NOT NULL,
	"modalidad_id" integer NOT NULL,
	"cantidad" integer DEFAULT 1 NOT NULL,
	"precio_unitario_centavos" integer NOT NULL,
	"subtotal_centavos" integer NOT NULL,
	"configuracion" jsonb NOT NULL,
	"revision_tarifa_id" integer,
	"estado" varchar(20) DEFAULT 'borrador' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"descripcion" text,
	"orden_presentacion" integer DEFAULT 0 NOT NULL,
	"esta_activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "revisiones_tarifa" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero_revision" integer NOT NULL,
	"descripcion" text,
	"publicada" boolean DEFAULT false NOT NULL,
	"publicada_por_id" integer,
	"publicada_en" timestamp with time zone,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"version_anterior_id" integer
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_unique" UNIQUE("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sustituciones" (
	"id" serial PRIMARY KEY NOT NULL,
	"modalidad_id" integer NOT NULL,
	"opcion_original_id" integer NOT NULL,
	"opcion_sustituta_id" integer NOT NULL,
	"ajuste_precio_centavos" integer DEFAULT 0 NOT NULL,
	"esta_activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sustituciones_unique" UNIQUE("modalidad_id","opcion_original_id","opcion_sustituta_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"role_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "adicionales" ADD CONSTRAINT "adicionales_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grupos_opciones" ADD CONSTRAINT "grupos_opciones_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modalidades" ADD CONSTRAINT "modalidades_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opciones" ADD CONSTRAINT "opciones_grupo_id_grupos_opciones_id_fk" FOREIGN KEY ("grupo_id") REFERENCES "public"."grupos_opciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opciones_incluidas_modalidad" ADD CONSTRAINT "opciones_incluidas_modalidad_modalidad_id_modalidades_id_fk" FOREIGN KEY ("modalidad_id") REFERENCES "public"."modalidades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opciones_incluidas_modalidad" ADD CONSTRAINT "opciones_incluidas_modalidad_opcion_id_opciones_id_fk" FOREIGN KEY ("opcion_id") REFERENCES "public"."opciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_mesa_id_mesas_id_fk" FOREIGN KEY ("mesa_id") REFERENCES "public"."mesas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platos_individuales" ADD CONSTRAINT "platos_individuales_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platos_individuales" ADD CONSTRAINT "platos_individuales_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platos_individuales" ADD CONSTRAINT "platos_individuales_modalidad_id_modalidades_id_fk" FOREIGN KEY ("modalidad_id") REFERENCES "public"."modalidades"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platos_individuales" ADD CONSTRAINT "platos_individuales_revision_tarifa_id_revisiones_tarifa_id_fk" FOREIGN KEY ("revision_tarifa_id") REFERENCES "public"."revisiones_tarifa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisiones_tarifa" ADD CONSTRAINT "revisiones_tarifa_publicada_por_id_users_id_fk" FOREIGN KEY ("publicada_por_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sustituciones" ADD CONSTRAINT "sustituciones_modalidad_id_modalidades_id_fk" FOREIGN KEY ("modalidad_id") REFERENCES "public"."modalidades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sustituciones" ADD CONSTRAINT "sustituciones_opcion_original_id_opciones_id_fk" FOREIGN KEY ("opcion_original_id") REFERENCES "public"."opciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sustituciones" ADD CONSTRAINT "sustituciones_opcion_sustituta_id_opciones_id_fk" FOREIGN KEY ("opcion_sustituta_id") REFERENCES "public"."opciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "adicionales_producto_id_idx" ON "adicionales" USING btree ("producto_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "comandas_pedido_id_idx" ON "comandas" USING btree ("pedido_id");--> statement-breakpoint
CREATE INDEX "comandas_numero_comanda_idx" ON "comandas" USING btree ("numero_comanda");--> statement-breakpoint
CREATE INDEX "comandas_estado_idx" ON "comandas" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "comandas_usuario_id_idx" ON "comandas" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "grupos_opciones_producto_id_idx" ON "grupos_opciones" USING btree ("producto_id");--> statement-breakpoint
CREATE INDEX "mesas_numero_idx" ON "mesas" USING btree ("numero");--> statement-breakpoint
CREATE INDEX "mesas_estado_idx" ON "mesas" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "modalidades_producto_id_idx" ON "modalidades" USING btree ("producto_id");--> statement-breakpoint
CREATE INDEX "opciones_grupo_id_idx" ON "opciones" USING btree ("grupo_id");--> statement-breakpoint
CREATE INDEX "opciones_incluidas_modalidad_modalidad_id_idx" ON "opciones_incluidas_modalidad" USING btree ("modalidad_id");--> statement-breakpoint
CREATE INDEX "opciones_incluidas_modalidad_opcion_id_idx" ON "opciones_incluidas_modalidad" USING btree ("opcion_id");--> statement-breakpoint
CREATE INDEX "operaciones_idempotentes_clave_idx" ON "operaciones_idempotentes" USING btree ("clave");--> statement-breakpoint
CREATE INDEX "pedidos_mesa_id_idx" ON "pedidos" USING btree ("mesa_id");--> statement-breakpoint
CREATE INDEX "pedidos_estado_idx" ON "pedidos" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "pedidos_usuario_id_idx" ON "pedidos" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "permissions_action_idx" ON "permissions" USING btree ("action");--> statement-breakpoint
CREATE INDEX "platos_individuales_pedido_id_idx" ON "platos_individuales" USING btree ("pedido_id");--> statement-breakpoint
CREATE INDEX "platos_individuales_producto_id_idx" ON "platos_individuales" USING btree ("producto_id");--> statement-breakpoint
CREATE INDEX "platos_individuales_modalidad_id_idx" ON "platos_individuales" USING btree ("modalidad_id");--> statement-breakpoint
CREATE INDEX "platos_individuales_estado_idx" ON "platos_individuales" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "productos_nombre_idx" ON "productos" USING btree ("nombre");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "revisiones_tarifa_numero_revision_idx" ON "revisiones_tarifa" USING btree ("numero_revision");--> statement-breakpoint
CREATE INDEX "revisiones_tarifa_publicada_idx" ON "revisiones_tarifa" USING btree ("publicada");--> statement-breakpoint
CREATE INDEX "roles_name_idx" ON "roles" USING btree ("name");--> statement-breakpoint
CREATE INDEX "sustituciones_modalidad_id_idx" ON "sustituciones" USING btree ("modalidad_id");--> statement-breakpoint
CREATE INDEX "sustituciones_opcion_original_id_idx" ON "sustituciones" USING btree ("opcion_original_id");--> statement-breakpoint
CREATE INDEX "sustituciones_opcion_sustituta_id_idx" ON "sustituciones" USING btree ("opcion_sustituta_id");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");