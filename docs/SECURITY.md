# Seguridad — POS Buen Gusto

## Roles y permisos

| Rol | Permisos |
|-----|----------|
| Administrador | Configurar modalidades, tarifas, usuarios, roles y permisos. Acceso total a administración. |
| Mesero | Abrir mesas, agregar pedidos, modificar pedidos, cancelar platos, enviar comandas a cocina. Sin acceso a configuración de precios salvo autorización expresa. |
| Caja | Registrar cobros, cerrar cuentas, gestionar pagos. Sin acceso a configuración de precios. |

## Controles de seguridad

SEG-01. Autenticación de usuarios en el servidor (Fase 3).
SEG-02. Autorización en el servidor para cada operación sensible (abrir mesa, modificar pedido, configurar precios, cobrar, cerrar cuenta).
SEG-03. Validación de entradas en frontend y servidor.
SEG-04. Gestión segura de secretos: variables de entorno, nada de credenciales en el repositorio.
SEG-05. No exponer credenciales de PostgreSQL ni privilegios administrativos al frontend.
SEG-06. Restricciones en operaciones financieras: el servidor valida importes antes de confirmar cobros.
SEG-07. Auditoría de cambios importantes (quién, qué, cuándo).
SEG-08. Transacciones de base de datos donde correspondan (crear pedido, confirmar precio, registrar pago).
SEG-09. Prevención de duplicados en comandas y reimpresiones.
SEG-10. Copias de seguridad y recuperación (definir en fases futuras).
SEG-11. Manejo de errores sin exponer datos sensibles.

## Decisiones pendientes
- Mecanismo de autenticación (sesión, JWT, etc.).
- Políticas de contraseña y recuperación.
- Alcance exacto de auditoría por rol.
