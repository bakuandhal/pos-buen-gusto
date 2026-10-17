# Autenticación — POS Buen Gusto

## Visión general

La Fase 3 implementa un sistema de autenticación basado en JWT (JSON Web Tokens) con rotación de refresh tokens, hashing de contraseñas con Argon2id y control de acceso basado en roles (RBAC).

## Stack de seguridad

| Componente | Versión | Propósito |
|------------|---------|-----------|
| Argon2id | ^0.45.0 | Hash de contraseñas (resistente a GPU/ASIC) |
| @fastify/jwt | ^10.0.0 | Generación y verificación de JWT |
| Zod | ^4.6.7 | Validación de esquemas de entrada |

## Flujo de autenticación

### 1. Registro de contraseña

Las contraseñas se hashean con Argon2id antes de almacenarse:
- Nunca se almacenan contraseñas en texto plano.
- Nunca se usa SHA-256 u otros hashes rápidos para contraseñas.
- El hash se almacena en la columna `password_hash` de la tabla `users`.

### 2. Inicio de sesión (`POST /api/v1/auth/login`)

1. Se valida que el usuario exista y esté activo.
2. Se verifica la contraseña contra el hash almacenado con Argon2id.
3. Si las credenciales son correctas, se generan:
   - **Access Token (JWT):** Contiene `userId`, `username`, `role` y `permissions`. Expiración corta (15 min).
   - **Refresh Token:** Token aleatorio de 32 bytes (hex). Su hash se almacena en `refresh_tokens`. Expiración larga (7 días).
4. Se actualiza `last_login_at` del usuario.

### 3. Renovación de sesión (`POST /api/v1/auth/refresh`)

1. Se verifica que el refresh token exista y no esté revocado.
2. Se verifica que no haya expirado.
3. Se verifica que el usuario siga activo.
4. Se revoca el refresh token usado (rotación).
5. Se genera un nuevo par de access token + refresh token.

### 4. Cierre de sesión (`POST /api/v1/auth/logout`)

1. Se revoca el refresh token proporcionado (si se envía).
2. El cliente debe eliminar ambos tokens de su almacenamiento local.

### 5. Usuario autenticado (`GET /api/v1/auth/me`)

1. Se verifica el access token JWT.
2. Se devuelve la información no sensible del usuario y sus permisos efectivos.

## Control de acceso (Autorización)

### Decoradores de Fastify

- `app.authenticate` — Verifica que exista un JWT válido. Usado como `preHandler` en rutas protegidas.
- `app.requirePermission(acción)` — Verifica que el usuario tenga el permiso específico. Usado como `preHandler` en rutas que requieren permisos granulares.

### Roles y permisos

| Rol | Permisos |
|-----|----------|
| `administrador` | Acceso total: configurar precios, gestionar usuarios, abrir mesas, agregar pedidos, enviar comandas, registrar cobros, cerrar cuentas |
| `mesero` | Abrir mesas, agregar pedidos, modificar pedidos, cancelar platos, enviar comandas a cocina. Sin acceso a configuración de precios. |
| `caja` | Registrar cobros, cerrar cuentas, gestionar pagos. Sin acceso a configuración de precios. |

La autorización se verifica **en el servidor** en cada ruta protegida. Ocultar botones en el frontend no constituye control de acceso.

## Seguridad

- **Sin secretos en logs:** Los serializadores de Fastify excluyen contraseñas, tokens y credenciales de los registros.
- **Sin enumeración de usuarios:** Los errores de autenticación no revelan si una cuenta existe.
- **Rotación de refresh tokens:** Cada uso revoca el token anterior y genera uno nuevo, detectando reutilización.
- **Revoca de sesiones:** El logout revoca el refresh token; el bootstrap admin puede revocar todos los tokens de un usuario.
- **Validación de entrada:** Todos los endpoints de autenticación validan el cuerpo de la solicitud con esquemas Zod.
- **Errores sin datos sensibles:** Los errores internos no exponen trazas, cadenas de conexión ni credenciales.

## Bootstrap del administrador

El comando `npm run bootstrap:admin` crea el primer usuario administrador:

```powershell
# Con argumentos
npm run bootstrap:admin admin MiContraseñaSegura123

# Con variables de entorno
ADMIN_USERNAME=admin ADMIN_PASSWORD=MiContraseñaSegura123 npm run bootstrap:admin
```

El comando:
- Verifica que no exista ya un administrador.
- No usa contraseñas predeterminadas.
- No imprime la contraseña en los registros.
- Genera el hash con Argon2id.
- Se detiene con error si la configuración de base de datos es incorrecta.

## Limitaciones de Fase 3

- No se implementa recuperación de contraseña por correo electrónico.
- No se implementa autenticación de dos factores (2FA).
- No se implementa gestión de sesiones en múltiples dispositivos (más allá de refresh tokens).
- Las pruebas de integración que requieren PostgreSQL real están documentadas como pendientes si no hay base de datos disponible.
