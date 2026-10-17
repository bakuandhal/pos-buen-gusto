# Arquitectura — POS Buen Gusto

## Visión general
Monorepo candidato con aplicaciones separadas y paquetes compartidos solo cuando exista una necesidad clara. Actualmente el scaffold vive en la raíz (no se migra en Fase 0).

## Componentes y responsabilidades

### 1. Cliente Vue (escritorio + móvil compartido)
- **Tecnología**: Vue 3, TypeScript, Vite.
- **Responsabilidades**: interfaz de usuario, navegación, estado local, estimaciones de precio (solo visuales), envío de comandas, captura de firmas/entradas, animaciones GSAP/GSAP Flip.
- **Alcance futuro**: reutilizado en Capacitor para Android/iOS con adaptación responsive y funciones nativas específicas de cada plataforma.
- **No hace**: validación autoritativa de precios, cálculo definitivo de ventas, persistencia directa.

### 2. Capa de escritorio Tauri 2
- **Tecnología**: Tauri 2, Rust.
- **Responsabilidades**: empaquetado para Windows, ventana principal, comandas Rust expuestas al frontend, acceso a impresora local (adaptador desacoplado), almacenamiento local si aplica.
- **Configuración actual**: `tauri.conf.json` con `productName: pos-buen-gusto`, puerto 1420, plugin opener, ventana 800x600.

### 3. API Fastify (backend, fase futura)
- **Tecnología**: Node.js, TypeScript, Fastify.
- **Responsabilidades**: única autoridad para calcular y confirmar importes de venta, autenticación, autorización, autenticación, persistencia en PostgreSQL, Socket.IO para actualizaciones en tiempo real (futuro), validación de entradas.
- **Seguridad**: no exponer credenciales de PostgreSQL ni privilegios administrativos al frontend.

### 4. Persistencia (fase futura)
- **Tecnología**: PostgreSQL, Drizzle ORM, migraciones versionadas.
- **Responsabilidades**: almacenar mesas, pedidos, platos, comandas, cuentas, pagos, usuarios, roles, tarifas, historial de precios, auditoría, logs de impresión.

### 5. Adaptador de impresión (fase futura)
- **Responsabilidades**: comunicación con impresora DIG-E200I (protocolo por verificar), registro de errores, reintentos, identificación de impresora, reimpresiones controladas.
- **Principio**: desacoplado del resto del sistema; una reimpresión no crea venta ni pedido duplicado.

## Flujos de datos

```
Mesero abre mesa
  → Cliente envía solicitud al servidor
  → Servidor valida y crea mesa/pedido (borrador)

Mesero agrega plato con configuración
  → Cliente muestra estimación de precio
  → Servidor valida configuración y precio (autoridad única)
  → Servidor confirma importe y desglose

Mesero envía comanda a cocina
  → Servidor asigna estado "enviado a cocina"
  → Adaptador de impresión envía comanda a DIG-E200I
  → Registro de impresión (éxito / error / reintento)

Caja registra cobro
  → Servidor valida importe contra total de cuenta
  → Se registra pago y se cierra cuenta
  → Historial conservado; cambios de precio posteriores no afectan ventas pasadas
```

## Límites y reglas de arquitectura

- **Servidor como autoridad de precios**: el frontend nunca calcula totales definitivos para cobro.
- **Impresión desacoplada**: lógica de impresión isolada; fallback y reintentos controlados.
- **No sobrescribir comandas enviadas**: una vez en cocina, modificaciones generan nuevos registros, no silenciosos.
- **Precios históricos**: cada venta conserva el desglose y referencia a la tarifa aplicada en el momento.
- **No compartir secretos**: variables de entorno; nada de credenciales en el repositorio.

## Riesgos arquitectónicos identificados
- Protocolo de impresora DIG-E200I no confirmado (USB/red/serial, ESC/POS u otro).
- Arquitectura de servidor no definida (local/nube/híbrido).
- Soporte offline completo no probado.
- Falta de ESLint, Prettier, pruebas y monorepo (se añaden en Fase 1).
