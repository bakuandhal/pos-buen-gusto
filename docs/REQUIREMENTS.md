# Requisitos — POS Buen Gusto

## Requisitos funcionales

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-01 | Gestionar mesas del restaurante. | Alta |
| RF-02 | Registrar múltiples platos individuales dentro de una mesa. | Alta |
| RF-03 | Configurar características de cada almuerzo (modalidad, sopa, proteína, principio, acompañamientos, extras, observaciones). | Alta |
| RF-04 | Registrar pedidos para llevar sin asignarlos obligatoriamente a una mesa. | Alta |
| RF-05 | Administrar precios y modalidades desde la aplicación sin modificar código. | Alta |
| RF-06 | Validar importes de venta en el servidor (el servidor es la única autoridad). | Alta |
| RF-07 | Enviar comandas a cocina. | Alta |
| RF-08 | Integrar impresora DIG-E200I una vez confirmada su compatibilidad técnica. | Media |
| RF-09 | Administrar usuarios, roles y permisos. | Alta |
| RF-10 | Gestionar cuentas, cobros y cierres. | Alta |
| RF-11 | Interfaz visual moderna, rápida y agradable, priorizando eficiencia del restaurante. | Alta |
| RF-12 | Ejecutarse como aplicación instalable en Windows. | Alta |
| RF-13 | Aplicaciones móviles para meseros en Android e iOS (Capacitor, futuro). | Baja (futuro) |

### Detalle de requisitos clave

**Gestión de mesas y pedidos**
- Una mesa puede contener varios platos con diferentes características.
- Cada plato debe conservar su propia configuración y precio.
- Un pedido puede recibir modificaciones controladas.

**Configuración administrativa**
- El administrador define modalidades y tarifas desde la app.
- Soportar precios configurables por modalidad, opciones incluidas, adicionales, descuentos autorizados y sustituciones.
- Disponibilidad temporal de productos y modalidades.
- Historial de modificaciones de tarifas.

**Motor de precios**
- El frontend puede mostrar estimaciones, pero obtiene del servidor el precio validado y su desglose.
- Modelo que incluya: modalidad seleccionada, precio base, opciones incluidas, sustituciones, adicionales, descuentos autorizados, total definitivo.
- Evitar cobrar dos veces por la misma opción.
- Representación monetaria exacta (evitar punto flotante para dinero).
- El importe confirmado se conserva como dato histórico con desglose y referencia a la tarifa aplicada.
- Cambios de precio posteriores no modifican ventas históricas.

**Comandas y cocina**
- Estados de pedido: borrador, confirmado, enviado a cocina, modificado, cancelado, completado.
- Los envíos repetidos no deben crear duplicados por fallos de conexión o reintentos.
- No sobrescribir silenciosamente una comanda ya enviada a cocina.
- Si una operación no puede confirmarse, la interfaz presenta un estado claro y permite comprobar el resultado antes de repetirla.

**Impresión**
- Impresora DIG-E200I (protocolo y conexión por verificar).
- Registro de errores, reintentos, identificación de la impresora, reimpresiones controladas.
- Una reimpresión no crea nueva venta ni pedido duplicado.

**Caja**
- Ciclo de cuenta: platos solicitados → total pendiente → importes recibidos → estado de pago → cierre de cuenta → registro histórico.
- Control de permisos sobre operaciones de caja.

**Experiencia visual**
- Jerarquía visual clara, tipografía legible, espaciado consistente, tarjetas informativas, navegación rápida.
- Estados de carga, error, éxito y vacío.
- Diseño adaptable a escritorio y móvil.
- Accesibilidad y soporte para reducción de movimiento.
- GSAP y GSAP Flip para transiciones entre estados visuales (ej. expansión de tarjeta de mesa en modal con continuidad espacial).

**Seguridad**
- Validación de entradas, autenticación, autorización en el servidor.
- Gestión segura de secretos y variables de entorno.
- Restricciones en operaciones financieras.
- Auditoría de cambios importantes.
- Transacciones de base de datos donde correspondan.
- Prevención de duplicados.
- Manejo de errores sin exponer datos sensibles.

## Requisitos no funcionales

| ID | Requisito | Detalle |
|----|-----------|---------|
| RNF-01 | Rendimiento | Interfaz rápida; animaciones no obstaculizan el trabajo del restaurante. |
| RNF-02 | Fiabilidad | Prevención de duplicados en comandas y reimpresiones. |
| RNF-03 | Seguridad | Autorización en servidor; secretos fuera del repositorio. |
| RNF-04 | Mantenibilidad | Documentación actualizada; migraciones versionadas. |
| RNF-05 | Portabilidad | Escritorio Windows; futuro móvil Android/iOS. |
| RNF-06 | Compilabilidad | `npm run build` debe pasar tras cada cambio. |
| RNF-07 | Observabilidad | Registro de errores de impresión y operaciones críticas. |

## Decisiones pendientes (ver OPEN_QUESTIONS.md)
- Arquitectura de conectividad: servidor local, nube o híbrido.
- Protocolo y conexión de la impresora DIG-E200I.
- Medios de pago, pago dividido, propinas.
- Catálogo inicial de modalidades y tarifas.
