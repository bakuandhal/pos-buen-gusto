# Reglas del negocio — POS Buen Gusto

## 1. Productos y platos individuales

BR-01. Un almuerzo no se modela solo como descripción y precio. Cada plato conserva su propia configuración.
BR-02. Opciones posibles por plato: modalidad (en mesa / para llevar), sopa (incluida / omitida / sustituida), proteína, principio y acompañamientos, extras, observaciones.
BR-03. No todas las opciones son obligatorias ni todas las combinaciones son válidas.
BR-04. Una mesa puede contener varios almuerzos con diferentes configuraciones; debe identificarse claramente qué configuración pertenece a cada plato.
BR-05. Es posible registrar pedidos para llevar sin asignarlos obligatoriamente a una mesa.

## 2. Configuración administrativa de precios

BR-06. El administrador define modalidades y tarifas desde la aplicación.
BR-07. Ejemplos ilustrativos (no catálogo definitivo): almuerzo completo en mesa, almuerzo completo para llevar, almuerzo para llevar sin sopa, almuerzo sin sopa en mesa.
BR-08. El modelo debe soportar:
- Precio fijo por modalidad.
- Opciones incluidas en el precio.
- Adicionales con precio configurable.
- Sustituciones gratuitas o con recargo.
- Opciones no disponibles.
- Combinaciones prohibidas.
- Disponibilidad temporal de productos y modalidades.
- Historial de modificaciones de las tarifas.
BR-09. No inventar importes ni reglas comerciales; identificar qué falta y proponer alternativas concretas.

## 3. Motor de precios

BR-10. El servidor es la única autoridad para calcular y confirmar el importe de una venta.
BR-11. El frontend puede mostrar estimaciones, pero debe obtener del servidor el precio validado y su desglose.
BR-12. El modelo debe conocer: modalidad seleccionada, precio base aplicado, opciones incluidas, sustituciones, adicionales, descuentos autorizados, total definitivo.
BR-13. Evitar cobrar dos veces por una misma opción. Si una modalidad ya define el precio de un almuerzo sin sopa, no aplicar además una deducción por quitar la sopa, salvo que la regla comercial lo establezca expresamente.
BR-14. Usar representación monetaria exacta y reglas de redondeo explícitas; evitar aritmética de punto flotante para dinero.
BR-15. El importe confirmado se conserva como dato histórico, junto con el desglose de cálculo y la referencia a la tarifa aplicada.
BR-16. Los cambios de precio posteriores no modifican ventas históricas.

## 4. Mesas y comandas

BR-17. Definir por separado: Mesa, Pedido, Plato individual, Comanda, Cuenta, Pago.
BR-18. Una mesa puede tener varios platos y un pedido puede recibir modificaciones controladas.
BR-19. Cada plato está asociado a su propia configuración y precio.
BR-20. Los envíos repetidos no crean duplicados por fallos de conexión o reintentos.
BR-21. Si una operación no puede confirmarse, la interfaz presenta un estado claro y permite comprobar el resultado antes de repetirla.
BR-22. No sobrescribir silenciosamente una comanda ya enviada a cocina.

## 5. Estados del pedido

BR-23. Estados explícitos: borrador, confirmado, enviado a cocina, modificado, cancelado, completado (cuando corresponda).

## 6. Usuarios y permisos

BR-24. Roles iniciales: administrador, mesero, caja.
BR-25. Los meseros no tienen acceso a la configuración administrativa de precios, salvo autorización expresa.
BR-26. Permisos definidos: abrir mesas, agregar pedidos, modificar pedidos, cancelar platos, registrar cobros, cerrar cuentas.
BR-27. Las operaciones relevantes deben poder auditarse.

## 7. Cocina e impresión

BR-28. Existe una impresora DIG-E200I.
BR-29. No asumir protocolo (ESC/POS), tipo de conexión (USB, red, serial) ni capacidades sin verificar.
BR-30. Documentar cómo comprobar compatibilidad y separar la lógica de impresión del resto del sistema.
BR-31. Contemplar registro de errores, reintentos, identificación de la impresora y reimpresiones controladas.
BR-32. Una reimpresión no crea nueva venta ni pedido duplicado.

## 8. Caja

BR-33. Ciclo de cuenta: platos solicitados → total pendiente → importes recibidos → estado de pago → cierre de cuenta → registro histórico.
BR-34. Control de permisos sobre operaciones de caja.
BR-35. Pago dividido, medios de pago concretos y reglas de propinas son decisiones pendientes si no hay información suficiente.
BR-36. No implementar integraciones financieras ni facturación electrónica sin requerimiento explícito.

## 9. Conectividad

BR-37. No confirmado si el restaurante usará servidor local, nube o híbrido.
BR-38. Distinguir: pérdida de internet, pérdida de red local, pérdida de conexión cliente-servidor, funcionamiento sin conexión.
BR-39. No afirmar soporte offline completo hasta diseñarlo y probarlo.

## Cuestiones pendientes
- Catálogo definitivo de modalidades y tarifas.
- Reglas exactas de sustituciones y combinaciones prohibidas.
- Medios de pago, pago dividido, propinas.
- Protocolo de impresora DIG-E200I.
- Arquitectura de servidor (local / nube / híbrido).
