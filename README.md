# POS Buen Gusto

Sistema punto de venta para restaurante (almuerzos). Escritorio Windows (Tauri 2), futuro móvil (Capacitor), backend Node.js/Fastify + PostgreSQL (fases futuras).

## Estado actual

**Fase 1 completa** — Fundación técnica estable. Véase `docs/` para la documentación de arquitectura, requisitos y reglas del negocio.

## Stack actual

- Frontend: Vue 3.5 + TypeScript + Vite
- Escritorio: Tauri 2 (Rust)
- Backend: Node.js + TypeScript + Fastify (mínimo)
- Pruebas: Vitest
- Calidad: ESLint, Prettier, EditorConfig

## Requisitos del equipo

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| Node.js | v22+ | v24.22.0 probado |
| npm | v10+ | v11.17.0 probado |
| Rust + Cargo | 1.80+ | Solo para compilar Tauri (no instalado en este entorno) |
| Tauri CLI | v2+ | v2.12.3 probado |

Véase `docs/DEVELOPMENT_SETUP.md` para detalles.

## Instalación

```powershell
# Clonar el repositorio
git clone https://github.com/bakuandhal/pos-buen-gusto.git
cd pos-buen-gusto

# Copiar variables de entorno (ejemplo)
copy .env.example .env

# Instalar dependencias del cliente (raíz)
npm install

# Instalar dependencias del servidor
cd server
npm install
cd ..
```

## Scripts de desarrollo

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar Vite (puerto 1420) |
| `npm run dev:server` | Iniciar backend Fastify (puerto 3000) |
| `npm run tauri` | Ejecutar aplicación de escritorio Tauri |
| `npm run build` | Compilar cliente Vue |
| `npm run build:server` | Compilar backend TypeScript |
| `npm run typecheck` | Comprobar tipos TypeScript (incluye .vue) |
| `npm run typecheck:server` | Comprobar tipos del servidor |
| `npm run lint` | Ejecutar ESLint |
| `npm run lint:server` | Ejecutar ESLint en el servidor |
| `npm run format` | Comprobar formato Prettier |
| `npm run format:write` | Aplicar formato Prettier |
| `npm run test` | Ejecutar pruebas Vitest (cliente) |
| `npm run test:server` | Ejecutar pruebas Vitest (servidor) |
| `npm run check` | Verificaciones generales (tipo + lint + formato + pruebas) |
| `npm run check:all` | Todas las verificaciones + builds |

## Estructura del repositorio

Véase `docs/REPOSITORY_STRUCTURE.md`.

## Rama y Git

- Rama principal de trabajo: `develop`
- `main`: solo releases estables
- Remote: `https://github.com/bakuandhal/pos-buen-gusto.git` (privado)

Véase `AGENTS.md` para instrucciones completas.

## Verificaciones obligatorias de Fase 1

1. `npm install` (desde raíz) ✅
2. `npm run build` (frontend) ✅
3. `npm run typecheck` ✅
4. `npm run lint` ✅
5. `npm run format` ✅
6. `npm run test` ✅
7. `npm run test:server` ✅
8. `npm run build:server` ✅
9. Compilación de Tauri para Windows — pendiente (Rust no instalado en este entorno)

## Licencia

Privado — repositorio interno.
