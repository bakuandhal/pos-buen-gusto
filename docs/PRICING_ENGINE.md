# Motor de precios — POS Buen Gusto

## Principio
El servidor es la única autoridad para calcular y confirmar el importe de una venta. El frontend puede mostrar estimaciones, pero debe obtener del servidor el precio validado y su desglose.

## Modelo de cálculo

### Entradas
- Modalidad seleccionada.
- Opciones del plato (sopa, proteína, principio, acompañamientos, extras, observaciones).
- Adicionales seleccionados.
- Sustituciones aplicadas.
- Descuentos autorizados.

### Salida (desglose confirmado por el servidor)
- Modalidad seleccionada.
- Precio base aplicado.
- Opciones incluidas.
- Sustituciones (gratis o con recargo).
- Adicionales con precio.
- Descuentos autorizados.
- Total definitivo.

## Reglas de cálculo

PE-01. Precio fijo por modalidad.
PE-02. Opciones incluidas en el precio de la modalidad no generan cargo adicional.
PE-03. Adicionales tienen precio configurable y se suman al total.
PE-04. Sustituciones pueden ser gratuitas o con recargo, según la regla comercial.
PE-05. Evitar doble cobro: si una modalidad ya define el precio de un almuerzo sin sopa, no aplicar además una deducción por quitar la sopa, salvo que la regla comercial lo establezca expresamente.
PE-06. Descuentos autorizados se aplican sobre el total correspondiente.
PE-07. Disponibilidad temporal: una modalidad o producto puede no estar disponible en ciertos horarios o fechas.

## Precios históricos

PE-08. El importe confirmado se conserva como dato histórico, junto con:
- Desglose completo del cálculo.
- Referencia a la tarifa aplicada (modalidad + versión de tarifa).
PE-09. Los cambios de precio posteriores no modifican ventas históricas.
PE-10. Cada venta queda vinculada a la tarifa vigente en el momento de la transacción.

## Decisiones pendientes
- Catálogo definitivo de modalidades y tarifas (por definir con el restaurante).
- Reglas exactas de sustituciones y combinaciones prohibidas.
- Reglas de redondeo monetario exacto.
