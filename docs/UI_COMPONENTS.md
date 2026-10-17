# Componentes de Interfaz — POS Buen Gusto

## Visión general

Este documento describe los componentes reutilizables implementados en la Fase 2. Los componentes están diseñados para ser pequeños, con responsabilidades claras, y preparados para conectarse posteriormente con datos reales del backend, reglas de precios, gestión de pedidos y permisos.

## Componentes base

### PBtn

Botón principal de la aplicación con múltiples variantes y tamaños.

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'primario' \| 'secundario' \| 'fantasma' \| 'peligro'` | `'primario'` | Variante visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del botón |
| `disabled` | `boolean` | `false` | Estado deshabilitado |
| `loading` | `boolean` | `false` | Estado de carga (muestra spinner) |
| `tipo` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo HTML del botón |

**Eventos:**
- `click` — Emitido al hacer clic (si no está deshabilitado ni cargando)

**Archivo:** `src/components/PBtn.vue`

### PInput

Campo de entrada de texto con etiqueta, placeholder y estado de error.

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | Valor vinculado (v-model) |
| `label` | `string` | `''` | Etiqueta del campo |
| `placeholder` | `string` | `''` | Texto de marcador |
| `disabled` | `boolean` | `false` | Estado deshabilitado |
| `error` | `string` | `''` | Mensaje de error (se muestra si no está vacío) |
| `type` | `'text' \| 'email' \| 'number' \| 'password' \| 'search'` | `'text'` | Tipo de input HTML |

**Eventos:**
- `update:modelValue` — Emitido al cambiar el valor
- `input` — Emitido en cada entrada de teclado
- `focus` — Emitido al ganar foco
- `blur` — Emitido al perder foco

**Archivo:** `src/components/PInput.vue`

### PBadge

Insignica de estado con variantes semánticas.

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'default' \| 'disponible' \| 'ocupada' \| 'pendiente' \| 'exito' \| 'error' \| 'info' \| 'advertencia'` | `'default'` | Variante de color |
| `label` | `string` | `''` | Texto a mostrar |
| `size` | `'sm' \| 'md'` | `'md'` | Tamaño |

**Archivo:** `src/components/PBadge.vue`

### PCard

Contenedor de tarjeta con opciones de relleno, borde y elevación.

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Relleno interno |
| `bordered` | `boolean` | `false` | Mostrar borde |
| `elevated` | `boolean` | `false` | Sombra elevada |

**Archivo:** `src/components/PCard.vue`

### PQuantityControl

Control de cantidad con botones de incremento/decremento e input numérico.

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `modelValue` | `number` | — | Valor actual (v-model) |
| `min` | `number` | `1` | Valor mínimo |
| `max` | `number` | `99` | Valor máximo |
| `step` | `number` | `1` | Paso de incremento |
| `disabled` | `boolean` | `false` | Estado deshabilitado |

**Eventos:**
- `update:modelValue` — Emitido al cambiar la cantidad

**Archivo:** `src/components/PQuantityControl.vue`

### PModal

Modal con soporte para transiciones GSAP Flip desde elementos de origen.

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `modeloValor` | `boolean` | `false` | Estado abierto/cerrado |
| `titulo` | `string` | `''` | Título del modal |
| `mostrarCerrar` | `boolean` | `true` | Mostrar botón de cerrar |
| `cerrarEnFondo` | `boolean` | `true` | Cerrar al hacer clic en el fondo |
| `reducido` | `boolean` | `false` | Modo sin animaciones (prefers-reduced-motion) |
| `ancho` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'completo'` | `'md'` | Ancho del modal |
| `origen` | `HTMLElement \| null` | `null` | Elemento origen para transición Flip |

**Eventos:**
- `actualiza:modeloValor` — Emitido al abrir/cerrar
- `cerrar` — Emitido al cerrar (Escape, botón, fondo)
- `abrir` — Emitido al abrir

**Características clave:**
- Transición GSAP Flip desde elemento origen (tarjeta → modal)
- Fondo con backdrop-filter blur
- Bloqueo de scroll del body cuando está abierto
- Cierre con tecla Escape
- Gestión de foco (abrir: foco en botón cerrar; cerrar: devolver foco al origen)
- Limpieza automática de animaciones con `gsap.context()` y `onUnmounted`

**Archivo:** `src/components/PModal.vue`

### PEmptyState

Estado vacío con ícono, título, subtítulo y botón de acción opcional.

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `title` | `string` | `'No hay datos'` | Título principal |
| `subtitle` | `string` | `''` | Texto secundario |
| `icon` | `string` | `'📭'` | Ícono emoji |
| `accent` | `'info' \| 'exito' \| 'advertencia' \| 'error'` | `'info'` | Color de acento |
| `actionLabel` | `string` | `''` | Etiqueta del botón de acción |
| `action` | `() => void` | — | Función de acción del botón |

**Archivo:** `src/components/PEmptyState.vue`

### PLoading

Indicador de carga con spinner y mensaje.

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `message` | `string` | `'Cargando...'` | Mensaje de carga |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del spinner |

**Archivo:** `src/components/PLoading.vue`

### PNotification

Notificación temporal con auto-cierre y botón de cierre manual.

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `tipo` | `'exito' \| 'error' \| 'info'` | — | Tipo de notificación |
| `mensaje` | `string` | — | Texto de la notificación |
| `duracion` | `number` | `4000` | Duración en ms antes de auto-cerrar (0 = sin auto-cierre) |
| `onCerrar` | `() => void` | — | Callback al cerrar |

**Eventos:**
- `cerrar` — Emitido cuando se cierra la notificación

**Archivo:** `src/components/PNotification.vue`

### PPriceSummary

Resumen de precios con subtotal, descuento opcional y total.

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `subtotal` | `number` | — | Subtotal en centavos |
| `descuento` | `number` | `0` | Descuento en centavos |
| `total` | `number` | — | Total en centavos |
| `items` | `number` | `0` | Cantidad de ítems |

**Archivo:** `src/components/PPriceSummary.vue`

## Componentes de layout

### DefaultLayout

Layout principal de la aplicación con navbar fija y área de contenido con router-view.

**Elementos:**
- Navbar con marca (Buen Gusto), navegación principal y acciones (Cocina, Caja)
- Área de contenido con transición de desvanecimiento entre vistas
- Responsive: navegación oculta en móviles (< 768px)

**Archivo:** `src/layouts/DefaultLayout.vue`

## Pantallas (vistas)

| Vista | Ruta | Descripción |
|-------|------|-------------|
| `DashboardView` | `/` | Salón con grid de mesas, resumen del servicio y modales de detalle |
| `MesaDetailView` | `/mesas/:id` | Detalle de mesa con lista de platos, resumen de precio y acciones |
| `CatalogoView` | `/catalogo` | Catálogo de almuerzos con filtros por modalidad |
| `PreciosView` | `/precios` | Administración de modalidades y tarifas (prototipo visual) |
| `CocinaView` | `/cocina` | Vista de cocina con comandas por estado |
| `CajaView` | `/caja` | Panel de caja con cuentas pendientes de cobro |

## Datos ficticios

Los datos de demostración están centralizados en `src/stores/demo.ts` mediante Pinia. Incluyen:

- `platos` — Catálogo de platos con configuración completa
- `mesas` — Mesas con estado, comensales y platos asociados
- `modalidades` — Tarifas y modalidades de almuerzo
- `comandas` — Comandas enviadas a cocina

Todos los datos están marcados explícitamente como ficticios y no se conectan a ningún backend.

## Estado de animación

El estado de apertura de modales es gestionado por el store de Pinia (`demo.store`), específicamente por `modalAbierta` que contiene el tipo, ID y elemento origen de la transición Flip.
