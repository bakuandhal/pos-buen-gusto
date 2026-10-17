<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDemoStore } from '@/stores/demo';
import PBtn from '@/components/PBtn.vue';
import PBadge from '@/components/PBadge.vue';
import PEmptyState from '@/components/PEmptyState.vue';

const store = useDemoStore();

const filtroModalidad = ref<string>('todos');

const platosFiltrados = computed(() => {
  if (filtroModalidad.value === 'todos') return store.platosDisponibles;
  return store.platosDisponibles.filter(
    (p: { modalidad: string }) => p.modalidad === filtroModalidad.value
  );
});
</script>

<template>
  <div class="catalogo">
    <header class="catalogo__header">
      <h1>Catálogo de almuerzos</h1>
      <p>Selecciona un plato para ver sus opciones</p>
    </header>

    <div class="catalogo__filtros">
      <PBtn
        variant="fantasma"
        size="sm"
        :class="{ 'p-btn--activo': filtroModalidad === 'todos' }"
        @click="filtroModalidad = 'todos'"
      >
        Todos
      </PBtn>
      <PBtn
        variant="fantasma"
        size="sm"
        :class="{ 'p-btn--activo': filtroModalidad === 'en_mesa' }"
        @click="filtroModalidad = 'en_mesa'"
      >
        En mesa
      </PBtn>
      <PBtn
        variant="fantasma"
        size="sm"
        :class="{ 'p-btn--activo': filtroModalidad === 'para_llevar' }"
        @click="filtroModalidad = 'para_llevar'"
      >
        Para llevar
      </PBtn>
    </div>

    <div class="catalogo__grid">
      <div v-for="plato in platosFiltrados" :key="plato.id" class="catalogo__plato-card">
        <div class="catalogo__plato-imagen">
          {{ plato.imagen || '🍽️' }}
        </div>
        <div class="catalogo__plato-info">
          <h3 class="catalogo__plato-nombre">{{ plato.nombre }}</h3>
          <p class="catalogo__plato-descripcion">{{ plato.descripcion }}</p>
          <div class="catalogo__plato-config">
            <span>{{ plato.modalidad }}</span>
            <span>{{ plato.sopa }}</span>
            <span>{{ plato.proteina }}</span>
          </div>
          <PBadge
            :variant="plato.disponible ? 'disponible' : 'error'"
            :label="plato.disponible ? 'Disponible' : 'No disponible'"
          />
          <div class="catalogo__plato-precio">
            {{ store.formatearMoneda(plato.precioBase) }}
          </div>
          <PBtn
            variant="primario"
            size="sm"
            @click="$router.push({ name: 'mesa-detalle', params: { id: 'mesa-1' } })"
          >
            Agregar a pedido
          </PBtn>
        </div>
      </div>
    </div>

    <div v-if="platosFiltrados.length === 0" class="catalogo__vacio">
      <PEmptyState
        title="No se encontraron platos"
        subtitle="Intenta ajustar los filtros de búsqueda."
        icon="🔍"
      />
    </div>
  </div>
</template>

<style scoped>
.catalogo {
  max-width: 1200px;
  margin: 0 auto;
}

.catalogo__header {
  margin-bottom: var(--space-8);
}

.catalogo__header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
}

.catalogo__header p {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.catalogo__filtros {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.p-btn--activo {
  background-color: var(--color-accent);
  color: var(--color-text-inverse);
}

.catalogo__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-5);
}

.catalogo__plato-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition:
    box-shadow var(--duration-normal) var(--ease-standard),
    border-color var(--duration-normal) var(--ease-standard);
}

.catalogo__plato-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent);
}

.catalogo__plato-imagen {
  width: 100%;
  height: 12rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background-color: var(--color-bg-surface-alt);
  border-bottom: var(--border-width) solid var(--color-border);
}

.catalogo__plato-info {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}

.catalogo__plato-nombre {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.catalogo__plato-descripcion {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
  flex: 1;
}

.catalogo__plato-config {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
}

.catalogo__plato-config span {
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-bg-surface-alt);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
}

.catalogo__plato-precio {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
  margin-top: auto;
}

.catalogo__vacio {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}
</style>
