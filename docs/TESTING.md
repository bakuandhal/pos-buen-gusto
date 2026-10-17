# Pruebas, comprobación de tipos, lint y formato — POS Buen Gusto

## Estrategia de calidad

El proyecto utiliza un enfoque por capas:

1. **Comprobación de tipos** (TypeScript estricto + vue-tsc)
2. **Lint** (ESLint con reglas para TypeScript y Vue)
3. **Formato** (Prettier)
4. **Pruebas unitarias** (Vitest)
5. **Compilación** (Vite para frontend, tsc para backend, Tauri para escritorio)

## Frontend (Vue + Vite)

### Comprobación de tipos
```powershell
npm run typecheck
```
Incluye archivos `.vue`, `.ts`, `.tsx` a través de `vue-tsc --noEmit`.

### ESLint
```powershell
npm run lint
```
Revisa `src/**/*.{ts,vue}` con reglas de TypeScript, Vue y Prettier (desactivado para evitar conflictos).

### Prettier
```powershell
# Comprobar formato
npm run format
# Aplicar formato
npm run format:write
```

### Pruebas (Vitest)
```powershell
npm run test
```
Incluye pruebas de utilidades (`src/utils/currency.test.ts`) y componentes Vue (`src/components/WelcomeMessage.test.vue`).

## Backend (Fastify + TypeScript)

Desde la carpeta `server/`:
```powershell
cd server
npm run test        # Vitest: endpoint GET /health
npm run build       # tsc: compila TypeScript
npm run lint        # ESLint
npm run format      # Prettier
```

Desde la raíz:
```powershell
npm run test:server
npm run build:server
npm run lint:server
```

## Conjunto general de verificaciones

Desde la raíz:
```powershell
# Ejecutar todas las verificaciones de frontend
npm run check

# Ejecutar todas las verificaciones (frontend + backend + build)
npm run check:all
```

## Reglas importantes

- No añadir pruebas que solo afirmen `true === true`. Cada prueba debe comprobar un comportamiento real.
- No usar `--force` ni `--legacy-peer-deps` para ocultar conflictos de dependencias.
- No actualizar dependencias indiscriminadamente.
- Los secretos nunca se guardan en el repositorio (ver `.env.example`).
