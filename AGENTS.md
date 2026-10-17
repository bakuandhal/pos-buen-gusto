# POS Buen Gusto — Instrucciones para agentes

## Repositorio
Sistema POS para restaurante (almuerzos). Escritorio Windows (Tauri 2), futuro móvil (Capacitor), backend Node.js/Fastify + PostgreSQL (fases futuras).

**Fase actual: 5 completada** — Backend, PostgreSQL, Drizzle ORM, autenticación, autorización, motor de precios, catálogo configurable, mesas, pedidos, platos individuales y comandas.

## Stack actual (raíz del repositorio)
- Frontend: Vue 3.5 + TypeScript + Vite
- Escritorio: Tauri 2 (Rust), plugin `@tauri-apps/plugin-opener`
- Backend: Node.js + TypeScript + Fastify 5 (`server/`)
- Base de datos: PostgreSQL + Drizzle ORM + Drizzle Kit (migraciones versionadas)
- Navegación: Vue Router
- Estado: Pinia
- Animaciones: GSAP + GSAP Flip
- Pruebas: Vitest (cliente y servidor)
- Calidad: ESLint, Prettier, EditorConfig

## Rama y Git
- Rama principal de trabajo: `develop`
- `main`: solo releases estables
- Remote: `https://github.com/bakuandhal/pos-buen-gusto.git` (privado)
- `.gitignore`: ignora logs, `node_modules`, `dist`, `.env`, `server/dist`, `src-tauri/target/`, `src-tauri/gen/`

## Scripts principales (raíz)
- `npm run dev` — Vite dev en puerto 1420
- `npm run dev:server` — Backend Fastify en puerto 3000
- `npm run build` — `vue-tsc --noEmit && vite build`
- `npm run build:server` — Compilar backend TypeScript
- `npm run preview` — Vista previa de build
- `npm run tauri` — CLI de Tauri
- `npm run typecheck` — Comprobar tipos TS (incluye .vue)
- `npm run typecheck:server` — Comprobar tipos del servidor
- `npm run lint` — Ejecutar ESLint (frontend)
- `npm run lint:server` — Ejecutar ESLint (servidor)
- `npm run format` — Comprobar formato Prettier
- `npm run format:write` — Aplicar formato Prettier
- `npm run test` — Ejecutar pruebas Vitest (cliente)
- `npm run test:server` — Ejecutar pruebas Vitest (servidor)
- `npm run db:generate` — Generar migraciones Drizzle
- `npm run db:migrate` — Aplicar migraciones Drizzle
- `npm run bootstrap:admin` — Crear primer administrador
- `npm run check` — Verificaciones generales (tipo + lint + formato + pruebas, frontend + backend)
- `npm run check:all` — Todas las verificaciones + builds + generación de migraciones

## Scripts del servidor (`server/package.json`)
- `npm run dev` (desde server/) — tsx watch
- `npm run build` (desde server/) — tsc
- `npm run start` (desde server/) — node dist/index.js
- `npm run test` (desde server/) — vitest run
- `npm run db:generate` (desde server/) — drizzle-kit generate
- `npm run db:migrate` (desde server/) — drizzle-kit migrate
- `npm run bootstrap:admin` (desde server/) — tsx scripts/bootstrap-admin.ts

## TypeScript
- `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `vue-tsc` para comprobación de tipos incluyendo componentes `.vue`
- Path alias `@/` apunta a `./src/*`

## Estructura actual
```
/src              App.vue, main.ts, components/, composables/, layouts/, router/, stores/, styles/, types/, utils/, views/, vite-env.d.ts
/server           Backend Fastify (app.ts, index.ts, config/, db/, modules/, shared/, tests/, utils/, drizzle/, scripts/)
/src-tauri        Cargo.toml, tauri.conf.json, src/{lib.rs,main.rs}, capabilities/default.json, build.rs, icons/
vite.config.ts    Puerto fijo 1420, plugin Vue, ignorar src-tauri en watch
vitest.config.ts  Entorno jsdom, pruebas en src/**/*.{test,spec}.{ts,tsx,vue}
server/vitest.config.ts  Pruebas del servidor
tsconfig.json     Strict TS, path alias @/, referencias a tsconfig.node.json
eslint.config.js  Flat config ESLint (TS + Vue + Prettier + globals)
.prettierrc       Configuración Prettier
.editorconfig     Configuración EditorConfig
.env.example      Variables de entorno (no commitear valores reales)
```

## Reglas de trabajo
1. No instalar dependencias de fases futuras sin autorización.
2. No sustituir el stack por preferencias personales. Si hay incompatibilidad real, documentar evidencia, alternativas y consecuencias antes de decidir.
3. No guardar secretos ni contraseñas en el repositorio. Usar variables de entorno (ver `.env.example`).
4. No borrar ni reemplazar archivos del scaffold existente sin justificación.
5. Cada cambio debe dejar el proyecto compilable: `npm run build` debe pasar.
6. Documentar decisiones en `docs/ADR/` cuando afecten arquitectura.
7. No usar `--force` ni `--legacy-peer-deps` para ocultar conflictos de dependencias.
8. No actualizar dependencias indiscriminadamente.

## Flujo recomendado
- Trabajar en `develop`.
- Hacer commit con mensajes convencionales (`feat:`, `fix:`, `chore:`, `docs:`).
- Push a `develop`.
- Cuando se liste una funcionalidad estable, mergear a `main` (directo o por PR en GitHub).

## Fases posteriores (no iniciar sin autorización)
- Fase 4: Motor de precios, modalidades y tarifas
- Fase 5: Mesas, platos, pedidos
- Fase 6: Cocina, impresión DIG-E200I
- Fase 7: Caja, pagos, cierre de cuentas
- Fase 8: Tiempo real, empaquetado, despliegue
- Fase 9: Pruebas integrales, seguridad, despliegue piloto

## Documentación de Fase 2
- `docs/DESIGN_SYSTEM.md` — Tokens de diseño, tipografía, colores, espaciado
- `docs/ANIMATION_GUIDELINES.md` — Reglas de movimiento, GSAP Flip, ciclo de vida de modales
- `docs/UI_COMPONENTS.md` — Componentes implementados, propiedades y responsabilidades
- `docs/PHASE_2_REPORT.md` — Alcance ejecutado, verificaciones, limitaciones y pendientes

## Documentación de Fase 3
- `docs/DATABASE_SETUP.md` — Configuración de PostgreSQL, Drizzle ORM, migraciones
- `docs/API.md` — Endpoints de la API (diagnóstico y autenticación)
- `docs/AUTHENTICATION.md` — Estrategia de autenticación, JWT, Argon2id, roles y permisos
- `docs/SECURITY.md` — Roles, permisos y controles de seguridad (actualizado)
- `docs/TESTING.md` — Pruebas, comprobaciones de tipos, lint y formato (actualizado)
- `docs/PHASE_3_REPORT.md` — Alcance ejecutado, verificaciones, limitaciones y pendientes
