# ADR-001: Stack tecnológico

## Estado
Aceptado

## Contexto
El proyecto requiere un sistema POS para restaurante con aplicación de escritorio Windows y futuro móvil. El scaffold generado por Tauri ya usa Vue 3 + TypeScript + Vite + Tauri 2.

## Decisión
Mantener el stack del scaffold existente:
- Frontend: Vue 3.5 + TypeScript + Vite
- Escritorio: Tauri 2 (Rust), plugin `@tauri-apps/plugin-opener`
- Backend (fase futura): Node.js, TypeScript, Fastify
- Persistencia (fase futura): PostgreSQL, Drizzle ORM
- Móvil (fase futura): Capacitor

No se sustituye el stack por preferencias personales. Si surge una incompatibilidad real, se documentará evidencia, alternativas y consecuencias antes de decidir.

## Consecuencias
- Positivo: scaffold ya funcional, build válido, Tauri 2 para Windows listo.
- Negativo: faltan ESLint, Prettier, Pinia, Vue Router, GSAP, pruebas (se añaden en Fase 1 solo si se justifican).

## Fecha
2026-10-16
