<script setup lang="ts">
import { computed } from 'vue';
import { useDemoStore } from '@/stores/demo';
import { PedidoPlato } from '@/stores/demo';
import PBadge from '@/components/PBadge.vue';
import PBtn from '@/components/PBtn.vue';
import PPriceSummary from '@/components/PPriceSummary.vue';

const store = useDemoStore();

// Mesas con pedidos pendientes de cobro
const mesasConCuenta = computed(() =>
  store.mesas.filter(
    (m: { platos: PedidoPlato[]; estado: string }) => m.platos.length > 0 && m.estado === 'ocupada'
  )
);
</script>

<template>
  <div class="caja">
    <header class="caja__header">
      <h1>Caja</h1>
      <p>Cuentas pendientes de cobro</p>
    </header>

    <div class="caja__resumen">
      <div class="caja__tarjeta-resumen">
        <span class="caja__label">Cuentas abiertas</span>
        <span class="caja__valor">{{ mesasConCuenta.length }}</span>
      </div>
      <div class="caja__tarjeta-resumen caja__tarjeta-resumen--total">
        <span class="caja__label">Total pendiente</span>
        <span class="caja__valor">
          {{ store.formatearMoneda(mesasConCuenta.reduce((s, m) => s + m.total, 0)) }}
        </span>
      </div>
    </div>

    <div class="caja__grid">
      <div v-for="mesa in mesasConCuenta" :key="mesa.id" class="caja__cuenta">
        <div class="caja__cuenta-header">
          <div class="caja__cuenta-numero">Mesa {{ mesa.numero }}</div>
          <PBadge variant="info" :label="`${mesa.comensales} comensales`" />
        </div>
        <div class="caja__cuenta-platos">
          <div v-for="plato in mesa.platos" :key="plato.id" class="caja__cuenta-plato">
            <span class="caja__cuenta-plato-nombre">
              {{ plato.nombre }} ×{{ plato.cantidad }}
            </span>
            <span class="caja__cuenta-plato-precio">
              {{ store.formatearMoneda(plato.subtotal) }}
            </span>
          </div>
        </div>
        <PPriceSummary :subtotal="mesa.total" :total="mesa.total" :items="mesa.platos.length" />
        <div class="caja__cuenta-acciones">
          <PBtn
            variant="primario"
            size="sm"
            @click="$router.push({ name: 'mesa-detalle', params: { id: mesa.id } })"
          >
            Ver detalle
          </PBtn>
          <PBtn variant="secundario" size="sm"> Cobrar </PBtn>
        </div>
      </div>
    </div>

    <div v-if="mesasConCuenta.length === 0" class="caja__vacio">
      <p>No hay cuentas pendientes de cobro.</p>
    </div>

    <div class="caja__nota">
      <p>
        Los pagos y el cierre de cuenta se implementarán en la Fase 7. Esta pantalla es solo un
        prototipo visual.
      </p>
    </div>
  </div>
</template>

<style scoped>
.caja {
  max-width: 1200px;
  margin: 0 auto;
}

.caja__header {
  margin-bottom: var(--space-8);
}

.caja__header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
}

.caja__header p {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.caja__resumen {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.caja__tarjeta-resumen {
  flex: 1;
  padding: var(--space-5);
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.caja__tarjeta-resumen--total {
  border-color: var(--color-accent);
  background-color: var(--color-accent-light);
}

.caja__label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.caja__valor {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.caja__tarjeta-resumen--total .caja__valor {
  color: var(--color-accent);
}

.caja__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--space-5);
}

.caja__cuenta {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background-color: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.caja__cuenta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.caja__cuenta-numero {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.caja__cuenta-platos {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  border-top: var(--border-width) solid var(--color-border);
  border-bottom: var(--border-width) solid var(--color-border);
  padding: var(--space-3) 0;
}

.caja__cuenta-plato {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.caja__cuenta-plato-nombre {
  flex: 1;
}

.caja__cuenta-plato-precio {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.caja__cuenta-acciones {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-3);
  border-top: var(--border-width) solid var(--color-border);
}

.caja__vacio {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
  color: var(--color-text-muted);
}

.caja__nota {
  margin-top: var(--space-8);
  padding: var(--space-5);
  background-color: var(--color-info-light);
  border: var(--border-width) solid var(--color-info);
  border-radius: var(--radius-md);
}

.caja__nota p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-info);
}
</style>
