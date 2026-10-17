<script setup lang="ts">
interface Props {
  title?: string;
  subtitle?: string;
  icon?: string;
  accent?: 'info' | 'exito' | 'advertencia' | 'error';
  actionLabel?: string;
  action?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'No hay datos',
  subtitle: '',
  icon: '',
  accent: 'info',
  actionLabel: '',
});
</script>

<template>
  <div class="p-empty-state" :class="`p-empty-state--${props.accent}`">
    <div class="p-empty-state__icon" aria-hidden="true">
      {{ props.icon || '📭' }}
    </div>
    <h3 class="p-empty-state__title">{{ props.title }}</h3>
    <p v-if="props.subtitle" class="p-empty-state__subtitle">
      {{ props.subtitle }}
    </p>
    <button
      v-if="props.actionLabel && props.action"
      class="p-btn p-btn--primario p-btn--sm"
      @click="props.action"
    >
      {{ props.actionLabel }}
    </button>
  </div>
</template>

<style scoped>
.p-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-12) var(--space-6);
  color: var(--color-text-secondary);
}

.p-empty-state__icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

.p-empty-state__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
}

.p-empty-state__subtitle {
  font-size: var(--text-base);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-6) 0;
  max-width: 32rem;
}

.p-empty-state--info {
  color: var(--color-info);
}

.p-empty-state--exito {
  color: var(--color-success);
}

.p-empty-state--advertencia {
  color: var(--color-warning);
}

.p-empty-state--error {
  color: var(--color-danger);
}
</style>
