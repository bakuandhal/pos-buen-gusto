<script setup lang="ts">
import { computed } from 'vue';
interface Props {
  modelValue: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  type?: 'text' | 'email' | 'number' | 'password' | 'search';
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  disabled: false,
  error: '',
  type: 'text',
});

const emit = defineEmits(['update:modelValue', 'input', 'focus', 'blur']);

const clasesInput = computed(() => ({
  'p-input__field': true,
  'p-input__field--error': Boolean(props.error),
}));
</script>

<template>
  <div class="p-input">
    <label v-if="label" class="p-input__label">{{ label }}</label>
    <input
      :type="props.type"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :aria-invalid="Boolean(props.error)"
      class="p-input__field"
      :class="clasesInput"
      @input="
        emit('update:modelValue', (($event.target as HTMLInputElement) ?? { value: '' }).value)
      "
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
    <p v-if="props.error" class="p-input__error">{{ props.error }}</p>
  </div>
</template>

<style scoped>
.p-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.p-input__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.p-input__field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  transition:
    border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}

.p-input__field:focus {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(201, 138, 47, 0.15);
}

.p-input__field::placeholder {
  color: var(--color-text-muted);
}

.p-input__field--error {
  border-color: var(--color-danger);
}

.p-input__field--error:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(166, 61, 61, 0.15);
}

.p-input__error {
  font-size: var(--text-xs);
  color: var(--color-danger);
  margin: 0;
}
</style>
