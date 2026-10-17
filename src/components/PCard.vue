<script setup lang="ts">
import { computed } from 'vue';
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  elevated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  bordered: false,
  elevated: false,
});

const clasesCard = computed(() => [
  'p-card',
  `p-card--${props.padding}`,
  { 'p-card--bordered': props.bordered, 'p-card--elevated': props.elevated },
]);
</script>

<template>
  <div class="p-card" :class="clasesCard">
    <slot />
  </div>
</template>

<style scoped>
.p-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  transition:
    box-shadow var(--duration-normal) var(--ease-standard),
    border-color var(--duration-normal) var(--ease-standard);
}

.p-card--none {
  padding: 0;
}

.p-card--sm {
  padding: var(--space-3);
}

.p-card--md {
  padding: var(--space-4);
}

.p-card--lg {
  padding: var(--space-6);
}

.p-card--bordered {
  border-color: var(--color-border);
}

.p-card--elevated {
  box-shadow: var(--shadow-md);
}

.p-card--elevated:hover {
  box-shadow: var(--shadow-lg);
}
</style>
