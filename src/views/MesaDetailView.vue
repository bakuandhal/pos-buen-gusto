<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDemoStore } from '@/stores/demo';
import { PlatoFixture, PedidoPlato } from '@/stores/demo';
import PBtn from '@/components/PBtn.vue';
import PBadge from '@/components/PBadge.vue';
import PPriceSummary from '@/components/PPriceSummary.vue';
import PModal from '@/components/PModal.vue';
import PQuantityControl from '@/components/PQuantityControl.vue';

const route = useRoute();
const router = useRouter();
const store = useDemoStore();

const mesaId = route.params.id as string;
const mesa = computed(() => store.mesas.find((m: { id: string }) => m.id === mesaId));

const elementoOrigenPlato = ref<HTMLElement | null>(null);
const platoEditando = ref<string | null>(null);

function agregarPlato(platoDisponible: PlatoFixture) {
  const pedidoPlato = {
    id: `pedido-${Date.now()}`,
    platoId: platoDisponible.id,
    nombre: platoDisponible.nombre,
    cantidad: 1,
    precioUnitario: platoDisponible.precioBase,
    subtotal: platoDisponible.precioBase,
    configuracion: {
      modalidad: platoDisponible.modalidad,
      sopa: platoDisponible.sopa,
      proteina: platoDisponible.proteina,
      principio: platoDisponible.principio,
      acompañamientos: [...platoDisponible.acompañamientos],
      extras: [...platoDisponible.extras],
    },
    estado: 'borrador' as const,
  };
  store.agregarPlatoAMesa(mesaId, pedidoPlato);
}

function cerrarEdicionPlato() {
  platoEditando.value = null;
  store.cerrarModal();
  elementoOrigenPlato.value = null;
}

function volver() {
  router.back();
}

const platoSeleccionado = computed(() => {
  if (!platoEditando.value) return null;
  const mesaActual = store.mesas.find(
    (m: { id: string; platos: PedidoPlato[] }) => m.id === mesaId
  );
  return mesaActual?.platos.find((p: PedidoPlato) => p.id === platoEditando.value) || null;
});
</script>

<template>
  <div class="mesa-detalle">
    <header class="mesa-detalle__header">
      <PBtn variant="fantasma" size="sm" @click="volver"> ← Volver </PBtn>
      <div class="mesa-detalle__titulo">
        <h1>Mesa {{ mesa?.numero }}</h1>
        <PBadge :variant="mesa?.estado" :label="mesa?.estado" />
      </div>
    </header>

    <div class="mesa-detalle__contenido">
      <aside class="mesa-detalle__catastrofe">
        <h3>Agregar plato</h3>
        <div class="mesa-detalle__platos-disponibles">
          <div
            v-for="plato in store.platosDisponibles"
            :key="plato.id"
            class="mesa-detalle__plato-card"
            @click="agregarPlato(plato)"
          >
            <div class="mesa-detalle__plato-info">
              <div class="mesa-detalle__plato-nombre">{{ plato.nombre }}</div>
              <div class="mesa-detalle__plato-precio">
                {{ store.formatearMoneda(plato.precioBase) }}
              </div>
            </div>
            <PBtn variant="secundario" size="sm">Agregar</PBtn>
          </div>
        </div>
      </aside>

      <section class="mesa-detalle__pedido">
        <h3>Pedido</h3>
        <div v-if="mesa?.platos.length === 0" class="mesa-detalle__vacio">
          <p>Aún no hay platos en el pedido.</p>
        </div>
        <div v-else class="mesa-detalle__lista-platos">
          <div
            v-for="plato in mesa?.platos || []"
            :key="plato.id"
            class="mesa-detalle__item-pedido"
            :class="{ 'mesa-detalle__item--en_cocina': plato.estado === 'en_cocina' }"
          >
            <div class="mesa-detalle__item-info">
              <div class="mesa-detalle__item-nombre">
                {{ plato.nombre }}
              </div>
              <div class="mesa-detalle__item-config">
                {{ plato.configuracion.modalidad }} · {{ plato.configuracion.sopa }} ·
                {{ plato.configuracion.proteina }}
              </div>
              <PBadge
                :variant="
                  plato.estado === 'en_cocina'
                    ? 'ocupada'
                    : plato.estado === 'confirmado'
                      ? 'pendiente'
                      : 'default'
                "
                :label="plato.estado"
              />
            </div>
            <div class="mesa-detalle__item-controles">
              <PQuantityControl
                :modelValue="plato.cantidad"
                @update:modelValue="
                  (v) => {
                    plato.cantidad = v;
                    plato.subtotal = plato.precioUnitario * v;
                  }
                "
              />
              <PBtn variant="peligro" size="sm" @click="store.removerPlatoDeMesa(mesaId, plato.id)">
                Retirar
              </PBtn>
            </div>
            <div class="mesa-detalle__item-precio">
              {{ store.formatearMoneda(plato.subtotal) }}
            </div>
          </div>
        </div>

        <div class="mesa-detalle__resumen">
          <PPriceSummary
            :subtotal="mesa?.total || 0"
            :total="mesa?.total || 0"
            :items="mesa?.platos.length || 0"
          />
        </div>

        <div class="mesa-detalle__acciones">
          <PBtn variant="secundario" size="sm" @click="volver"> Volver al salón </PBtn>
          <PBtn variant="primario" size="sm" @click="store.crearComanda(mesaId)">
            Enviar comanda a cocina
          </PBtn>
        </div>
      </section>
    </div>

    <PModal
      :modeloValor="platoEditando !== null"
      :titulo="`Editar: ${platoSeleccionado?.nombre}`"
      :origen="elementoOrigenPlato"
      @update:modeloValor="cerrarEdicionPlato"
      @cerrar="cerrarEdicionPlato"
    >
      <template v-if="platoSeleccionado">
        <div class="modal-plato">
          <div class="modal-plato__campo">
            <label class="modal-plato__etiqueta">Modalidad</label>
            <select class="modal-plato__select" disabled>
              <option>{{ platoSeleccionado.configuracion.modalidad }}</option>
            </select>
          </div>
          <div class="modal-plato__campo">
            <label class="modal-plato__etiqueta">Sopa</label>
            <select class="modal-plato__select" disabled>
              <option>{{ platoSeleccionado.configuracion.sopa }}</option>
            </select>
          </div>
          <div class="modal-plato__campo">
            <label class="modal-plato__etiqueta">Proteína</label>
            <select class="modal-plato__select" disabled>
              <option>{{ platoSeleccionado.configuracion.proteina }}</option>
            </select>
          </div>
          <div class="modal-plato__campo">
            <label class="modal-plato__etiqueta">Observaciones</label>
            <textarea class="modal-plato__textarea" disabled
              >{{ platoSeleccionado.configuracion.observaciones || 'Sin observaciones' }}
</textarea>
          </div>
          <div class="modal-plato__acciones">
            <PBtn variant="secundario" size="sm" @click="cerrarEdicionPlato"> Cancelar </PBtn>
            <PBtn variant="primario" size="sm" @click="cerrarEdicionPlato"> Guardar </PBtn>
          </div>
        </div>
      </template>
    </PModal>
  </div>
</template>

<style scoped>
.mesa-detalle {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: var(--space-8);
}

.mesa-detalle__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.mesa-detalle__titulo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.mesa-detalle__titulo h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.mesa-detalle__contenido {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.mesa-detalle__catastrofe h3,
.mesa-detalle__pedido h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3) 0;
}

.mesa-detalle__platos-disponibles {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.mesa-detalle__plato-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}

.mesa-detalle__plato-card:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-sm);
}

.mesa-detalle__plato-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.mesa-detalle__plato-nombre {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.mesa-detalle__plato-precio {
  font-size: var(--text-sm);
  color: var(--color-accent);
  font-weight: var(--font-weight-semibold);
}

.mesa-detalle__vacio {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-muted);
}

.mesa-detalle__lista-platos {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.mesa-detalle__item-pedido {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color var(--duration-fast) var(--ease-standard);
}

.mesa-detalle__item-pedido--en_cocina {
  border-color: var(--color-success);
  background-color: var(--color-success-light);
}

.mesa-detalle__item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.mesa-detalle__item-nombre {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.mesa-detalle__item-config {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.mesa-detalle__item-controles {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.mesa-detalle__item-precio {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  white-space: nowrap;
}

.mesa-detalle__resumen {
  padding: var(--space-4);
  background-color: var(--color-bg-surface-alt);
  border-radius: var(--radius-lg);
}

.mesa-detalle__acciones {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: var(--border-width) solid var(--color-border);
}

.modal-plato {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.modal-plato__campo {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.modal-plato__etiqueta {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.modal-plato__select,
.modal-plato__textarea {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
}

.modal-plato__acciones {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: var(--border-width) solid var(--color-border);
}

@media (max-width: 1024px) {
  .mesa-detalle {
    grid-template-columns: 1fr;
  }
}
</style>
