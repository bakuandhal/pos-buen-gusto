# Sistema de Diseño — POS Buen Gusto

## Visión general

El sistema de diseño define los tokens visuales y las reglas de estilo que garantizan una identidad consistente en todas las pantallas del POS: salón, catálogo, precios, cocina y caja. Está construido sobre CSS custom properties (variables de CSS) y constantes de TypeScript para animaciones.

## Tokens de diseño

Los tokens están definidos en `src/styles/tokens.css` y se agrupan en las siguientes categorías:

### Colores

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-bg-primary` | `#fafaf7` | Fondo principal de la aplicación |
| `--color-bg-surface` | `#ffffff` | Superficies de tarjetas y paneles |
| `--color-bg-surface-alt` | `#f5f3ef` | Superficies secundarias y alternadas |
| `--color-bg-inverse` | `#1a1816` | Fondos oscuros |
| `--color-bg-panel` | `#f2f0eb` | Paneles de información |
| `--color-text-primary` | `#1a1816` | Texto principal |
| `--color-text-secondary` | `#5c5750` | Texto secundario |
| `--color-text-muted` | `#8c867e` | Texto auxiliar y placeholders |
| `--color-text-inverse` | `#fafaf7` | Texto sobre fondos oscuros |
| `--color-accent` | `#c98a2f` | Color de acento principal (primarios) |
| `--color-accent-hover` | `#b57a25` | Hover de elementos primarios |
| `--color-accent-light` | `#f6efe0` | Fondo claro de acento |
| `--color-success` | `#4a7c59` | Estados de éxito |
| `--color-success-light` | `#eef5f0` | Fondo claro de éxito |
| `--color-warning` | `#b57a25` | Estados de advertencia |
| `--color-warning-light` | `#f7efe0` | Fondo claro de advertencia |
| `--color-danger` | `#a63d3d` | Estados de error/peligro |
| `--color-danger-light` | `#f7ecec` | Fondo claro de error |
| `--color-info` | `#5b7a8c` | Estados informativos |
| `--color-info-light` | `#eef2f5` | Fondo claro de información |
| `--color-border` | `#e3ded5` | Bordes de componentes |
| `--color-border-focus` | `#c98a2f` | Borde en estado de foco |

### Tipografía

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-sans` | Inter, system-ui, sans-serif | Fuente principal |
| `--font-mono` | ui-monospace, monospace | Fuente monoespaciada |
| `--text-xs` | 0.75rem (12px) | Texto auxiliar, badges |
| `--text-sm` | 0.875rem (14px) | Texto pequeño, etiquetas |
| `--text-base` | 1rem (16px) | Texto corporal |
| `--text-lg` | 1.125rem (18px) | Títulos pequeños |
| `--text-xl` | 1.25rem (20px) | Títulos medios |
| `--text-2xl` | 1.5rem (24px) | Títulos grandes |
| `--text-3xl` | 1.875rem (30px) | Títulos principales |
| `--font-weight-regular` | 400 | Peso normal |
| `--font-weight-medium` | 500 | Peso medio |
| `--font-weight-semibold` | 600 | Peso semibold |
| `--font-weight-bold` | 700 | Peso negrita |
| `--line-height-tight` | 1.25 | Altura de línea ajustada |
| `--line-height-normal` | 1.5 | Altura de línea normal |
| `--line-height-relaxed` | 1.75 | Altura de línea relajada |

### Espaciado

| Token | Valor | Uso |
|-------|-------|-----|
| `--space-1` | 0.25rem (4px) | Espaciado mínimo |
| `--space-2` | 0.5rem (8px) | Espaciado entre elementos pequeños |
| `--space-3` | 0.75rem (12px) | Espaciado interno de componentes |
| `--space-4` | 1rem (16px) | Espaciado estándar |
| `--space-5` | 1.25rem (20px) | Espaciado de secciones |
| `--space-6` | 1.5rem (24px) | Espaciado de pantallas |
| `--space-8` | 2rem (32px) | Espaciado grande |
| `--space-10` | 2.5rem (40px) | Espaciado de secciones principales |
| `--space-12` | 3rem (48px) | Espaciado de secciones hero |

### Radios y bordes

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | 6px | Bordes de inputs y badges |
| `--radius-md` | 10px | Bordes de botones y tarjetas |
| `--radius-lg` | 14px | Bordes de modales y paneles |
| `--radius-full` | 9999px | Bordes circulares |
| `--border-width` | 1px | Grosor de borde estándar |

### Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `--shadow-sm` | 0 1px 2px 0 rgb(0 0 0 / 0.05) | Sombra sutil |
| `--shadow-md` | 0 4px 6px -1px rgb(0 0 0 / 0.08) | Sombra de tarjetas |
| `--shadow-lg` | 0 10px 15px -3px rgb(0 0 0 / 0.08) | Sombra de paneles elevados |
| `--shadow-modal` | 0 20px 25px -5px rgb(0 0 0 / 0.12) | Sombra de modales |

### Capas (z-index)

| Token | Valor | Uso |
|-------|-------|-----|
| `--z-dropdown` | 100 | Menús desplegables |
| `--z-sticky` | 200 | Elementos adhesivos (navbar) |
| `--z-modal-backdrop` | 300 | Fondo de modales |
| `--z-modal` | 400 | Contenido de modales |
| `--z-popover` | 500 | Notificaciones, tooltips |

### Duraciones y curvas de animación

| Token | Valor | Uso |
|-------|-------|-----|
| `--duration-fast` | 0.2s | Transiciones rápidas |
| `--duration-normal` | 0.35s | Transiciones estándar |
| `--duration-slow` | 0.5s | Transiciones lentas |
| `--ease-standard` | cubic-bezier(0.4, 0, 0.2, 1) | Curva estándar |
| `--ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Curva tipo resorte |
| `--ease-flip` | power2.inOut | Curva para GSAP Flip |

### Breakpoints

| Token | Valor | Uso |
|-------|-------|-----|
| `--bp-mobile` | 480px | Dispositivos móviles |
| `--bp-tablet` | 768px | Tablets |
| `--bp-desktop` | 1024px | Escritorio |

## Preferencia de movimiento reducido

El sistema respeta `prefers-reduced-motion: reduce`. Cuando está activo, todas las duraciones de animación se reducen a 0.01s y se desactivan las transiciones de transform y opacidad que no sean estrictamente necesarias.

## Uso en componentes

Los tokens se consumen directamente desde CSS:

```css
.mi-componente {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-primary);
}
```

Y desde JavaScript/TypeScript para valores de animación:

```typescript
import { ANIMATION_DURATION, ANIMATION_EASE } from "@/styles/animations";

gsap.to(elemento, {
  opacity: 1,
  duration: ANIMATION_DURATION.normal,
  ease: ANIMATION_EASE.standard,
});
```

## Componentes del sistema de diseño

Los componentes implementados se documentan en `docs/UI_COMPONENTS.md`.
