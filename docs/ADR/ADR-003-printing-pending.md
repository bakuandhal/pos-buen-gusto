# ADR-003: Lógica de impresión desacoplada (protocolo DIG-E200I pendiente)

## Estado
Propuesto / pendiente de verificación técnica

## Contexto
Existe una impresora DIG-E200I en el restaurante. Todavía no se ha confirmado el protocolo de impresión, el tipo de conexión ni las capacidades específicas del modelo instalado. No se asume que use ESC/POS ni USB, red o puerto serial sin verificarlo.

## Decisión
Separar la lógica de impresión del resto del sistema mediante un adaptador desacoplado (Fase 6). El adaptador contendrá:
- Comunicación con la impresora (protocolo por definir tras verificación).
- Registro de errores, reintentos, identificación de la impresora.
- Reimpresiones controladas (no crear nueva venta ni pedido duplicado).

## Alternativas consideradas
- Integrar impresión directamente en el cliente Vue: rechazado (acopla UI a hardware, difícil de probar y mantener).
- Asumir ESC/POS por defecto: rechazado (no verificado, riesgo de incompatibilidad).

## Riesgos
- Protocolo desconocido: puede impedir la impresión en Fase 6.
- Conexión no verificada (USB/red/serial): puede requerir hardware adicional.

## Próximos pasos
- Verificar compatibilidad técnica de la DIG-E200I antes de Fase 6.
- Documentar el protocolo confirmado en este ADR o en uno nuevo.

## Fecha
2026-10-16
