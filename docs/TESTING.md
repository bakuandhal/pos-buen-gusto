# Pruebas — POS Buen Gusto

## Visión general

Este documento describe la estrategia de pruebas del proyecto, abarcando frontend y backend.

## Frontend (Vitest)

### Configuración
- Entorno: jsdom
- Archivos de prueba: `src/**/*.{test,spec}.{ts,tsx,vue}`
- Comando: `npm run test`

### Pruebas implementadas
- `src/utils/currency.test.ts` — Formateo y parseo de moneda (9 pruebas)
- `src/components/WelcomeMessage.test.ts` — Componente de bienvenida (2 pruebas)

## Backend (Vitest)

### Configuración
- Archivos de prueba: `server/src/**/*.{test,spec}.ts`
- Setup de variables de entorno: `server/vitest.setup.ts`
- Comando: `npm run test:server` (desde raíz) o `npm run test` (desde `server/`)

### Pruebas implementadas

| Archivo | Pruebas | Estado |
|---------|---------|--------|
| `server/src/health.test.ts` | `GET /health` responde 200 | ✅ |
| `server/src/tests/auth.test.ts` | Configuración de entorno, hash de contraseñas, `/health`, `/login` (sin DB), `/me` (sin token) | ✅ |
| `server/src/tests/utils.test.ts` | `generateRefreshToken`, `hashToken` | ✅ |

### Pruebas pendientes (requieren PostgreSQL real)

Las siguientes pruebas requieren una base de datos PostgreSQL disponible y no se ejecutan automáticamente en entornos sin DB:

- Pruebas de integración de autenticación con base de datos real.
- Pruebas de login correcto / contraseña incorrecta / usuario inexistente.
- Pruebas de rutas protegidas con y sin autenticación.
- Pruebas de refresh y revocación de sesiones.
- Pruebas de prevención de duplicados en bootstrap administrativo.

Para ejecutar pruebas de integración, configurar `TEST_DATABASE_URL` y ejecutar las pruebas correspondientes.

## Calidad de código

| Herramienta | Comando | Propósito |
|-------------|---------|-----------|
| ESLint | `npm run lint` / `npm run lint:server` | Análisis estático de código |
| Prettier | `npm run format` / `npm run format:write` | Formato de código |
| TypeScript | `npm run typecheck` / `npm run typecheck:server` | Comprobación de tipos estrictos |

### Reglas importantes
- No añadir pruebas que solo afirmen `true === true`. Cada prueba debe comprobar un comportamiento real.
- No usar `--force` ni `--legacy-peer-deps` para ocultar conflictos de dependencias.
- Las pruebas que requieren base de datos real deben identificarse explícitamente como pendientes si no hay DB disponible.

## Comando de verificación completa

```powershell
# Frontend + Backend + Builds
npm run check:all
```

Este comando ejecuta:
1. `npm run check` — Tipos, lint, formato y pruebas (frontend + backend).
2. `npm run build` — Compilación del frontend.
3. `npm run build:server` — Compilación del backend.
4. `npm run db:generate` — Generación de migraciones (sin necesidad de DB real).
