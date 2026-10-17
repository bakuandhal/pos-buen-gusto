# Preguntas abiertas — POS Buen Gusto

Decisiones que requieren respuesta del propietario del restaurante antes de avanzar a implementación.

## Conectividad y servidor
- Q1. ¿El restaurante usará servidor local, servidor en la nube o arquitectura híbrida?
  - Impacto: diseño de sincronización, impresión local, disponibilidad sin internet.
  - Alternativas: local (impresión directa, sin dependencia de internet), nube (acceso remoto, depende de internet), híbrido (local con sincronización nube).
  - Recomendación: definir antes de Fase 3.

## Impresora DIG-E200I
- Q2. ¿Cuál es el protocolo de impresión? (¿ESC/POS o otro?)
- Q3. ¿Qué tipo de conexión usa? (USB, red Ethernet, puerto serial, Bluetooth?)
- Q4. ¿Hay impresora ya instalada y operativa en el restaurante?
  - Impacto: adaptador de impresión en Fase 6.
  - Recomendación: verificar compatibilidad técnica antes de Fase 6.

## Pagos y caja
- Q5. ¿Qué medios de pago se aceptan? (efectivo, tarjeta, transferencia, etc.)
- Q6. ¿Se requiere pago dividido por cuenta?
- Q7. ¿Existen reglas de propinas? (porcentaje, opcional, obligatorio?)
  - Impacto: Fase 7 (caja).
  - Recomendación: definir antes de Fase 7.

## Precios y catálogo
- Q8. ¿Cuál es el catálogo inicial de modalidades y tarifas?
  - Ejemplos ilustrativos (no definitivos): almuerzo completo en mesa, almuerzo completo para llevar, almuerzo para llevar sin sopa, almuerzo sin sopa en mesa.
  - Impacto: Fase 4 (motor de precios).
  - Recomendación: proporcionar lista concreta antes de Fase 4.

## Roles y permisos
- Q9. ¿Quiénes son los usuarios y cuáles son sus roles exactos?
- Q10. ¿Pueden los meseros modificar precios en algún caso autorizado?
  - Impacto: Fase 3 y Fase 4 (seguridad).

## Offline
- Q11. ¿Es requisito indispensable el funcionamiento completo sin conexión a internet?
  - Impacto: arquitectura de conectividad y sincronización.
  - Recomendación: no asumir offline completo hasta diseñarlo y probarlo.

## Formato de respuesta sugerido
Cada pregunta debe responderse con: decisión tomada, justificación, impacto en el plan de fases, y alternativas consideradas.
