<script setup lang="ts">
interface Props {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Cargando...',
  size: 'md',
});
</script>

<template>
  <div class="p-loading" :class="`p-loading--${props.size}`" role="status" aria-live="polite">
    <div class="p-loading__spinner" aria-hidden="true"></div>
    <span class="p-loading__message">{{ props.message }}</span>
  </div>
</template>

<style scoped>
.p-loading {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-text-secondary);
}

.p-loading__spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

.p-loading__message {
  font-size: var(--text-sm);
}

.p-loading--sm .p-loading__spinner {
  width: 1rem;
  height: 1rem;
}

.p-loading--lg .p-loading__spinner {
  width: 2rem;
  height: 2rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
