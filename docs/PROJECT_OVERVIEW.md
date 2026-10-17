# Visión general del proyecto — POS Buen Gusto

## Propósito
Construir un sistema punto de venta (POS) para un restaurante que vende principalmente almuerzos. El sistema permite gestionar mesas, registrar pedidos con múltiples platos individuales, configurar características de cada almuerzo, administrar precios y modalidades sin modificar código, validar importes en el servidor, enviar comandas a cocina, integrar una impresora DIG-E200I, administrar usuarios/roles/permisos, gestionar cuentas, cobros y cierres, y proporcionar una interfaz visual moderna, rápida y agradable.

## Producto
Aplicación instalable en Windows construida con Tauri 2 + Vue 3 + TypeScript + Vite. Futuras aplicaciones móviles para meseros en Android e iOS mediante Capacitor, reutilizando la interfaz Vue y componentes compatibles.

## Usuarios y roles
- **Mesero**: abre mesas, agrega pedidos, modifica platos, envía comandas a cocina.
- **Caja**: registra cobros, cierra cuentas, gestiona pagos.
- **Administrador**: configura modalidades, tarifas, usuarios, roles y permisos. No se concede acceso a precios a meseros salvo autorización expresa.

## Alcance (Fase 0)
Análisis, reglas del negocio, decisiones arquitectónicas y documentación. No se implementa funcionalidad todavía.

## Fuera de alcance (por ahora)
- Integraciones financieras ni facturación electrónica sin requerimiento explícito.
- Soporte offline completo sin diseñarlo y probarlo primero.
- Asumir protocolo de la impresora DIG-E200I sin verificar compatibilidad técnica.

## Stack establecido
Frontend: Vue 3, TypeScript, Vite, (Vue Router y Pinia si la arquitectura lo justifica), GSAP/GSAP Flip para animaciones.
Escritorio: Tauri 2 para Windows, Rust para capa nativa.
Móvil: Capacitor para Android e iOS (futuro).
Backend: Node.js, TypeScript, Fastify, Socket.IO (futuro).
Persistencia: PostgreSQL, Drizzle ORM, migraciones versionadas.
