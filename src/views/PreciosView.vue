<script setup lang="ts">
import { usePricingStore } from '@/stores/pricing';
import PBtn from '@/components/PBtn.vue';
import PBadge from '@/components/PBadge.vue';
import PLoading from '@/components/PLoading.vue';
import PEmptyState from '@/components/PEmptyState.vue';

const store = usePricingStore();

store.cargarProductos();
store.cargarModalidades();

const formatearMoneda = (centavos: number): string => {
  const signo = centavos < 0 ? '-' : '';
  const abs = Math.abs(centavos);
  const major = Math.floor(abs / 100);
  const minor = abs % 100;
  return `${signo}${major}.${minor.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="precios">
    <header class="precios__header">
      <h1>Precios y modalidades</h1>
      <p>Configuración de tarifas del menú</p>
    </header>

    <div v-if="store.cargando" class="precios__cargando">
      <PLoading message="Cargando modalidades..." size="lg" />
    </div>

    <div v-else-if="store.error" class="precios__error">
      <PEmptyState
        title="Error al cargar precios"
        :subtitle="store.error"
        icon="⚠️"
      />
    </div>

    <div v-else class="precios__contenido">
      <div class="precios__acciones">
        <PBtn variant="primario" size="sm"> Agregar modalidad </PBtn>
      </div>

      <div class="precios__grid">
        <div
          v-for="modalidad in store.modalidades"
          :key="modalidad.id"
          class="precios__tarjeta"
        >
          <div class="precios__tarjeta-info">
            <h3 class="precios__tarjeta-nombre">{{ modalidad.nombre }}</h3>
            <p class="precios__tarjeta-descripcion">
              {{ modalidad.descripcion || 'Sin descripción' }}
            </p>
          </div>
          <div class="precios__tarjeta-precio">
            <div class="precios__tarjeta-valor">
              {{ formatearMoneda(modalidad.precio_base_centavos) }}
            </div>
            <PBadge
              :variant="modalidad.esta_activo ? 'disponible' : 'error'"
              :label="modalidad.esta_activo ? 'Disponible' : 'No disponible'"
            />
          </div>
        </div>
      </div>

      <div v-if="store.modalidades.length === 0" class="precios__vacio">
        <PEmptyState
          title="No hay modalidades configuradas"
          subtitle="Aún no se han creado modalidades de precios."
          icon="🍽️"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.precios {
  max-width: 1200px;
  margin: 0 auto;
}

.precios__header {
  margin-bottom: var(--space-8);
}

.precios__header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
}

.precios__header p {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.precios__acciones {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-6);
}

.precios__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-5);
}

.precios__tarjeta {
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

.precios__tarjeta:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent);
}

.precios__tarjeta-info {
  padding: var(--space-5);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.precios__tarjeta-nombre {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.precios__tarjeta-descripcion {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.precios__tarjeta-precio {
  padding: var(--space-5);
  background-color: var(--color-bg-surface-alt);
  border-top: var(--border-width) solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.precios__tarjeta-valor {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
}

.precios__tarjeta-acciones {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4);
  background-color: var(--color-bg-surface-alt);
  border-top: var(--border-width) solid var(--color-border);
}

.precios__vacio {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}

.precios__cargando {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}

.precios__error {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}
</style>
