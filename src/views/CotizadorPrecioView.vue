<script setup lang="ts">
// @ts-nocheck
/* eslint-disable */
import { ref, computed } from 'vue';
import { usePricingStore } from '@/stores/pricing';
import PBtn from '@/components/PBtn.vue';
import PPriceSummary from '@/components/PPriceSummary.vue';

const store = usePricingStore();

const productoSeleccionado = ref('');
const modalidadSeleccionada = ref('');
const opcionesSeleccionadas = ref<number[]>([]);
const sustitucionesSeleccionadas = ref<{ opcionOriginalId: number; opcionSustitutaId: number }[]>([]);
const adicionalesSeleccionados = ref<{ adicionalId: number; cantidad: number }[]>([]);

const cotizacionAbierta = ref(false);

store.cargarProductos();

const productosDisponibles = computed(() => store.productosActivos);
const modalidadesDisponibles = computed(() => {
  if (!productoSeleccionado.value) return [];
  return store.modalidades.filter(
    (m: any) => m.producto_id === Number(productoSeleccionado.value) && m.esta_activo
  );
});

const opcionesPorProducto = computed(() => {
  if (!productoSeleccionado.value) return [];
  return store.opciones.filter((o: any) => o.esta_activo);
});

const adicionalesPorProducto = computed(() => {
  if (!productoSeleccionado.value) return [];
  return store.adicionales.filter(
    (a: any) => a.producto_id === Number(productoSeleccionado.value) && a.esta_activo
  );
});

async function realizarCotizacion() {
  if (!productoSeleccionado.value || !modalidadSeleccionada.value) return;

  try {
    await store.cotizar({
      productoId: Number(productoSeleccionado.value),
      modalidadId: Number(modalidadSeleccionada.value),
      opcionesSeleccionadas: [...opcionesSeleccionadas.value],
      sustituciones: [...sustitucionesSeleccionadas.value],
      adicionales: [...adicionalesSeleccionados.value],
    });
    cotizacionAbierta.value = true;
  } catch (e: any) {
    // El error se muestra en el store
  }
}

function toggleOpcion(opcionId: number) {
  const idx = opcionesSeleccionadas.value.indexOf(opcionId);
  if (idx >= 0) {
    opcionesSeleccionadas.value.splice(idx, 1);
  } else {
    opcionesSeleccionadas.value.push(opcionId);
  }
}

function estaSeleccionada(opcionId: number) {
  return opcionesSeleccionadas.value.includes(opcionId);
}

function cambiarCantidadAdicional(adicionalId: number, delta: number) {
  const idx = adicionalesSeleccionados.value.findIndex((a: any) => a.adicionalId === adicionalId);
  if (idx >= 0) {
    const nuevaCantidad = adicionalesSeleccionados.value[idx].cantidad + delta;
    if (nuevaCantidad < 1) {
      adicionalesSeleccionados.value.splice(idx, 1);
    } else {
      adicionalesSeleccionados.value[idx].cantidad = nuevaCantidad;
    }
  }
}

function estaSeleccionadoAdicional(adicionalId: number) {
  return adicionalesSeleccionados.value.some((a: any) => a.adicionalId === adicionalId);
}

const formatearMoneda = (centavos: number): string => {
  const signo = centavos < 0 ? '-' : '';
  const abs = Math.abs(centavos);
  const major = Math.floor(abs / 100);
  const minor = abs % 100;
  return `${signo}${major}.${minor.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="cotizador">
    <header class="cotizador__header">
      <h1>Cotizador de Precios</h1>
      <p>Calcula el precio de un almuerzo según la configuración seleccionada</p>
    </header>

    <div class="cotizador__formulario">
      <div class="cotizador__campo">
        <label class="cotizador__etiqueta">Producto</label>
        <select
          class="cotizador__select"
          v-model="productoSeleccionado"
          @change="
            modalidadSeleccionada.value = '';
            opcionesSeleccionadas.value = [];
            sustitucionesSeleccionadas.value = [];
            adicionalesSeleccionados.value = [];
          "
        >
          <option value="">Seleccionar producto</option>
          <option
            v-for="producto in productosDisponibles"
            :key="producto.id"
            :value="producto.id"
          >
            {{ producto.nombre }}
          </option>
        </select>
      </div>

      <div class="cotizador__campo" v-if="productoSeleccionado">
        <label class="cotizador__etiqueta">Modalidad</label>
        <select
          class="cotizador__select"
          v-model="modalidadSeleccionada"
          @change="
            opcionesSeleccionadas.value = [];
            sustitucionesSeleccionadas.value = [];
            adicionalesSeleccionados.value = [];
          "
        >
          <option value="">Seleccionar modalidad</option>
          <option
            v-for="modalidad in modalidadesDisponibles"
            :key="modalidad.id"
            :value="modalidad.id"
          >
            {{ modalidad.nombre }} - {{ formatearMoneda(modalidad.precio_base_centavos) }}
          </option>
        </select>
      </div>

      <div v-if="modalidadSeleccionada" class="cotizador__seccion">
        <h3 class="cotizador__seccion-titulo">Opciones disponibles</h3>
        <div class="cotizador__opciones-grid">
          <div
            v-for="opcion in opcionesPorProducto"
            :key="opcion.id"
            class="cotizador__opcion"
            :class="{ 'cotizador__opcion--seleccionada': estaSeleccionada(opcion.id) }"
            @click="toggleOpcion(opcion.id)"
          >
            <input
              type="checkbox"
              class="cotizador__opcion-checkbox"
              :checked="estaSeleccionada(opcion.id)"
              @click.stop
            />
            <label class="cotizador__opcion-label">{{ opcion.nombre }}</label>
          </div>
        </div>
      </div>

      <div v-if="adicionalesPorProducto.length > 0" class="cotizador__seccion">
        <h3 class="cotizador__seccion-titulo">Adicionales</h3>
        <div class="cotizador__adicionales-lista">
          <div
            v-for="adicional in adicionalesPorProducto"
            :key="adicional.id"
            class="cotizador__adicional-item"
          >
            <span class="cotizador__adicional-nombre">{{ adicional.nombre }}</span>
            <span class="cotizador__adicional-precio">
              {{ formatearMoneda(adicional.precio_centavos) }}
            </span>
            <div class="cotizador__adicional-controles">
              <button
                type="button"
                class="cotizador__btn-cantidad cotizador__btn-disminuir"
                @click="cambiarCantidadAdicional(adicional.id, -1)"
                :disabled="!estaSeleccionadoAdicional(adicional.id)"
              >
                −
              </button>
              <span class="cotizador__adicional-cantidad">
                {{
                  adicionalesSeleccionados.value.find(
                    (a: any) => a.adicionalId === adicional.id
                  )?.cantidad || 0
                }}
              </span>
              <button
                type="button"
                class="cotizador__btn-cantidad cotizador__btn-aumentar"
                @click="cambiarCantidadAdicional(adicional.id, 1)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="cotizador__acciones">
        <PBtn
          variant="primario"
          size="sm"
          :disabled="!productoSeleccionado || !modalidadSeleccionada || store.cargando"
          @click="realizarCotizacion"
        >
          {{ store.cargando ? 'Calculando...' : 'Calcular precio' }}
        </PBtn>
      </div>
    </div>

    <div v-if="store.cotizacion" class="cotizador__resultado">
      <h3 class="cotizador__resultado-titulo">Cotización confirmada</h3>
      <PPriceSummary
        :subtotal="store.cotizacion.precioBaseCentavos"
        :total="store.cotizacion.totalCentavos"
        :items="
          store.cotizacion.adicionales.length +
          store.cotizacion.sustitucionesAplicadas.length
        "
      />
      <div class="cotizador__desglose">
        <h4 class="cotizador__desglose-titulo">Desglose</h4>
        <div class="cotizador__desglose-item">
          <span class="cotizador__desglose-etiqueta">Modalidad</span>
          <span class="cotizador__desglose-valor">
            {{ store.cotizacion.modalidadNombre }}
          </span>
        </div>
        <div class="cotizador__desglose-item">
          <span class="cotizador__desglose-etiqueta">Precio base</span>
          <span class="cotizador__desglose-valor">
            {{ formatearMoneda(store.cotizacion.precioBaseCentavos) }}
          </span>
        </div>
      </div>
      <PBtn variant="secundario" size="sm" @click="store.cotizacion = null">
        Nueva cotización
      </PBtn>
    </div>

    <div v-if="store.error" class="cotizador__error">
      {{ store.error }}
    </div>
  </div>
</template>

<style scoped>
.cotizador {
  max-width: 1000px;
  margin: 0 auto;
}

.cotizador__header {
  margin-bottom: var(--space-8);
}

.cotizador__header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
}

.cotizador__header p {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.cotizador__formulario {
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

.cotizador__campo {
  margin-bottom: var(--space-4);
}

.cotizador__etiqueta {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.cotizador__select {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
}

.cotizador__seccion {
  margin-bottom: var(--space-6);
}

.cotizador__seccion-titulo {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3) 0;
}

.cotizador__opciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-3);
}

.cotizador__opcion {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background-color: var(--color-bg-surface-alt);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard);
}

.cotizador__opcion:hover {
  border-color: var(--color-accent);
}

.cotizador__opcion--seleccionada {
  border-color: var(--color-accent);
  background-color: var(--color-accent-light);
}

.cotizador__opcion-checkbox {
  width: 1rem;
  height: 1rem;
}

.cotizador__opcion-label {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  cursor: pointer;
}

.cotizador__adicionales-lista {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.cotizador__adicional-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  background-color: var(--color-bg-surface-alt);
  border-radius: var(--radius-md);
}

.cotizador__adicional-nombre {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.cotizador__adicional-precio {
  font-size: var(--text-sm);
  color: var(--color-accent);
  font-weight: var(--font-weight-semibold);
}

.cotizador__adicional-controles {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.cotizador__btn-cantidad {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.cotizador__btn-cantidad:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cotizador__adicional-cantidad {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  min-width: 1.5rem;
  text-align: center;
}

.cotizador__acciones {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.cotizador__resultado {
  background-color: var(--color-bg-surface-alt);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.cotizador__resultado-titulo {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-4) 0;
}

.cotizador__desglose {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: var(--border-width) solid var(--color-border);
}

.cotizador__desglose-titulo {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 var(--space-2) 0;
}

.cotizador__desglose-item {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
}

.cotizador__desglose-valor {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.cotizador__error {
  color: var(--color-danger);
  font-size: var(--text-sm);
  margin-top: var(--space-3);
}
</style>
