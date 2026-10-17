/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  listarProductos,
  listarModalidades,
  listarGruposOpciones,
  listarOpciones,
  listarOpcionesIncluidas,
  listarSustituciones,
  listarAdicionales,
  crearProducto,
  crearModalidad,
  crearGrupoOpciones,
  crearOpcion,
  crearSustitucion,
  crearAdicional,
  cotizarPrecio,
  type Producto,
  type Modalidad,
  type GrupoOpciones,
  type Opcion,
  type OpcionIncluida,
  type Sustitucion,
  type Adicional,
  type PricingQuoteRequest,
  type PricingQuoteResponse,
} from '@/services/pricingApi';

export const usePricingStore = defineStore('pricing', () => {
  // ── Estado ──
  const productos = ref<Producto[]>([]);
  const modalidades = ref<Modalidad[]>([]);
  const gruposOpciones = ref<GrupoOpciones[]>([]);
  const opciones = ref<Opcion[]>([]);
  const adicionales = ref<Adicional[]>([]);
  const opcionesIncluidas = ref<OpcionIncluida[]>([]);
  const sustituciones = ref<Sustitucion[]>([]);
  const cotizacion = ref<PricingQuoteResponse | null>(null);
  const cargando = ref(false);
  const error = ref<string | null>(null);

  // ── Computados ──
  const productosActivos = computed(() => productos.value.filter((p) => p.esta_activo));
  const modalidadesActivas = computed(() => modalidades.value.filter((m) => m.esta_activo));
  const cotizacionExitosa = computed(() => cotizacion.value !== null);

  // ── Acciones ──
  async function cargarProductos() {
    cargando.value = true;
    error.value = null;
    try {
      productos.value = await listarProductos();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error.value = e.message || 'Error al cargar productos';
    } finally {
      cargando.value = false;
    }
  }

  async function cargarModalidades(productoId?: number) {
    cargando.value = true;
    error.value = null;
    try {
      modalidades.value = await listarModalidades(productoId);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error.value = e.message || 'Error al cargar modalidades';
    } finally {
      cargando.value = false;
    }
  }

  async function cargarGruposOpciones(productoId?: number) {
    cargando.value = true;
    error.value = null;
    try {
      gruposOpciones.value = await listarGruposOpciones(productoId);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error.value = e.message || 'Error al cargar grupos de opciones';
    } finally {
      cargando.value = false;
    }
  }

  async function cargarOpciones(grupoId?: number) {
    cargando.value = true;
    error.value = null;
    try {
      opciones.value = await listarOpciones(grupoId);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error.value = e.message || 'Error al cargar opciones';
    } finally {
      cargando.value = false;
    }
  }

  async function cargarAdicionales(productoId?: number) {
    cargando.value = true;
    error.value = null;
    try {
      adicionales.value = await listarAdicionales(productoId);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error.value = e.message || 'Error al cargar adicionales';
    } finally {
      cargando.value = false;
    }
  }

  async function crearNuevoProducto(data: { nombre: string; descripcion?: string; ordenPresentacion?: number }) {
    cargando.value = true;
    error.value = null;
    try {
      const producto = await crearProducto(data);
      productos.value.push(producto);
      return producto;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error.value = e.message || 'Error al crear producto';
      throw e;
    } finally {
      cargando.value = false;
    }
  }

  async function crearNuevaModalidad(data: {
    productoId: number;
    nombre: string;
    descripcion?: string;
    precioBaseCentavos: number;
    incluyeSopa?: boolean;
  }) {
    cargando.value = true;
    error.value = null;
    try {
      const modalidad = await crearModalidad(data);
      modalidades.value.push(modalidad);
      return modalidad;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error.value = e.message || 'Error al crear modalidad';
      throw e;
    } finally {
      cargando.value = false;
    }
  }

  async function crearNuevoGrupoOpciones(data: {
    productoId: number;
    nombre: string;
    descripcion?: string;
    esObligatorio?: boolean;
    cantidadMinima?: number;
    cantidadMaxima?: number;
    permiteVariasElecciones?: boolean;
  }) {
    cargando.value = true;
    error.value = null;
    try {
      const grupo = await crearGrupoOpciones(data);
      gruposOpciones.value.push(grupo);
      return grupo;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error.value = e.message || 'Error al crear grupo de opciones';
      throw e;
    } finally {
      cargando.value = false;
    }
  }

  async function crearNuevaOpcion(data: {
    grupoId: number;
    nombre: string;
    descripcion?: string;
    ordenPresentacion?: number;
  }) {
    cargando.value = true;
    error.value = null;
    try {
      const opcion = await crearOpcion(data);
      opciones.value.push(opcion);
      return opcion;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error.value = e.message || 'Error al crear opción';
      throw e;
    } finally {
      cargando.value = false;
    }
  }

  async function crearNuevaSustitucion(data: {
    modalidadId: number;
    opcionOriginalId: number;
    opcionSustitutaId: number;
    ajustePrecioCentavos?: number;
  }) {
    cargando.value = true;
    error.value = null;
    try {
      const sustitucion = await crearSustitucion(data);
      sustituciones.value.push(sustitucion);
      return sustitucion;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error.value = e.message || 'Error al crear sustitución';
      throw e;
    } finally {
      cargando.value = false;
    }
  }

  async function crearNuevoAdicional(data: {
    productoId: number;
    nombre: string;
    descripcion?: string;
    precioCentavos: number;
    cantidadMaxima?: number;
  }) {
    cargando.value = true;
    error.value = null;
    try {
      const adicional = await crearAdicional(data);
      adicionales.value.push(adicional);
      return adicional;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error.value = e.message || 'Error al crear adicional';
      throw e;
    } finally {
      cargando.value = false;
    }
  }

  async function cotizar(data: PricingQuoteRequest) {
    cargando.value = true;
    error.value = null;
    try {
      const resultado = await cotizarPrecio(data);
      cotizacion.value = resultado;
      return resultado;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error.value = e.message || 'Error al cotizar precio';
      cotizacion.value = null;
      throw e;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarOpcionesIncluidas(modalidadId: number) {
    cargando.value = true;
    error.value = null;
    try {
      opcionesIncluidas.value = await listarOpcionesIncluidas(modalidadId);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error.value = e.message || 'Error al cargar opciones incluidas';
    } finally {
      cargando.value = false;
    }
  }

  async function cargarSustituciones(modalidadId: number) {
    cargando.value = true;
    error.value = null;
    try {
      sustituciones.value = await listarSustituciones(modalidadId);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error.value = e.message || 'Error al cargar sustituciones';
    } finally {
      cargando.value = false;
    }
  }

  return {
    // Estado
    productos,
    modalidades,
    gruposOpciones,
    opciones,
    adicionales,
    opcionesIncluidas,
    sustituciones,
    cotizacion,
    cargando,
    error,
    // Computados
    productosActivos,
    modalidadesActivas,
    cotizacionExitosa,
    // Acciones
    cargarProductos,
    cargarModalidades,
    cargarGruposOpciones,
    cargarOpciones,
    cargarAdicionales,
    crearNuevoProducto,
    crearNuevaModalidad,
    crearNuevoGrupoOpciones,
    crearNuevaOpcion,
    crearNuevaSustitucion,
    crearNuevoAdicional,
    cotizar,
    cargarOpcionesIncluidas,
    cargarSustituciones,
  };
});
