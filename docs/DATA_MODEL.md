# Modelo de datos — POS Buen Gusto

## Entidades principales

| Entidad | Descripción |
|---------|-------------|
| Mesa | Mesa del restaurante. Puede tener varios platos/pedidos. |
| Pedido | Agrupación de platos para una mesa o para llevar. Estados: borrador, confirmado, enviado a cocina, modificado, cancelado, completado. |
| PlatoIndividual | Plato dentro de un pedido. Conserva su propia configuración y precio. |
| ConfiguracionPlato | Detalle de opciones del plato: modalidad, sopa, proteína, principio, acompañamientos, extras, observaciones. |
| Modalidad | Tipo de venta (ej. almuerzo completo en mesa, para llevar, etc.). |
| Tarifa | Precio asociado a una modalidad, con vigencia temporal. |
| OpcionIncluida | Opción incluida dentro del precio de una modalidad. |
| Adicional | Adicion con precio configurable. |
| Sustitucion | Sustitución gratuita o con recargo. |
| DescuentoAutorizado | Descuento aplicable a un pedido/plato. |
| Comanda | Envío a cocina de uno o más platos. Evita duplicados por reintentos. |
| Cuenta | Agrupación de pedidos para cobro. Total pendiente, importes recibidos, estado de pago. |
| Pago | Registro de un pago (medio, importe, fecha). |
| Usuario | Usuario del sistema (mesero, caja, administrador). |
| Rol | Rol con conjunto de permisos. |
| Permiso | Acción permitida (abrir mesa, agregar plato, configurar precios, etc.). |
| Auditoria | Registro de operaciones relevantes (quién, qué, cuándo). |
| ImpresoraLog | Registro de intentos de impresión (éxito, error, reintento). |

## Relaciones e invariantes

- Una **Mesa** tiene muchos **Pedido**.
- Un **Pedido** tiene muchos **PlatoIndividual**.
- Cada **PlatoIndividual** tiene una **ConfiguracionPlato** y un precio asociado (instantánea al momento de la venta).
- Un **PlatoIndividual** pertenece a una **Modalidad** y usa una **Tarifa** vigente.
- Una **Tarifa** pertenece a una **Modalidad** y tiene fechas de vigencia.
- Una **Cuenta** agrupa uno o más **Pedido** para cobro.
- Un **Pago** pertenece a una **Cuenta**.
- Un **Usuario** tiene un **Rol**; un **Rol** tiene muchos **Permiso**.
- Cada **Comanda** referencia los **PlatoIndividual** enviados a cocina.
- Cada **ImpresoraLog** referencia la impresora y el intento de impresión.

## Invariantes y restricciones

INV-01. El importe de un plato se calcula y confirma en el servidor; el frontend solo muestra estimaciones.
INV-02. El importe confirmado se conserva como dato histórico con desglose y referencia a la tarifa aplicada.
INV-03. Cambios de precio posteriores no modifican ventas históricas.
INV-04. Evitar cobrar dos veces por la misma opción (si la modalidad ya define precio sin sopa, no aplicar deducción adicional salvo regla comercial expresa).
INV-05. Representación monetaria exacta (centavos o decimal); no usar punto flotante para dinero.
INV-06. No sobrescribir silenciosamente una comanda ya enviada a cocina.
INV-07. Los envíos repetidos no crean duplicados (idempotencia por reintentos).
INV-08. Una reimpresión no crea nueva venta ni pedido duplicado.
INV-09. Un pedido puede tener estados: borrador, confirmado, enviado a cocina, modificado, cancelado, completado.
INV-10. Un pedido para llevar no requiere asignación a mesa obligatoria.

## Consideraciones de migración
- Las migraciones serán versionadas con Drizzle ORM (Fase 3).
- No se crean tablas en Fase 0.
