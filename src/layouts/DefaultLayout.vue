<script setup lang="ts">
import { useRoute } from 'vue-router';
import PBtn from '@/components/PBtn.vue';

const route = useRoute();

const itemsNav = [
  { nombre: 'dashboard', label: 'Mesas', ruta: '/' },
  { nombre: 'catalogo', label: 'Catálogo', ruta: '/catalogo' },
  { nombre: 'precios', label: 'Precios', ruta: '/precios' },
  { nombre: 'precios-admin', label: 'Administrar Precios', ruta: '/precios/admin' },
  { nombre: 'precios-cotizador', label: 'Cotizador', ruta: '/precios/cotizador' },
];

const enlaceActivo = (nombre: string) => route.name === nombre;
</script>

<template>
  <div class="p-layout">
    <nav class="p-layout__navbar">
      <div class="p-layout__brand">
        <span class="p-layout__brand-icon">🍽️</span>
        <span class="p-layout__brand-text">Buen Gusto</span>
      </div>

      <div class="p-layout__nav">
        <router-link
          v-for="(item, index) in itemsNav"
          :key="index"
          :to="item.ruta"
          class="p-layout__nav-link"
          :class="{ 'p-layout__nav-link--activo': enlaceActivo(item.nombre) }"
        >
          {{ item.label }}
        </router-link>
      </div>

      <div class="p-layout__acciones">
        <PBtn variant="fantasma" size="sm" @click="$router.push({ name: 'cocina' })"> Cocina </PBtn>
        <PBtn variant="primario" size="sm" @click="$router.push({ name: 'caja' })"> Caja </PBtn>
      </div>
    </nav>

    <main class="p-layout__main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" class="p-layout__view" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.p-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.p-layout__navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  background-color: var(--color-bg-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.p-layout__brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.p-layout__brand-icon {
  font-size: var(--text-2xl);
}

.p-layout__nav {
  display: flex;
  gap: var(--space-1);
}

.p-layout__nav-link {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard);
}

.p-layout__nav-link:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-surface-alt);
}

.p-layout__nav-link--activo {
  color: var(--color-accent);
  background-color: var(--color-accent-light);
}

.p-layout__acciones {
  display: flex;
  gap: var(--space-2);
}

.p-layout__main {
  flex: 1;
  padding: var(--space-6);
  overflow-x: auto;
}

.p-layout__view {
  animation: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal) var(--ease-standard);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .p-layout__navbar {
    padding: var(--space-3) var(--space-4);
  }

  .p-layout__nav {
    display: none;
  }

  .p-layout__main {
    padding: var(--space-4);
  }
}
</style>
