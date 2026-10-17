<script setup lang="ts">
import { useDemoStore } from '@/stores/demo';
import PBtn from '@/components/PBtn.vue';
import PBadge from '@/components/PBadge.vue';

const store = useDemoStore();
</script>

<template>
  <div class="precios">
    <header class="precios__header">
      <h1>Precios y modalidades</h1>
      <p>Configuración de tarifas del menú (vista de demostración)</p>
    </header>

    <div class="precios__acciones">
      <PBtn variant="primario" size="sm"> Agregar modalidad </PBtn>
    </div>

    <div class="precios__grid">
      <div v-for="modalidad in store.modalidades" :key="modalidad.id" class="precios__tarjeta">
        <div class="precios__tarjeta-info">
          <h3 class="precios__tarjeta-nombre">{{ modalidad.nombre }}</h3>
          <p class="precios__tarjeta-descripcion">{{ modalidad.descripcion }}</p>
          <div class="precios__tarjeta-opciones">
            <span
              v-for="opcion in modalidad.opcionesIncluidas"
              :key="opcion"
              class="precios__tarjeta-opcion"
            >
              ✓ {{ opcion }}
            </span>
          </div>
        </div>
        <div class="precios__tarjeta-precio">
          <div class="precios__tarjeta-valor">
            {{ store.formatearMoneda(modalidad.precio) }}
          </div>
          <PBadge
            :variant="modalidad.disponible ? 'disponible' : 'error'"
            :label="modalidad.disponible ? 'Disponible' : 'No disponible'"
          />
        </div>
        <div class="precios__tarjeta-acciones">
          <PBtn variant="fantasma" size="sm">Editar</PBtn>
          <PBtn variant="secundario" size="sm"> Duplicar </PBtn>
        </div>
      </div>
    </div>

    <div class="precios__nota">
      <p>
        Los datos mostrados son ficticios y solo forman parte del prototipo visual. El motor de
        precios definitivo se implementará en la Fase 4.
      </p>
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

.precios__tarjeta-opciones {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-2);
}

.precios__tarjeta-opcion {
  font-size: var(--text-xs);
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
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

.precios__nota {
  margin-top: var(--space-8);
  padding: var(--space-5);
  background-color: var(--color-info-light);
  border: var(--border-width) solid var(--color-info);
  border-radius: var(--radius-md);
}

.precios__nota p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-info);
}
</style>
