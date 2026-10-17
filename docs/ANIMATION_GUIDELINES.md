# Guía de Animaciones — POS Buen Gusto

## Visión general

Esta guía documenta el lenguaje de movimiento de la aplicación, construido sobre GSAP y el plugin GSAP Flip. Las animaciones priorizan la eficiencia operativa sobre el espectáculo visual: en un entorno de restaurante, la rapidez de uso es más importante que el espectáculo.

## Configuración centralizada

Todas las duraciones, curvas y utilidades de animación están definidas en `src/styles/animations.ts`:

### Duraciones

| Nombre | Segundos | Uso |
|--------|----------|-----|
| `ANIMATION_DURATION.fast` | 0.2 | Transiciones rápidas (badges, tooltips) |
| `ANIMATION_DURATION.normal` | 0.35 | Transiciones estándar (modales, listas) |
| `ANIMATION_DURATION.slow` | 0.5 | Transiciones lentas (cambios de vista) |

### Curvas de easing

| Nombre | Valor | Uso |
|--------|-------|-----|
| `ANIMATION_EASE.standard` | `power2.inOut` | Curva estándar para la mayoría de transiciones |
| `ANIMATION_EASE.spring` | `back.out(1.7)` | Entradas con ligero rebote |
| `ANIMATION_EASE.flip` | `power2.inOut` | Transiciones GSAP Flip |
| `ANIMATION_EASE.modalIn` | `power2.out` | Entrada de modales |
| `ANIMATION_EASE.modalOut` | `power2.in` | Salida de modales |

### Utilidades exportadas

- `createGsapContext()` — Crea un contexto GSAP que se limpia automáticamente al desmontar
- `animateModalIn(element)` — Animación de entrada de modal
- `animateModalOut(element)` — Animación de salida de modal
- `animateListIn(elements)` — Animación de entrada escalonada de listas

## Pretty Modals: expansión de tarjetas con GSAP Flip

El componente `PModal` implementa el patrón de transición compartida entre tarjetas y modales, prioridad máxima de la Fase 2.

### Flujo de apertura

1. **Captura del estado inicial**: `Flip.getState()` captura el rect y propiedades del elemento origen (tarjeta de mesa).
2. **Activación del estado expandido**: El modal se vuelve visible con `visibility: "visible"` pero `opacity: 0`.
3. **Coordinación del DOM con Vue**: `nextTick()` asegura que Vue haya actualizado el DOM antes de animar.
4. **Animación Flip**: `Flip.from()` anima la transformación de posición y dimensiones desde el origen al modal.
5. **Introducción del contenido**: El contenido del modal se revela de forma coordinada.
6. **Gestión de fondo y foco**: Backdrop con blur, foco en el botón de cerrar, scroll del body bloqueado.

### Flujo de cierre

1. **Transición inversa**: El contenido del modal se oculta primero (opacidad y escala).
2. **Continuidad con el origen**: `Flip.from()` anima el retorno a la posición y dimensiones de la tarjeta origen.
3. **Cierre de capa de superposición**: El backdrop se desvanece.
4. **Recuperación del estado original**: La tarjeta origen vuelve a ser visible.
5. **Desmontaje seguro**: El contenido temporal se desmonta solo cuando la animación ha terminado.
6. **Devolución del foco**: El foco vuelve al elemento que abrió el modal.

### Reglas de implementación

| Regla | Descripción |
|-------|-------------|
| GSAP Flip | Obligatorio para transiciones de elementos compartidos |
| `gsap.context()` | Usado para limpiar automáticamente animaciones al desmontar |
| Vue `ref` | Gestión de referencias a elementos DOM |
| `nextTick()` | Coordinación de cambios reactivos con el DOM |
| No selectores globales | Evitar IDs duplicados o selectores frágiles |
| Un timeline por elemento | No animar el mismo elemento desde varios timelines simultáneos |
| Gestión de clics repetidos | Prevenir doble apertura/cierre durante animación |
| Cierre durante apertura | Gestionar inversión de transición si se cierra antes de terminar |
| No bloquear la UI | La interfaz nunca queda bloqueada si una animación termina anticipadamente |
| Orden de capas | Respetar z-index y comportamiento del scroll |
| Fondo de superposición | Controlar interacción de elementos detrás del modal |
| Foco y Escape | Gestión de foco, cierre con tecla Escape, accesibilidad de diálogo |

### Variantes de modal

| Variante | Descripción |
|----------|-------------|
| Modal de contenido | Ventana convencional con título y cuerpo |
| Modal de confirmación | Diálogo de aceptación/cancelación |
| Panel de edición | Formulario de edición de entidad |
| Modal expandido desde tarjeta | Transición Flip compartida con tarjeta origen |

## Catálogo de animaciones

| Animación | Descripción | Duración | Easing |
|-----------|-------------|----------|--------|
| Apertura de modal | Desvanecimiento + escala desde origen | 0.35s | power2.out |
| Cierre de modal | Desvanecimiento + escala hacia origen | 0.2s | power2.in |
| Expansión de tarjeta | GSAP Flip: posición y dimensiones | 0.4s | power2.inOut |
| Contracción de tarjeta | GSAP Flip: retorno a origen | 0.4s | power2.inOut |
| Aparición de lista | Stagger escalonado de elementos | 0.2s + 0.06s staggered | power2.out |
| Cambio de estado | Transición de badge de estado | 0.2s | power2.inOut |
| Entrada de panel | Deslizamiento desde lateral | 0.35s | power2.out |
| Actualización de cantidad | Cambio numérico en control | 0.2s | power2.out |
| Notificación | Deslizamiento desde derecha | 0.35s | power2.out |
| Estado de carga | Spinner giratorio continuo | 0.8s | linear |

## Preferencia de movimiento reducido

Cuando el usuario tiene `prefers-reduced-motion: reduce`:

- Todas las duraciones de animación se establecen a 0.01s
- Se desactivan transiciones de `transform` y `opacity` no esenciales
- Los modales siguen siendo funcionales (abrir/cerrar) pero sin animación de continuidad espacial
- Los spinners de carga se mantienen (son funcionales, no decorativos)

## Propiedades animadas recomendadas

Se anima únicamente `transform` y `opacity` para evitar recálculos costosos del layout:

- ✅ `transform: translate(), scale(), rotate()`
- ✅ `opacity`
- ❌ `width`, `height`, `top`, `left`, `margin`, `padding` (provocan reflow)

## Limpieza de animaciones

Todos los componentes que usan GSAP deben:

1. Crear un contexto con `gsap.context()` o equivalent
2. Matemor todos los tweens en `onUnmounted`
3. Restaurar `document.body.style.overflow` al desmontar modales
4. Gestionar el foco al abrir y cerrar
