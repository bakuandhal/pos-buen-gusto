<script setup lang="ts">
import { computed, onMounted } from 'vue';

interface Props {
  tipo: 'exito' | 'error' | 'info';
  mensaje: string;
  duracion?: number;
  onCerrar?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  duracion: 4000,
});

const emit = defineEmits(['cerrar']);

const icono = computed(() => {
  switch (props.tipo) {
    case 'exito':
      return '✓';
    case 'error':
      return '✕';
    default:
      return 'ℹ';
  }
});

function cerrar() {
  if (props.onCerrar) props.onCerrar();
  emit('cerrar');
}

onMounted(() => {
  if (props.duracion > 0) {
    setTimeout(cerrar, props.duracion);
  }
});
</script>

<template>
  <div
    class="p-notification"
    :class="`p-notification--${props.tipo}`"
    role="alert"
    aria-live="polite"
  >
    <span class="p-notification__icon" aria-hidden="true">{{ icono }}</span>
    <span class="p-notification__mensaje">{{ props.mensaje }}</span>
    <button
      type="button"
      class="p-notification__cerrar"
      @click="cerrar"
      aria-label="Cerrar notificación"
    >
      ✕
    </button>
  </div>
</template>

<style scoped>
.p-notification {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: var(--border-width) solid transparent;
  box-shadow: var(--shadow-md);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  min-width: 20rem;
  z-index: var(--z-popover);
  animation: slideIn var(--duration-normal) var(--ease-standard);
}

.p-notification--exito {
  background-color: var(--color-success-light);
  color: var(--color-success);
  border-color: var(--color-success);
}

.p-notification--error {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.p-notification--info {
  background-color: var(--color-info-light);
  color: var(--color-info);
  border-color: var(--color-info);
}

.p-notification__icon {
  font-size: var(--text-lg);
  flex-shrink: 0;
}

.p-notification__mensaje {
  flex: 1;
}

.p-notification__cerrar {
  background: none;
  border: none;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  font-size: var(--text-lg);
  line-height: 1;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
}

.p-notification__cerrar:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
