CREATE TABLE "mesas" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero" integer NOT NULL,
	"estado" varchar(20) NOT NULL DEFAULT 'disponible',
	"comensales" integer NOT NULL DEFAULT 0,
	"ultima_actualizacion" timestamp with time zone,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mesas_numero_unique" UNIQUE("numero")
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" serial PRIMARY KEY NOT NULL,
	"mesa_id" integer,
	"tipo_servicio" varchar(20) NOT NULL DEFAULT 'mesa',
	"estado" varchar(20) NOT NULL DEFAULT 'borrador',
	"usuario_id" integer NOT NULL,
	"total_centavos" integer NOT NULL DEFAULT 0,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pedidos_mesa_id_fk" FOREIGN KEY ("mesa_id") REFERENCES "public"."mesas"("id") ON DELETE set null ON UPDATE no action,
	CONSTRAINT "pedidos_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE "platos_individuales" (
	"id" serial PRIMARY KEY NOT NULL,
	"pedido_id" integer NOT NULL,
	"producto_id" integer NOT NULL,
	"modalidad_id" integer NOT NULL,
	"cantidad" integer NOT NULL DEFAULT 1,
	"precio_unitario_centavos" integer NOT NULL,
	"subtotal_centavos" integer NOT NULL,
	"configuracion" jsonb NOT NULL,
	"revision_tarifa_id" integer,
	"estado" varchar(20) NOT NULL DEFAULT 'borrador',
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platos_individuales_pedido_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "platos_individuales_producto_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE restrict ON UPDATE no action,
	CONSTRAINT "platos_individuales_modalidad_id_fk" FOREIGN KEY ("modalidad_id") REFERENCES "public"."modalidades"("id") ON DELETE restrict ON UPDATE no action,
	CONSTRAINT "platos_individuales_revision_tarifa_id_fk" FOREIGN KEY ("revision_tarifa_id") REFERENCES "public"."revisiones_tarifa"("id") ON DELETE restrict ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE "comandas" (
	"id" serial PRIMARY KEY NOT NULL,
	"pedido_id" integer NOT NULL,
	"numero_comanda" integer NOT NULL,
	"estado" varchar(20) NOT NULL DEFAULT 'borrador',
	"usuario_id" integer NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comandas_pedido_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "comandas_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "mesas_numero_idx" ON "mesas" USING btree ("numero");
--> statement-breakpoint
CREATE INDEX "mesas_estado_idx" ON "mesas" USING btree ("estado");
--> statement-breakpoint
CREATE INDEX "pedidos_mesa_id_idx" ON "pedidos" USING btree ("mesa_id");
--> statement-breakpoint
CREATE INDEX "pedidos_estado_idx" ON "pedidos" USING btree ("estado");
--> statement-breakpoint
CREATE INDEX "pedidos_usuario_id_idx" ON "pedidos" USING btree ("usuario_id");
--> statement-breakpoint
CREATE INDEX "platos_individuales_pedido_id_idx" ON "platos_individuales" USING btree ("pedido_id");
--> statement-breakpoint
CREATE INDEX "platos_individuales_producto_id_idx" ON "platos_individuales" USING btree ("producto_id");
--> statement-breakpoint
CREATE INDEX "platos_individuales_modalidad_id_idx" ON "platos_individuales" USING btree ("modalidad_id");
--> statement-breakpoint
CREATE INDEX "platos_individuales_estado_idx" ON "platos_individuales" USING btree ("estado");
--> statement-breakpoint
CREATE INDEX "comandas_pedido_id_idx" ON "comandas" USING btree ("pedido_id");
--> statement-breakpoint
CREATE INDEX "comandas_numero_comanda_idx" ON "comandas" USING btree ("numero_comanda");
--> statement-breakpoint
CREATE INDEX "comandas_estado_idx" ON "comandas" USING btree ("estado");
--> statement-breakpoint
CREATE INDEX "comandas_usuario_id_idx" ON "comandas" USING btree ("usuario_id");
