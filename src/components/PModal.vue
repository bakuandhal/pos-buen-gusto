<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

interface Props {
  modeloValor: boolean;
  titulo?: string;
  mostrarCerrar?: boolean;
  cerrarEnFondo?: boolean;
  reducido?: boolean;
  ancho?: 'sm' | 'md' | 'lg' | 'xl' | 'completo';
  origen?: HTMLElement | null;
}

const props = withDefaults(defineProps<Props>(), {
  modeloValor: false,
  titulo: '',
  mostrarCerrar: true,
  cerrarEnFondo: true,
  reducido: false,
  ancho: 'md',
});

const emit = defineEmits(['actualiza:modeloValor', 'cerrar', 'abrir']);

const contenedor = ref<HTMLElement | null>(null);
const backdrop = ref<HTMLElement | null>(null);
const cerrarBtn = ref<HTMLElement | null>(null);

const estado = reactive({
  animando: false,
  elementoOrigen: props.origen || null,
  flipId: 'modal-flip' as string,
});

const movimientoReducido = ref(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const anchoClase = computed(() => `p-modal--${props.ancho}`);

const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
mediaQuery.addEventListener('change', (e) => {
  movimientoReducido.value = e.matches;
});

watch(
  () => props.modeloValor,
  async (nuevo: boolean) => {
    if (nuevo) {
      await abrirModal();
    } else {
      await cerrarModal();
    }
  }
);

async function abrirModal() {
  if (estado.animando) return;
  estado.animando = true;
  emit('actualiza:modeloValor', true);
  emit('abrir');

  await nextTick();

  const estadoFlip = Flip.getState(props.origen!);

  if (backdrop.value) {
    gsap.set(backdrop.value, { opacity: 0, pointerEvents: 'none' });
    gsap.to(backdrop.value, {
      opacity: 0.45,
      duration: movimientoReducido.value ? 0 : 0.25,
      ease: 'power2.out',
      clearProps: 'all',
    });
  }

  if (contenedor.value) {
    gsap.set(contenedor.value, {
      opacity: 0,
      visibility: 'visible',
      scale: 0.95,
      y: 20,
    });
  }

  if (props.origen && !movimientoReducido.value) {
    gsap.set(props.origen, { visibility: 'hidden' });
    Flip.from(estadoFlip, {
      duration: 0.4,
      ease: 'power2.inOut',
      absolute: true,
      onComplete: () => {
        if (props.origen) {
          gsap.set(props.origen, { visibility: 'visible' });
        }
        estado.animando = false;
      },
    });
  } else {
    gsap.to(contenedor.value, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: movimientoReducido.value ? 0 : 0.3,
      ease: 'power2.out',
      clearProps: 'all',
      onComplete: () => {
        estado.animando = false;
        enfocarCerrar();
      },
    });
  }

  document.body.style.overflow = 'hidden';
}

async function cerrarModal() {
  if (estado.animando) return;
  estado.animando = true;

  if (contenedor.value) {
    gsap.to(contenedor.value, {
      opacity: 0,
      scale: 0.95,
      y: 20,
      duration: movimientoReducido.value ? 0 : 0.2,
      ease: 'power2.in',
    });
  }

  if (backdrop.value) {
    gsap.to(backdrop.value, {
      opacity: 0,
      duration: movimientoReducido.value ? 0 : 0.2,
      ease: 'power2.in',
      clearProps: 'all',
    });
  }

  if (props.origen && !movimientoReducido.value) {
    const estadoFlip = Flip.getState(props.origen);
    gsap.set(props.origen, { visibility: 'hidden' });
    Flip.from(estadoFlip, {
      duration: 0.4,
      ease: 'power2.inOut',
      absolute: true,
      onComplete: () => {
        if (props.origen) {
          gsap.set(props.origen, { visibility: 'visible' });
        }
        finalizarCierre();
      },
    });
  } else {
    setTimeout(finalizarCierre, movimientoReducido.value ? 0 : 200);
  }
}

function finalizarCierre() {
  emit('actualiza:modeloValor', false);
  emit('cerrar');
  estado.animando = false;
  document.body.style.overflow = '';

  if (estado.elementoOrigen) {
    (estado.elementoOrigen as HTMLElement).focus?.();
  }
}

function enfocarCerrar() {
  if (cerrarBtn.value && props.mostrarCerrar) {
    cerrarBtn.value.focus();
  }
}

function manejarTeclado(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modeloValor) {
    emit('actualiza:modeloValor', false);
    emit('cerrar');
  }
}

function manejarClickFondo(e: MouseEvent) {
  if (props.cerrarEnFondo && contenedor.value && !contenedor.value.contains(e.target as Node)) {
    emit('actualiza:modeloValor', false);
    emit('cerrar');
  }
}

onMounted(() => {
  document.addEventListener('keydown', manejarTeclado);
});

onUnmounted(() => {
  document.removeEventListener('keydown', manejarTeclado);
  gsap.killTweensOf([contenedor.value, backdrop.value, props.origen]);
  document.body.style.overflow = '';
});
</script>

<template>
  <div
    v-if="props.modeloValor"
    ref="contenedor"
    class="p-modal"
    :class="[anchoClase, { 'p-modal--reducido': props.reducido }]"
    @click.stop
  >
    <div
      ref="backdrop"
      class="p-modal__backdrop"
      @click="manejarClickFondo"
      aria-hidden="true"
    ></div>

    <div class="p-modal__contenido" ref="contenido">
      <div class="p-modal__encabezado">
        <h2 class="p-modal__titulo">{{ props.titulo }}</h2>
        <button
          v-if="props.mostrarCerrar"
          ref="cerrarBtn"
          type="button"
          class="p-modal__cerrar"
          @click="emit('actualiza:modeloValor', false)"
          aria-label="Cerrar modal"
        >
          ✕
        </button>
      </div>

      <div class="p-modal__cuerpo">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.p-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
  opacity: 0;
  outline: none;
}

.p-modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(26, 24, 22, 0.45);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal-backdrop);
}

.p-modal__contenido {
  position: relative;
  background-color: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  border: var(--border-width) solid var(--color-border);
  max-height: 90vh;
  overflow-y: auto;
  z-index: var(--z-modal);
  display: flex;
  flex-direction: column;
  outline: none;
}

.p-modal--sm .p-modal__contenido {
  width: 32rem;
  max-width: 90vw;
}

.p-modal--md .p-modal__contenido {
  width: 48rem;
  max-width: 90vw;
}

.p-modal--lg .p-modal__contenido {
  width: 64rem;
  max-width: 90vw;
}

.p-modal--xl .p-modal__contenido {
  width: 80rem;
  max-width: 95vw;
}

.p-modal--completo .p-modal__contenido {
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  border-radius: 0;
  margin: 0;
}

.p-modal__encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}

.p-modal__titulo {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.p-modal__cerrar {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-surface-alt);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--text-lg);
  line-height: 1;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.p-modal__cerrar:hover {
  background-color: var(--color-border);
  color: var(--color-text-primary);
}

.p-modal__cerrar:focus-visible {
  box-shadow: 0 0 0 3px rgba(201, 138, 47, 0.3);
}

.p-modal__cuerpo {
  padding: var(--space-6);
  flex: 1;
  overflow-y: auto;
}

@media (prefers-reduced-motion: reduce) {
  .p-modal__contenido {
    transition: none;
    animation: none;
  }

  .p-modal__backdrop {
    transition: none;
    animation: none;
  }
}
</style>
