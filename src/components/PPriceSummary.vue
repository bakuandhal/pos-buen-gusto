<script setup lang="ts">
import { useDemoStore } from '@/stores/demo';

interface Props {
  subtotal: number;
  descuento?: number;
  total: number;
  items?: number;
}

const props = withDefaults(defineProps<Props>(), {
  descuento: 0,
  items: 0,
});

const store = useDemoStore();
</script>

<template>
  <div class="p-price-summary">
    <div class="p-price-summary__row">
      <span class="p-price-summary__label">Subtotal</span>
      <span class="p-price-summary__value">{{ store.formatearMoneda(props.subtotal) }}</span>
    </div>
    <div v-if="props.descuento > 0" class="p-price-summary__row p-price-summary__row--descuento">
      <span class="p-price-summary__label">Descuento</span>
      <span class="p-price-summary__value p-price-summary__value--descuento">
        −{{ store.formatearMoneda(props.descuento) }}
      </span>
    </div>
    <div class="p-price-summary__row p-price-summary__row--total">
      <span class="p-price-summary__label">Total</span>
      <span class="p-price-summary__value p-price-summary__value--total">
        {{ store.formatearMoneda(props.total) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.p-price-summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.p-price-summary__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: var(--text-base);
}

.p-price-summary__row--total {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  padding-top: var(--space-3);
  border-top: var(--border-width) solid var(--color-border);
}

.p-price-summary__label {
  color: var(--color-text-secondary);
}

.p-price-summary__value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.p-price-summary__value--descuento {
  color: var(--color-success);
}

.p-price-summary__value--total {
  color: var(--color-accent);
}
</style>
