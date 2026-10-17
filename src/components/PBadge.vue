<script setup lang="ts">
import { computed } from 'vue';
interface Props {
  variant?:
    'default' | 'disponible' | 'ocupada' | 'pendiente' | 'exito' | 'error' | 'info' | 'advertencia';
  label?: string;
  size?: 'sm' | 'md';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  label: '',
  size: 'md',
});

const claseVariante = computed(() => {
  const map: Record<string, string> = {
    disponible: 'p-badge--disponible',
    ocupada: 'p-badge--ocupada',
    pendiente: 'p-badge--pendiente',
    exito: 'p-badge--exito',
    error: 'p-badge--error',
    info: 'p-badge--info',
    advertencia: 'p-badge--advertencia',
  };
  return `p-badge ${map[props.variant] || ''}`;
});
</script>

<template>
  <span class="p-badge" :class="claseVariante">
    {{ props.label || props.variant }}
  </span>
</template>

<style scoped>
.p-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.p-badge--default {
  background-color: var(--color-bg-surface-alt);
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
}

.p-badge--disponible {
  background-color: var(--color-success-light);
  color: var(--color-success);
}

.p-badge--ocupada {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}

.p-badge--pendiente {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}

.p-badge--exito {
  background-color: var(--color-success-light);
  color: var(--color-success);
}

.p-badge--error {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}

.p-badge--info {
  background-color: var(--color-info-light);
  color: var(--color-info);
}

.p-badge--advertencia {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}
</style>
