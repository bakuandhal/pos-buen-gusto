# POS Buen Gusto — Instrucciones para agentes

## Repositorio
Sistema POS para restaurante (almuerzos). Escritorio Windows (Tauri 2), futuro móvil (Capacitor), backend Node.js/Fastify + PostgreSQL (fases futuras).

## Stack actual (raíz del repositorio)
- Frontend: Vue 3.5 + TypeScript + Vite
- Escritorio: Tauri 2 (Rust), plugin `@tauri-apps/plugin-opener`
- `package.json` scripts:
  - `npm run dev` — Vite dev en puerto 1420
  - `npm run build` — `vue-tsc --noEmit && vite build`
  - `npm run preview` — vista previa de build
  - `npm run tauri` — CLI de Tauri
- TypeScript: `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Ausentes todavía: Pinia, Vue Router, GSAP, ESLint, Prettier, pruebas automatizadas

## Rama y Git
- Rama principal de trabajo: `develop`
- `main`: solo releases estables
- Remote: `https://github.com/bakuandhal/pos-buen-gusto.git` (privado)
- `.gitignore`: ignora logs, `node_modules`, `dist`, editores. Faltan por añadir: `src-tauri/target/`, `src-tauri/gen/`, `.env`, builds de Tauri

## Reglas de trabajo
1. No instalar dependencias de fases futuras sin autorización.
2. No sustituir el stack por preferencias personales. Si hay incompatibilidad real, documentar evidencia, alternativas y consecuencias antes de decidir.
3. No guardar secretos ni contraseñas en el repositorio. Usar variables de entorno.
4. No borrar ni reemplazar archivos del scaffold existente sin justificación.
5. Cada cambio debe dejar el proyecto compilable: `npm run build` debe pasar.
6. Documentar decisiones en `docs/ADR/` cuando afecten arquitectura.

## Flujo recomendado
- Trabajar en `develop`.
- Hacer commit con mensajes convencionales (`feat:`, `fix:`, `chore:`, `docs:`).
- Push a `develop`.
- Cuando se liste una funcionalidad estable, mergear a `main` (directo o por PR en GitHub).

## Estructura actual (no tocar en Fase 0)
```
/src              App.vue, main.ts, assets/vue.svg, vite-env.d.ts
/src-tauri        Cargo.toml, tauri.conf.json, src/{lib.rs,main.rs}, capabilities/default.json, build.rs, icons/
vite.config.ts    Puerto fijo 1420, plugin Vue, ignorar src-tauri en watch
tsconfig.json     Strict TS, referencias a tsconfig.node.json
```
