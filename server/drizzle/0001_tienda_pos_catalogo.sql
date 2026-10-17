CREATE TYPE "public"."tipo_ajuste" AS ENUM('incluso', 'adicional', 'sustitucion');--> statement-breakpoint
CREATE TABLE "productos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"descripcion" text,
	"orden_presentacion" integer DEFAULT 0 NOT NULL,
	"esta_activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "productos_nombre_unique" UNIQUE("nombre")
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
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "modalidades_producto_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action
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
	"version_anterior_id" integer,
	CONSTRAINT "revisiones_tarifa_publicada_por_id_fk" FOREIGN KEY ("publicada_por_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action,
	CONSTRAINT "revisiones_tarifa_version_anterior_id_fk" FOREIGN KEY ("version_anterior_id") REFERENCES "public"."revisiones_tarifa"("id") ON DELETE set null ON UPDATE no action
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
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "grupos_opciones_producto_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action
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
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opciones_grupo_id_fk" FOREIGN KEY ("grupo_id") REFERENCES "public"."grupos_opciones"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE "opciones_incluidas_modalidad" (
	"id" serial PRIMARY KEY NOT NULL,
	"modalidad_id" integer NOT NULL,
	"opcion_id" integer NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opciones_incluidas_modalidad_modalidad_id_fk" FOREIGN KEY ("modalidad_id") REFERENCES "public"."modalidades"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "opciones_incluidas_modalidad_opcion_id_fk" FOREIGN KEY ("opcion_id") REFERENCES "public"."opciones"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "opciones_incluidas_modalidad_unique" UNIQUE("modalidad_id","opcion_id")
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
	CONSTRAINT "sustituciones_modalidad_id_fk" FOREIGN KEY ("modalidad_id") REFERENCES "public"."modalidades"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "sustituciones_opcion_original_id_fk" FOREIGN KEY ("opcion_original_id") REFERENCES "public"."opciones"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "sustituciones_opcion_sustituta_id_fk" FOREIGN KEY ("opcion_sustituta_id") REFERENCES "public"."opciones"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "sustituciones_unique" UNIQUE("modalidad_id","opcion_original_id","opcion_sustituta_id")
);
--> statement-breakpoint
CREATE TABLE "adicionales" (
	"id" serial PRIMARY KEY NOT NULL,
	"producto_id" integer NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"descripcion" text,
	"precio_centavos" integer NOT NULL,
	"esta_activo" boolean DEFAULT true NOT NULL,
	"cantidad_maxima" integer DEFAULT 1 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "adicionales_producto_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "productos_nombre_idx" ON "productos" USING btree ("nombre");
--> statement-breakpoint
CREATE INDEX "modalidades_producto_id_idx" ON "modalidades" USING btree ("producto_id");
--> statement-breakpoint
CREATE INDEX "revisiones_tarifa_numero_revision_idx" ON "revisiones_tarifa" USING btree ("numero_revision");
--> statement-breakpoint
CREATE INDEX "revisiones_tarifa_publicada_idx" ON "revisiones_tarifa" USING btree ("publicada");
--> statement-breakpoint
CREATE INDEX "grupos_opciones_producto_id_idx" ON "grupos_opciones" USING btree ("producto_id");
--> statement-breakpoint
CREATE INDEX "opciones_grupo_id_idx" ON "opciones" USING btree ("grupo_id");
--> statement-breakpoint
CREATE INDEX "opciones_incluidas_modalidad_modalidad_id_idx" ON "opciones_incluidas_modalidad" USING btree ("modalidad_id");
--> statement-breakpoint
CREATE INDEX "opciones_incluidas_modalidad_opcion_id_idx" ON "opciones_incluidas_modalidad" USING btree ("opcion_id");
--> statement-breakpoint
CREATE INDEX "sustituciones_modalidad_id_idx" ON "sustituciones" USING btree ("modalidad_id");
--> statement-breakpoint
CREATE INDEX "sustituciones_opcion_original_id_idx" ON "sustituciones" USING btree ("opcion_original_id");
--> statement-breakpoint
CREATE INDEX "sustituciones_opcion_sustituta_id_idx" ON "sustituciones" USING btree ("opcion_sustituta_id");
--> statement-breakpoint
CREATE INDEX "adicionales_producto_id_idx" ON "adicionales" USING btree ("producto_id");
