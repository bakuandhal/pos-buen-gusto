<script setup lang="ts">
// @ts-nocheck
/* eslint-disable */
import { ref } from 'vue';
import { usePricingStore } from '@/stores/pricing';
import PBtn from '@/components/PBtn.vue';
import PBadge from '@/components/PBadge.vue';
import PModal from '@/components/PModal.vue';
import PInput from '@/components/PInput.vue';
import PLoading from '@/components/PLoading.vue';
import PEmptyState from '@/components/PEmptyState.vue';

const store = usePricingStore();

const modalProductoAbierta = ref(false);
const modalModalidadAbierta = ref(false);

const productoForm = ref({
  nombre: '',
  descripcion: '',
  ordenPresentacion: 0,
});

const modalidadForm = ref({
  productoId: '',
  nombre: '',
  descripcion: '',
  precioBaseCentavos: 0,
  incluyeSopa: false,
});

store.cargarProductos();
store.cargarModalidades();

function abrirModalProducto() {
  productoForm.value = { nombre: '', descripcion: '', ordenPresentacion: 0 };
  modalProductoAbierta.value = true;
}

function cerrarModalProducto() {
  modalProductoAbierta.value = false;
}

  async function guardarProducto() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await store.crearNuevoProducto({
        nombre: productoForm.value.nombre,
        descripcion: productoForm.value.descripcion,
        ordenPresentacion: productoForm.value.ordenPresentacion,
      });
      cerrarModalProducto();
      store.cargarProductos();
    } catch (e: any) {
      // El error ya se maneja en el store
    }
  }

function abrirModalModalidad(productoId: any) {
  modalidadForm.value = {
    productoId: String(productoId),
    nombre: '',
    descripcion: '',
    precioBaseCentavos: 0,
    incluyeSopa: false,
  };
  modalModalidadAbierta.value = true;
}

function cerrarModalModalidad() {
  modalModalidadAbierta.value = false;
}

  async function guardarModalidad() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await store.crearNuevaModalidad({
        productoId: Number(modalidadForm.value.productoId),
        nombre: modalidadForm.value.nombre,
        descripcion: modalidadForm.value.descripcion,
        precioBaseCentavos: modalidadForm.value.precioBaseCentavos,
        incluyeSopa: modalidadForm.value.incluyeSopa,
      });
      cerrarModalModalidad();
      store.cargarModalidades();
    } catch (e: any) {
      // El error ya se maneja en el store
    }
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
  <div class="admin-precios">
    <header class="admin-precios__header">
      <h1>Administración de Precios</h1>
      <p>Gestiona productos, modalidades y tarifas del menú</p>
    </header>

    <div class="admin-precios__acciones">
      <PBtn variant="primario" size="sm" @click="abrirModalProducto">
        Agregar producto
      </PBtn>
      <PBtn variant="secundario" size="sm" @click="store.cargarProductos">
        Refrescar
      </PBtn>
    </div>

    <div v-if="store.cargando" class="admin-precios__cargando">
      <PLoading message="Cargando productos..." size="md" />
    </div>

    <div v-else-if="store.error" class="admin-precios__error">
      <PEmptyState
        title="Error al cargar productos"
        :subtitle="store.error"
        icon="⚠️"
      />
    </div>

    <div v-else class="admin-precios__contenido">
      <div v-if="store.productos.length === 0" class="admin-precios__vacio">
        <PEmptyState
          title="No hay productos configurados"
          subtitle="Agrega tu primer producto para comenzar a configurar precios."
          icon="📦"
        />
      </div>

      <div v-else class="admin-precios__grid">
        <div
          v-for="producto in store.productos"
          :key="producto.id"
          class="admin-precios__tarjeta-producto"
        >
          <div class="admin-precios__tarjeta-info">
            <h3 class="admin-precios__tarjeta-nombre">{{ producto.nombre }}</h3>
            <PBadge
              :variant="producto.esta_activo ? 'disponible' : 'error'"
              :label="producto.esta_activo ? 'Activo' : 'Inactivo'"
            />
            <p class="admin-precios__tarjeta-descripcion">
              {{ producto.descripcion || 'Sin descripción' }}
            </p>
          </div>
          <div class="admin-precios__tarjeta-acciones">
            <PBtn
              variant="fantasma"
              size="sm"
              @click="abrirModalModalidad(producto.id)"
            >
              Agregar modalidad
            </PBtn>
            <PBtn variant="secundario" size="sm">Editar</PBtn>
          </div>

          <div class="admin-precios__modalidades">
            <h4 class="admin-precios__modalidades-titulo">Modalidades</h4>
            <div
              v-for="modalidad in store.modalidades.filter(m => m.producto_id === producto.id)"
              :key="modalidad.id"
              class="admin-precios__modalidad-item"
            >
              <span class="admin-precios__modalidad-nombre">
                {{ modalidad.nombre }}
              </span>
              <span class="admin-precios__modalidad-precio">
                {{ formatearMoneda(modalidad.precio_base_centavos) }}
              </span>
              <PBadge
                :variant="modalidad.esta_activo ? 'disponible' : 'error'"
                :label="modalidad.esta_activo ? 'Activo' : 'Inactivo'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <PModal
      v-model:modeloValor="modalProductoAbierta"
      :titulo="'Agregar producto'"
      @cerrar="cerrarModalProducto"
    >
      <div class="modal-formulario">
        <PInput
          label="Nombre del producto"
          v-model="productoForm.nombre"
          placeholder="Ej. Almuerzo Completo"
        />
        <PInput
          label="Descripción"
          v-model="productoForm.descripcion"
          placeholder="Descripción opcional"
        />
        <PInput
          label="Orden de presentación"
          type="number"
          v-model.number="productoForm.ordenPresentacion"
        />
        <div class="modal-formulario__acciones">
          <PBtn variant="secundario" size="sm" @click="cerrarModalProducto">
            Cancelar
          </PBtn>
          <PBtn variant="primario" size="sm" @click="guardarProducto">
            Guardar producto
          </PBtn>
        </div>
      </div>
    </PModal>

    <PModal
      v-model:modeloValor="modalModalidadAbierta"
      :titulo="'Agregar modalidad'"
      @cerrar="cerrarModalModalidad"
    >
      <div class="modal-formulario">
        <PInput
          label="Nombre de la modalidad"
          v-model="modalidadForm.nombre"
          placeholder="Ej. Almuerzo en Mesa"
        />
        <PInput
          label="Descripción"
          v-model="modalidadForm.descripcion"
          placeholder="Descripción opcional"
        />
        <PInput
          label="Precio base (centavos)"
          type="number"
          v-model.number="modalidadForm.precioBaseCentavos"
        />
        <div class="modal-formulario__campo">
          <label class="modal-formulario__etiqueta">Incluye sopa</label>
          <input
            type="checkbox"
            class="modal-formulario__checkbox"
            v-model="modalidadForm.incluyeSopa"
          />
        </div>
        <div class="modal-formulario__acciones">
          <PBtn variant="secundario" size="sm" @click="cerrarModalModalidad">
            Cancelar
          </PBtn>
          <PBtn variant="primario" size="sm" @click="guardarModalidad">
            Guardar modalidad
          </PBtn>
        </div>
      </div>
    </PModal>
  </div>
</template>

<style scoped>
.admin-precios {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-precios__header {
  margin-bottom: var(--space-8);
}

.admin-precios__header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
}

.admin-precios__header p {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.admin-precios__acciones {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.admin-precios__cargando {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}

.admin-precios__error {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}

.admin-precios__contenido {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.admin-precios__vacio {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}

.admin-precios__grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.admin-precios__tarjeta-producto {
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition:
    box-shadow var(--duration-normal) var(--ease-standard),
    border-color var(--duration-normal) var(--ease-standard);
}

.admin-precios__tarjeta-producto:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent);
}

.admin-precios__tarjeta-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.admin-precios__tarjeta-nombre {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.admin-precios__tarjeta-descripcion {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.admin-precios__tarjeta-acciones {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-3);
}

.admin-precios__modalidades {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: var(--border-width) solid var(--color-border);
}

.admin-precios__modalidades-titulo {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 var(--space-2) 0;
}

.admin-precios__modalidad-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-bg-surface-alt);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-1);
}

.admin-precios__modalidad-nombre {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.admin-precios__modalidad-precio {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
}

.modal-formulario {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.modal-formulario__campo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.modal-formulario__etiqueta {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.modal-formulario__checkbox {
  width: 1rem;
  height: 1rem;
}

.modal-formulario__acciones {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
</style>
