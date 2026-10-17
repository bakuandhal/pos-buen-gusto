<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDemoStore } from '@/stores/demo';
import PBtn from '@/components/PBtn.vue';
import PBadge from '@/components/PBadge.vue';
import PModal from '@/components/PModal.vue';

const store = useDemoStore();

const elementoOrigen = ref<HTMLElement | null>(null);

function abrirDetalleMesa(id: string, e: Event, elemento: HTMLElement) {
  e.preventDefault();
  elementoOrigen.value = elemento;
  store.abrirModal('mesa', id, elemento);
}

function cerrarDetalleMesa() {
  store.cerrarModal();
  elementoOrigen.value = null;
}

const mesaSeleccionada = computed(() => {
  if (!store.modalAbierta.id) return null;
  return store.mesas.find((m: { id: string }) => m.id === store.modalAbierta.id);
});
</script>

<template>
  <div class="dashboard">
    <header class="dashboard__header">
      <div class="dashboard__titulo">
        <h1>Salón</h1>
        <p>Estado de las mesas en tiempo real</p>
      </div>
      <div class="dashboard__acciones">
        <PBtn variant="primario" @click="$router.push({ name: 'catalogo' })"> Ver catálogo </PBtn>
      </div>
    </header>

    <div class="dashboard__resumen">
      <div class="dashboard__tarjeta-resumen">
        <span class="dashboard__label">Disponibles</span>
        <span class="dashboard__valor">{{ store.mesasDisponibles.length }}</span>
      </div>
      <div class="dashboard__tarjeta-resumen dashboard__tarjeta-resumen--ocupada">
        <span class="dashboard__label">Ocupadas</span>
        <span class="dashboard__valor">{{ store.mesasOcupadas.length }}</span>
      </div>
      <div class="dashboard__tarjeta-resumen dashboard__tarjeta-resumen--pendiente">
        <span class="dashboard__label">Pendientes</span>
        <span class="dashboard__valor">{{ store.mesasPendientes.length }}</span>
      </div>
      <div class="dashboard__tarjeta-resumen dashboard__tarjeta-resumen--total">
        <span class="dashboard__label">Total servicio</span>
        <span class="dashboard__valor">{{ store.formatearMoneda(store.totalServicio) }}</span>
      </div>
    </div>

    <div class="dashboard__grid">
      <div
        v-for="mesa in store.mesas"
        :key="mesa.id"
        class="dashboard__mesa"
        :class="{
          'dashboard__mesa--disponible': mesa.estado === 'disponible',
          'dashboard__mesa--ocupada': mesa.estado === 'ocupada',
          'dashboard__mesa--pendiente': mesa.estado === 'pendiente',
        }"
        @click="(e: Event) => abrirDetalleMesa(mesa.id, e, e.currentTarget as HTMLElement)"
        role="button"
        tabindex="0"
        @keydown.enter="
          (e: KeyboardEvent) => abrirDetalleMesa(mesa.id, e, e.currentTarget as HTMLElement)
        "
        :aria-label="`Mesa ${mesa.numero}, ${mesa.estado}`"
      >
        <div class="dashboard__mesa-contenido">
          <div class="dashboard__mesa-numero">Mesa {{ mesa.numero }}</div>
          <PBadge :variant="mesa.estado" :label="mesa.estado" />
          <div v-if="mesa.comensales > 0" class="dashboard__mesa-comensales">
            {{ mesa.comensales }} comensal{{ mesa.comensales > 1 ? 'es' : '' }}
          </div>
          <div class="dashboard__mesa-total">
            {{ store.formatearMoneda(mesa.total) }}
          </div>
          <div v-if="mesa.ultimaActualizacion" class="dashboard__mesa-hora">
            {{ mesa.ultimaActualizacion }}
          </div>
          <div class="dashboard__mesa-platos">
            <span v-for="plato in mesa.platos" :key="plato.id" class="dashboard__mesa-plato">
              {{ plato.nombre }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="store.mesas.length === 0" class="dashboard__vacío">
        <PEmptyState
          title="No hay mesas configuradas"
          subtitle="Aún no se han creado mesas en el sistema."
          icon="🍽️"
        />
      </div>
    </div>

    <PModal
      :modeloValor="store.modalAbierta.tipo === 'mesa'"
      :titulo="`Mesa ${mesaSeleccionada?.numero}`"
      :origen="elementoOrigen"
      @update:modeloValor="cerrarDetalleMesa"
      @cerrar="cerrarDetalleMesa"
    >
      <template v-if="mesaSeleccionada">
        <div class="modal-detalle">
          <div class="modal-detalle__info">
            <PBadge :variant="mesaSeleccionada.estado" :label="mesaSeleccionada.estado" />
            <div class="modal-detalle__comensales">
              {{ mesaSeleccionada.comensales }} comensal{{
                mesaSeleccionada.comensales > 1 ? 'es' : ''
              }}
            </div>
          </div>

          <div class="modal-detalle__platos">
            <h3>Platos</h3>
            <div
              v-for="plato in mesaSeleccionada.platos"
              :key="plato.id"
              class="modal-detalle__plato"
            >
              <div class="modal-detalle__plato-nombre">
                {{ plato.nombre }} ×{{ plato.cantidad }}
              </div>
              <div class="modal-detalle__plato-config">
                {{ plato.configuracion.modalidad === 'en_mesa' ? 'En mesa' : 'Para llevar' }} ·
                {{ plato.configuracion.sopa }} ·
                {{ plato.configuracion.proteina }}
              </div>
              <div class="modal-detalle__plato-precio">
                {{ store.formatearMoneda(plato.subtotal) }}
              </div>
              <PBtn
                variant="peligro"
                size="sm"
                @click="store.removerPlatoDeMesa(mesaSeleccionada.id, plato.id)"
              >
                Retirar
              </PBtn>
            </div>
          </div>

          <div class="modal-detalle__acciones">
            <PBtn variant="secundario" size="sm" @click="cerrarDetalleMesa"> Cerrar </PBtn>
            <PBtn variant="primario" size="sm" @click="store.crearComanda(mesaSeleccionada.id)">
              Enviar a cocina
            </PBtn>
          </div>
        </div>
      </template>
    </PModal>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-8);
  gap: var(--space-4);
}

.dashboard__titulo h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
}

.dashboard__titulo p {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.dashboard__acciones {
  display: flex;
  gap: var(--space-2);
}

.dashboard__resumen {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.dashboard__tarjeta-resumen {
  flex: 1;
  padding: var(--space-5);
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.dashboard__tarjeta-resumen--ocupada {
  border-color: var(--color-danger);
  background-color: var(--color-danger-light);
}

.dashboard__tarjeta-resumen--pendiente {
  border-color: var(--color-warning);
  background-color: var(--color-warning-light);
}

.dashboard__tarjeta-resumen--total {
  border-color: var(--color-accent);
  background-color: var(--color-accent-light);
}

.dashboard__label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.dashboard__valor {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.dashboard__tarjeta-resumen--ocupada .dashboard__valor {
  color: var(--color-danger);
}

.dashboard__tarjeta-resumen--pendiente .dashboard__valor {
  color: var(--color-warning);
}

.dashboard__tarjeta-resumen--total .dashboard__valor {
  color: var(--color-accent);
}

.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-5);
}

.dashboard__mesa {
  position: relative;
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  cursor: pointer;
  transition:
    transform var(--duration-normal) var(--ease-standard),
    box-shadow var(--duration-normal) var(--ease-standard),
    border-color var(--duration-normal) var(--ease-standard);
  will-change: transform;
}

.dashboard__mesa:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-focus);
}

.dashboard__mesa:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.dashboard__mesa-contenido {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.dashboard__mesa-numero {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.dashboard__mesa-comensales {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.dashboard__mesa-total {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
}

.dashboard__mesa-hora {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.dashboard__mesa-platos {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-2);
}

.dashboard__mesa-plato {
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
}

.modal-detalle {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.modal-detalle__info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.modal-detalle__comensales {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.modal-detalle__platos h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3) 0;
}

.modal-detalle__plato {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background-color: var(--color-bg-surface-alt);
  border-radius: var(--radius-md);
  gap: var(--space-3);
}

.modal-detalle__plato-nombre {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.modal-detalle__plato-config {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.modal-detalle__plato-precio {
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
}

.modal-detalle__acciones {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: var(--border-width) solid var(--color-border);
}

@media (max-width: 768px) {
  .dashboard__resumen {
    flex-direction: column;
  }

  .dashboard__grid {
    grid-template-columns: 1fr;
  }
}
</style>
