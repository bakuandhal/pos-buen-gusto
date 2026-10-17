<script setup lang="ts">
import { computed } from 'vue';
interface Props {
  variant?: 'primario' | 'secundario' | 'fantasma' | 'peligro';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  tipo?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primario',
  size: 'md',
  disabled: false,
  loading: false,
  tipo: 'button',
});

const clasesBtn = computed(() => [
  'p-btn',
  `p-btn--${props.variant}`,
  `p-btn--${props.size}`,
  { 'p-btn--loading': props.loading, 'p-btn--disabled': props.disabled },
]);
</script>

<template>
  <button
    :type="props.tipo"
    :disabled="props.disabled || props.loading"
    class="p-btn"
    :class="clasesBtn"
    @click="$emit('click', $event)"
  >
    <span v-if="props.loading" class="p-btn__spinner"></span>
    <span v-else class="p-btn__label"><slot /></span>
  </button>
</template>

<style scoped>
.p-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  border: var(--border-width) solid transparent;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
  cursor: pointer;
  outline: none;
  white-space: nowrap;
}

.p-btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(201, 138, 47, 0.3);
}

.p-btn:not(:disabled):hover:not(.p-btn--loading) {
  filter: brightness(1.05);
}

.p-btn--disabled,
.p-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.p-btn__spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

.p-btn__label {
  line-height: 1;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.p-btn--primario {
  background-color: var(--color-accent);
  color: var(--color-text-inverse);
}

.p-btn--primario:not(:disabled):hover:not(.p-btn--loading) {
  background-color: var(--color-accent-hover);
}

.p-btn--secundario {
  background-color: var(--color-bg-surface-alt);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.p-btn--secundario:not(:disabled):hover:not(.p-btn--loading) {
  background-color: var(--color-border);
}

.p-btn--fantasma {
  background-color: transparent;
  color: var(--color-text-secondary);
}

.p-btn--fantasma:not(:disabled):hover:not(.p-btn--loading) {
  background-color: var(--color-bg-surface-alt);
  color: var(--color-text-primary);
}

.p-btn--peligro {
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
}

.p-btn--peligro:not(:disabled):hover:not(.p-btn--loading) {
  background-color: #8c3131;
}

.p-btn--sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  border-radius: var(--radius-sm);
}

.p-btn--md {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
}

.p-btn--lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-lg);
  border-radius: var(--radius-lg);
}

.p-btn--full {
  width: 100%;
}
</style>
