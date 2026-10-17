# Plan de implementación por fases — POS Buen Gusto

## Fase 0 (actual) — Análisis, reglas del negocio, decisiones y documentación

**Objetivo**: Documentar alcance, reglas del negocio, arquitectura, modelo de datos, motor de precios, seguridad, fases futuras y preguntas abiertas.

**Alcance**: Crear AGENTS.md y docs/*. No tocar código del scaffold. No instalar dependencias de fases futuras.

**Dependencias**: Ninguna.

**Archivos afectados**:
- AGENTS.md
- docs/PROJECT_OVERVIEW.md
- docs/REQUIREMENTS.md
- docs/BUSINESS_RULES.md
- docs/ARCHITECTURE.md
- docs/DATA_MODEL.md
- docs/PRICING_ENGINE.md
- docs/SECURITY.md
- docs/IMPLEMENTATION_PHASES.md
- docs/OPEN_QUESTIONS.md
- docs/ADR/*.md

**Pruebas**: Revisión de coherencia de la documentación.

**Criterios de aceptación**:
- Documentación corresponde al proyecto existente.
- Requisitos coherentes entre sí.
- Distinción clara: hechos confirmados / recomendaciones / decisiones pendientes.
- Modalidades y cálculo de precios documentados sin inventar reglas comerciales.
- Definido cómo conservar precios históricos y evitar duplicados.
- Riesgos de impresión y conectividad identificados.
- Cada fase posterior tiene objetivos y criterios verificables.
- Scaffold original intacto.
- No se ha implementado funcionalidad posterior.

**Riesgos**: Ninguno (solo documentación).

**Condición de bloqueo**: Ninguna.

---

## Fase 1 — Estructura final del repositorio, tooling, configuración base y validación de la compilación

**Objetivo**: Dejar el repositorio listo para desarrollo con tooling completo y build funcional.

**Alcance**:
- Migrar a estructura monorepo candidate (`apps/client`, `apps/api`, `apps/desktop`, `apps/mobile`, `packages/contracts`, `docs`, `AGENTS.md`) solo si se justifica; de lo contrario conservar estructura actual.
- Añadir ESLint, Prettier.
- Añadir Pinia y Vue Router si la arquitectura lo justifica.
- Añadir GSAP y GSAP Flip.
- Configurar pruebas unitarias (Vitest) y de componente.
- Actualizar `.gitignore` con `src-tauri/target/`, `src-tauri/gen/`, `.env`, builds de Tauri.
- Validar `npm run build` y `npm run dev`.

**Dependencias**: Fase 0 completada.

**Archivos afectados**: package.json, .gitignore, vite.config.ts, tsconfig.json, estructura de carpetas.

**Pruebas**: `npm run build` pasa; `npm run dev` inicia sin errores.

**Criterios de aceptación**:
- Tooling instalado y configurado.
- Build funcional.
- Documentación de Fase 1 actualizada.
- No se rompe el scaffold existente.

**Riesgos**: Migración a monorepo puede romper rutas del scaffold Tauri.

**Condición de bloqueo**: `npm run build` no pasa.

---

## Fase 2 — Sistema visual, prototipo interactivo, componentes y animaciones GSAP

**Objetivo**: Definir sistema de diseño y prototipar pantallas clave con animaciones.

**Alcance**:
- Sistema de diseño (colores, tipografía, espaciado, tarjetas).
- Pantallas: mesa, pedido, plato, cocina, caja, login.
- Animaciones GSAP/GSAP Flip (expansión de tarjeta de mesa en modal con continuidad espacial).
- Estados: carga, error, éxito, vacío.
- Accesibilidad y reducción de movimiento.

**Dependencias**: Fase 1.

**Archivos afectados**: apps/client/src (o src/ si no hay monorepo).

**Pruebas**: Pruebas de componente visual; revisión manual de animaciones.

**Criterios de aceptación**:
- Interfaz moderna y rápida.
- Animaciones sin cortes al abrir/cerrar modales.
- Estados de carga/error/vacío implementados.

**Riesgos**: GSAP puede complicar DOM, scroll, responsive, interrupciones de animación.

**Condición de bloqueo**: Animaciones bloquean interacción del usuario.

---

## Fase 3 — API, base de datos, migraciones, autenticación y permisos

**Objetivo**: Backend funcional con Fastify, PostgreSQL, Drizzle ORM, autenticación y autorización.

**Alcance**:
- API REST con Fastify.
- Esquema PostgreSQL con Drizzle ORM y migraciones versionadas.
- Autenticación de usuarios.
- Autorización por roles y permisos.
- Validación de entradas.
- Socket.IO para tiempo real (definir integración).

**Dependencias**: Fase 2 (sistema visual), Fase 0 (modelo de datos).

**Archivos afectados**: apps/api/ (o nuevo paquete backend).

**Pruebas**: Pruebas unitarias y de integración de API.

**Criterios de aceptación**:
- API responde correctamente.
- Autenticación y autorización funcionan.
- Migraciones versionadas aplicables.

**Riesgos**: Exposición accidental de credenciales; cambios de esquema sin migración.

**Condición de bloqueo**: No hay conexión a PostgreSQL o fallan pruebas de integración.

---

## Fase 4 — Administración de modalidades y tarifas; motor de precios

**Objetivo**: Interfaz de administración para tarifas y motor de precios validado en servidor.

**Alcance**:
- Pantalla de administración de modalidades y tarifas.
- Motor de precios en servidor (única autoridad).
- Precios históricos con desglose y referencia a tarifa.
- Validación de importes en servidor.

**Dependencias**: Fase 3.

**Archivos afectados**: apps/client, apps/api.

**Pruebas**: Pruebas de cálculo de precios; pruebas de integración.

**Criterios de aceptación**:
- Administrador configura modalidades y tarifas sin código.
- Servidor valida y confirma precios.
- Precios históricos inmutables.

**Riesgos**: Doble cobro por misma opción; errores de punto flotante.

**Condición de bloqueo**: Motor de precios no validado en servidor.

---

## Fase 5 — Mesas, platos individuales, pedidos y aplicación del mesero

**Objetivo**: Flujo completo de mesero: mesas, platos, pedidos, comandas.

**Alcance**:
- Gestión de mesas.
- Registro de platos individuales con configuración.
- Pedidos para llevar sin mesa obligatoria.
- Estados de pedido (borrador, confirmado, enviado a cocina, etc.).
- Envío de comandas a cocina sin duplicados.

**Dependencias**: Fase 4.

**Archivos afectados**: apps/client, apps/api.

**Pruebas**: Pruebas de flujo de mesa a cocina.

**Criterios de aceptación**:
- Mesero opera mesas y pedidos sin errores.
- Comandase envían a cocina sin duplicados.
- Estados de pedido respetados.

**Riesgos**: Sobrescritura silenciosa de comandas enviadas.

**Condición de bloqueo**: Se crean duplicados en comandas por reintentos.

---

## Fase 6 — Cocina, impresión y tratamiento de errores

**Objetivo**: Impresión de comandas en DIG-E200I con manejo de errores.

**Alcance**:
- Adaptador de impresión para DIG-E200I (protocolo por verificar).
- Registro de errores, reintentos, identificación de impresora.
- Reimpresiones controladas (sin duplicar venta).
- Tratamiento de errores de impresión en interfaz.

**Dependencias**: Fase 5.

**Archivos afectados**: apps/desktop (Tauri/Rust), apps/api.

**Pruebas**: Pruebas de impresión con impresora real.

**Criterios de aceptación**:
- Comanda impresa en DIG-E200I.
- Errores de impresión registrados y mostrados.
- Reimpresión no duplica venta.

**Riesgos**: Protocolo de impresora desconocido; conexión USB/red/serial no verificada.

**Condición de bloqueo**: Impresora DIG-E200I no compatible o protocolo no identificado.

---

## Fase 7 — Caja, pagos, cierre de cuentas y auditoría

**Objetivo**: Flujo de cobro y cierre de cuenta con auditoría.

**Alcance**:
- Pantalla de caja: total pendiente, importes recibidos, estado de pago.
- Cierre de cuenta.
- Registro histórico de pagos.
- Auditoría de operaciones de caja.
- Medios de pago, pago dividido y propinas (definir con restaurante).

**Dependencias**: Fase 5, Fase 6.

**Archivos afectados**: apps/client, apps/api.

**Pruebas**: Pruebas de flujo de cobro y cierre.

**Criterios de aceptación**:
- Caja registra cobros y cierra cuentas.
- Auditoría registra operaciones relevantes.
- Historial de pagos conservado.

**Riesgos**: Falta de definición de medios de pago y propinas.

**Condición de bloqueo**: No hay reglas claras de pago dividido o propinas.

---

## Fase 8 — Comunicación en tiempo real, empaquetado de plataformas y despliegue

**Objetivo**: Socket.IO para tiempo real, instalador Windows, empaquetado móvil.

**Alcance**:
- Actualizaciones en tiempo real entre mesero, cocina y caja.
- Empaquetado Tauri para Windows.
- Empaquetado Capacitor para Android/iOS (futuro).
- Despliegue de backend.

**Dependencias**: Fase 7.

**Archivos afectados**: apps/desktop, apps/mobile, apps/api.

**Pruebas**: Pruebas de tiempo real; pruebas de instalador.

**Criterios de aceptación**:
- Actualizaciones en tiempo real funcionan.
- Instalador Windows generado.
- Backend desplegado.

**Riesgos**: Arquitectura de servidor (local/nube/híbrido) no definida.

**Condición de bloqueo**: No hay definición de servidor para despliegue.

---

## Fase 9 — Pruebas integrales, endurecimiento de seguridad, documentación de operación y prueba piloto

**Objetivo**: Validar el sistema completo antes de entrega.

**Alcance**:
- Pruebas unitarias, de integración y E2E.
- Endurecimiento de seguridad.
- Documentación de operación.
- Prueba piloto en restaurante.

**Dependencias**: Fase 8.

**Archivos afectados**: Todo el repositorio.

**Pruebas**: Suite completa de pruebas.

**Criterios de aceptación**:
- Todas las pruebas pasan.
- Seguridad revisada.
- Documentación de operación lista.
- Prueba piloto exitosa.

**Riesgos**: Hallazgos críticos en prueba piloto.

**Condición de bloqueo**: Prueba piloto fallida o pruebas E2E rotas.
