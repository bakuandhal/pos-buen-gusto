# API — POS Buen Gusto

## Visión general

Documentación de los endpoints de la API del backend (Fase 3). El servidor está construido con Fastify 5 y TypeScript.

## Base URL

Desarrollo: `http://localhost:3000`

## Endpoints

### Diagnóstico

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| `GET` | `/health` | Verifica que el servidor responde | No |
| `GET` | `/ready` | Verifica que la base de datos está disponible | No |

`/health` no revela datos internos del servidor.

`/ready` devuelve `503` si la base de datos no está disponible, sin incluir credenciales ni detalles sensibles.

### Autenticación

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| `POST` | `/api/v1/auth/login` | Autentica al usuario y devuelve tokens | No |
| `POST` | `/api/v1/auth/refresh` | Renueva el token de acceso usando refresh token | No |
| `POST` | `/api/v1/auth/logout` | Revoca el refresh token y cierra la sesión | No |
| `GET` | `/api/v1/auth/me` | Devuelve información del usuario autenticado | Sí (JWT) |

#### POST /api/v1/auth/login

**Cuerpo de la solicitud:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Respuesta exitosa (200):**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@pos-buen-gusto.local",
    "fullName": "Administrador del Sistema",
    "role": "administrador",
    "permissions": ["abrir_mesa", "agregar_pedido", "..."]
  },
  "tokens": {
    "accessToken": "string",
    "refreshToken": "string",
    "accessTokenExpiresAt": "2026-10-17T...",
    "refreshTokenExpiresAt": "2026-10-24T..."
  }
}
```

**Respuesta de error (401):**
```json
{
  "error": "credenciales_invalidas",
  "message": "Nombre de usuario o contraseña incorrectos"
}
```

#### POST /api/v1/auth/refresh

**Cuerpo de la solicitud:**
```json
{
  "refreshToken": "string"
}
```

**Respuesta exitosa (200):**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "accessTokenExpiresAt": "2026-10-17T...",
  "refreshTokenExpiresAt": "2026-10-24T..."
}
```

#### POST /api/v1/auth/logout

**Cuerpo de la solicitud:**
```json
{
  "refreshToken": "string"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Sesión cerrada"
}
```

#### GET /api/v1/auth/me

Requiere token de acceso válido en el encabezado `Authorization: Bearer <token>`.

**Respuesta exitosa (200):**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@pos-buen-gusto.local",
    "fullName": "Administrador del Sistema",
    "role": "administrador",
    "permissions": ["..."]
  }
}
```

## Respuestas de error

Todos los errores siguen el formato:
```json
{
  "error": "codigo_de_error",
  "message": "Descripción legible"
}
```

Códigos de error comunes:
- `no_autorizado` — Token inválido o expirado
- `no_autenticado` — Usuario no autenticado
- `sin_permisos` — El usuario no tiene el permiso requerido
- `credenciales_invalidas` — Usuario o contraseña incorrectos
- `token_invalido` — Refresh token inválido o expirado
- `usuario_inactivo` — El usuario está deshabilitado
- `validacion_fallida` — Datos de entrada inválidos
- `error_servidor` — Error interno (sin detalles expuestos)

## CORS

Los orígenes permitidos se configuran mediante `CORS_ORIGINS` en `.env.example`. No se permite `*` en entornos con autenticación.

## Endpoints no implementados en Fase 3

Los siguientes endpoints pertenecen a fases posteriores:
- Gestión de precios, modalidades y tarifas (Fase 4)
- Mesas, platos y pedidos (Fase 5)
- Cocina e impresión (Fase 6)
- Caja, pagos y cierre de cuentas (Fase 7)
