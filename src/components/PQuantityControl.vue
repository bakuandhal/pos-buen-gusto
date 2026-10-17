<script setup lang="ts">
import { withDefaults } from 'vue';

interface Props {
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  min: 1,
  max: 99,
  step: 1,
  disabled: false,
});

const emit = defineEmits(['update:modelValue']);

function decrementar() {
  if (props.disabled || props.modelValue <= props.min) return;
  emit('update:modelValue', Math.max(props.min, props.modelValue - props.step));
}

function incrementar() {
  if (props.disabled || props.modelValue >= props.max) return;
  emit('update:modelValue', Math.min(props.max, props.modelValue + props.step));
}

function manejarCambio(e: Event) {
  const input = e.target as HTMLInputElement;
  const valor = Number(input?.value || '') || props.min;
  emit('update:modelValue', valor);
}
</script>

<template>
  <div class="p-quantity">
    <button
      type="button"
      class="p-quantity__btn p-quantity__btn--decrement"
      :disabled="props.disabled || props.modelValue <= props.min"
      @click="decrementar"
    >
      −
    </button>
    <input
      type="number"
      :value="props.modelValue"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      :disabled="props.disabled"
      class="p-quantity__input"
      @input="manejarCambio"
    />
    <button
      type="button"
      class="p-quantity__btn p-quantity__btn--increment"
      :disabled="props.disabled || props.modelValue >= props.max"
      @click="incrementar"
    >
      +
    </button>
  </div>
</template>

<style scoped>
.p-quantity {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-surface);
}

.p-quantity__btn {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  background-color: var(--color-bg-surface-alt);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  outline: none;
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.p-quantity__btn:not(:disabled):hover {
  background-color: var(--color-border);
}

.p-quantity__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.p-quantity__btn--decrement {
  border-radius: var(--radius-sm) 0 0 var(--radius-sm);
}

.p-quantity__btn--increment {
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.p-quantity__input {
  width: 3rem;
  height: 2.5rem;
  text-align: center;
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  background-color: transparent;
  border: none;
  outline: none;
}

.p-quantity__input::-webkit-inner-spin-button,
.p-quantity__input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
