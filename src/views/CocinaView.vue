<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDemoStore } from '@/stores/demo';
import PBadge from '@/components/PBadge.vue';
import PBtn from '@/components/PBtn.vue';

const store = useDemoStore();

const filtroEstado = ref<string>('todos');

const comandasFiltradas = computed(() => {
  if (filtroEstado.value === 'todos') return store.comandas;
  return store.comandas.filter((c: { estado: string }) => c.estado === filtroEstado.value);
});
</script>

<template>
  <div class="cocina">
    <header class="cocina__header">
      <h1>Cocina</h1>
      <p>Comandas activas</p>
    </header>

    <div class="cocina__filtros">
      <PBtn
        variant="fantasma"
        size="sm"
        :class="{ 'p-btn--activo': filtroEstado === 'todos' }"
        @click="filtroEstado = 'todos'"
      >
        Todas
      </PBtn>
      <PBtn
        variant="fantasma"
        size="sm"
        :class="{ 'p-btn--activo': filtroEstado === 'confirmado' }"
        @click="filtroEstado = 'confirmado'"
      >
        Confirmadas
      </PBtn>
      <PBtn
        variant="fantasma"
        size="sm"
        :class="{ 'p-btn--activo': filtroEstado === 'en_cocina' }"
        @click="filtroEstado = 'en_cocina'"
      >
        En cocina
      </PBtn>
      <PBtn
        variant="fantasma"
        size="sm"
        :class="{ 'p-btn--activo': filtroEstado === 'servido' }"
        @click="filtroEstado = 'servido'"
      >
        Servidas
      </PBtn>
    </div>

    <div class="cocina__grid">
      <div v-for="comanda in comandasFiltradas" :key="comanda.id" class="cocina__comanda">
        <div class="cocina__comanda-header">
          <div class="cocina__comanda-id">Comanda {{ comanda.id }}</div>
          <div class="cocina__comanda-hora">{{ comanda.horaCreacion }}</div>
        </div>
        <div class="cocina__comanda-mesa">
          <PBadge variant="info" :label="`Mesa ${comanda.mesaNumero}`" />
        </div>
        <div class="cocina__comanda-platos">
          <div v-for="plato in comanda.platos" :key="plato.id" class="cocina__comanda-plato">
            <span class="cocina__comanda-cantidad">×{{ plato.cantidad }}</span>
            <span class="cocina__comanda-plato-nombre">
              {{ plato.nombre }}
            </span>
            <div class="cocina__comanda-plato-config">
              {{ plato.configuracion.modalidad }} · {{ plato.configuracion.sopa }} ·
              {{ plato.configuracion.proteina }}
            </div>
          </div>
        </div>
        <div class="cocina__comanda-estado">
          <PBadge
            :variant="
              comanda.estado === 'en_cocina'
                ? 'ocupada'
                : comanda.estado === 'confirmado'
                  ? 'pendiente'
                  : comanda.estado === 'servido'
                    ? 'disponible'
                    : 'error'
            "
            :label="comanda.estado"
          />
        </div>
        <div class="cocina__comanda-acciones">
          <PBtn
            variant="primario"
            size="sm"
            @click="store.cambiarEstadoComanda(comanda.id, 'en_cocina')"
          >
            En cocina
          </PBtn>
          <PBtn
            variant="secundario"
            size="sm"
            @click="store.cambiarEstadoComanda(comanda.id, 'servido')"
          >
            Servida
          </PBtn>
        </div>
      </div>

      <div v-if="comandasFiltradas.length === 0" class="cocina__vacio">
        <p>No hay comandas en este estado.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cocina {
  max-width: 1200px;
  margin: 0 auto;
}

.cocina__header {
  margin-bottom: var(--space-8);
}

.cocina__header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
}

.cocina__header p {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.cocina__filtros {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.p-btn--activo {
  background-color: var(--color-accent);
  color: var(--color-text-inverse);
}

.cocina__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--space-5);
}

.cocina__comanda {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition:
    box-shadow var(--duration-normal) var(--ease-standard),
    border-color var(--duration-normal) var(--ease-standard);
}

.cocina__comanda:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent);
}

.cocina__comanda-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cocina__comanda-id {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.cocina__comanda-hora {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.cocina__comanda-mesa {
  display: flex;
  justify-content: flex-start;
}

.cocina__comanda-platos {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  border-top: var(--border-width) solid var(--color-border);
  border-bottom: var(--border-width) solid var(--color-border);
  padding: var(--space-3) 0;
}

.cocina__comanda-plato {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.cocina__comanda-cantidad {
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
}

.cocina__comanda-plato-nombre {
  flex: 1;
  font-weight: var(--font-weight-medium);
}

.cocina__comanda-plato-config {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.cocina__comanda-estado {
  display: flex;
  justify-content: flex-start;
}

.cocina__comanda-acciones {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-3);
  border-top: var(--border-width) solid var(--color-border);
}

.cocina__vacio {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
  color: var(--color-text-muted);
}
</style>
