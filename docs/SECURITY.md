# Seguridad — POS Buen Gusto

## Visión general

Este documento actualiza la definición de seguridad con los controles implementados en la Fase 3.

## Roles y permisos

| Rol | Permisos |
|-----|----------|
| Administrador | Configurar modalidades, tarifas, usuarios, roles y permisos. Acceso total a administración. |
| Mesero | Abrir mesas, agregar pedidos, modificar pedidos, cancelar platos, enviar comandas a cocina. Sin acceso a configuración de precios salvo autorización expresa. |
| Caja | Registrar cobros, cerrar cuentas, gestionar pagos. Sin acceso a configuración de precios. |

## Controles de seguridad implementados (Fase 3)

| ID | Control | Estado | Implementación |
|----|---------|--------|----------------|
| SEG-01 | Autenticación de usuarios en el servidor | ✅ | JWT + Argon2id, Fastify |
| SEG-02 | Autorización en el servidor para cada operación sensible | ✅ | Decoradores `authenticate` y `requirePermission` |
| SEG-03 | Validación de entradas en frontend y servidor | ✅ | Zod en servidor; Vue en frontend |
| SEG-04 | Gestión segura de secretos | ✅ | Variables de entorno, `.env` en `.gitignore` |
| SEG-05 | No exponer credenciales de PostgreSQL ni privilegios al frontend | ✅ | Backend isolado; JWT solo contiene IDs y roles |
| SEG-06 | Restricciones en operaciones financieras | ⏳ | Fase 7 (caja y pagos) |
| SEG-07 | Auditoría de cambios importantes | ✅ | Tabla `audit_logs` definida en el esquema |
| SEG-08 | Transacciones de base de datos | ⏳ | Fase 5 (pedidos y pagos) |
| SEG-09 | Prevención de duplicados en comandas y reimpresiones | ⏳ | Fase 5 y 6 |
| SEG-10 | Copias de seguridad y recuperación | ⏳ | Fase 9 |
| SEG-11 | Manejo de errores sin exponer datos sensibles | ✅ | Error handler global que no expone trazas internas |

## Mecanismos de autenticación

- **Hash de contraseñas:** Argon2id con parámetros seguros (memoria: 65536 KB, iteraciones: 3, paralelismo: 4).
- **Tokens de acceso:** JWT con expiración corta (15 minutos por defecto).
- **Tokens de renovación:** Tokens aleatorios de 256 bits; su hash se almacena en la base de datos.
- **Rotación de refresh tokens:** Cada renovación revoca el token anterior y crea uno nuevo.
- **Revoca de sesiones:** El logout revoca el refresh token usado.

## Decisiones pendientes

- Mecanismo de recuperación de contraseña (requiere configuración de correo).
- Políticas de bloqueo por intentos fallidos repetidos.
- Alcance exacto de auditoría por rol (qué operaciones se registran).
- Expiración de sesiones en dispositivos móviles (Capacitor).

## Variables de entorno relacionadas con seguridad

| Variable | Descripción |
|----------|-------------|
| `JWT_SECRET` | Secreto para firmar y verificar JWT (mínimo 32 caracteres) |
| `JWT_ACCESS_TOKEN_EXPIRY` | Tiempo de expiración del token de acceso |
| `JWT_REFRESH_TOKEN_EXPIRY` | Tiempo de expiración del token de renovación |
| `CORS_ORIGINS` | Orígenes permitidos para CORS (lista separada por comas) |

**Nunca commitear valores reales de estas variables.**
