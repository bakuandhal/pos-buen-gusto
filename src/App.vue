<script setup lang="ts">
import { useDemoStore } from '@/stores/demo';
import PNotification from '@/components/PNotification.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

const store = useDemoStore();
</script>

<template>
  <DefaultLayout>
    <transition-group name="lista-notificaciones" tag="div" class="notificaciones">
      <PNotification
        v-for="notificacion in store.notificaciones"
        :key="notificacion.id"
        :tipo="notificacion.tipo"
        :mensaje="notificacion.mensaje"
        :duracion="notificacion.duracion"
        @cerrar="
          store.notificaciones = store.notificaciones.filter((n) => n.id !== notificacion.id)
        "
      />
    </transition-group>
  </DefaultLayout>
</template>

<style scoped>
.notificaciones {
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  z-index: var(--z-popover);
  pointer-events: none;
}

.lista-notificaciones-enter-active,
.lista-notificaciones-leave-active {
  transition: all 0.3s ease;
}

.lista-notificaciones-enter-from,
.lista-notificaciones-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
