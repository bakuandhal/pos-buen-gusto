import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { parseCurrency, formatCurrency } from '@/utils/currency';

export type Modalidad = 'en_mesa' | 'para_llevar';

export interface PlatoFixture {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number; // centavos
  modalidad: Modalidad;
  sopa: 'incluida' | 'omitida' | 'sustituida';
  proteina: string;
  principio: string;
  acompañamientos: string[];
  extras: string[];
  observaciones?: string;
  imagen?: string;
  disponible: boolean;
}

export interface MesaFixture {
  id: string;
  numero: number;
  estado: 'disponible' | 'ocupada' | 'pendiente';
  comensales: number;
  platos: PedidoPlato[];
  total: number; // centavos
  ultimaActualizacion: string;
}

export interface PedidoPlato {
  id: string;
  platoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number; // centavos
  subtotal: number; // centavos
  configuracion: {
    modalidad: Modalidad;
    sopa: 'incluida' | 'omitida' | 'sustituida';
    proteina: string;
    principio: string;
    acompañamientos: string[];
    extras: string[];
    observaciones?: string;
  };
  estado: 'borrador' | 'confirmado' | 'en_cocina' | 'cancelado';
}

export interface ModalidadTarifa {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number; // centavos
  incluyeSopa: boolean;
  disponible: boolean;
  opcionesIncluidas: string[];
}

export interface ComandaFixture {
  id: string;
  mesaId: string;
  mesaNumero: number;
  platos: PedidoPlato[];
  estado: 'borrador' | 'confirmado' | 'en_cocina' | 'servido' | 'cancelado';
  horaCreacion: string;
}

// ── Fixtures de platos ──
const PLATOS: PlatoFixture[] = [
  {
    id: 'plato-1',
    nombre: 'Almuerzo Completo',
    descripcion: 'Sopa, proteína, principio y acompañamientos',
    precioBase: parseCurrency('8.50'),
    modalidad: 'en_mesa',
    sopa: 'incluida',
    proteina: 'Pollo',
    principio: 'Arroz',
    acompañamientos: ['Ensalada', 'Plátano maduro'],
    extras: [],
    disponible: true,
  },
  {
    id: 'plato-2',
    nombre: 'Almuerzo Para Llevar',
    descripcion: 'Sin sopa, empaque individual',
    precioBase: parseCurrency('7.00'),
    modalidad: 'para_llevar',
    sopa: 'omitida',
    proteina: 'Res',
    principio: 'Papas',
    acompañamientos: ['Ensalada'],
    extras: ['Salsa hogao'],
    disponible: true,
  },
  {
    id: 'plato-3',
    nombre: 'Almuerzo Vegetariano',
    descripcion: 'Opción sin carne con sopa incluida',
    precioBase: parseCurrency('7.50'),
    modalidad: 'en_mesa',
    sopa: 'incluida',
    proteina: 'Tofu',
    principio: 'Quinoa',
    acompañamientos: ['Vegetales al vapor', 'Aguacate'],
    extras: [],
    disponible: true,
  },
  {
    id: 'plato-4',
    nombre: 'Almuerzo Ejecutivo',
    descripcion: 'Porción doble de proteína',
    precioBase: parseCurrency('11.00'),
    modalidad: 'en_mesa',
    sopa: 'incluida',
    proteina: 'Res',
    principio: 'Arroz',
    acompañamientos: ['Ensalada', 'Plátano maduro'],
    extras: ['Postre del día'],
    disponible: true,
  },
];

// ── Fixtures de mesas ──
const MESAS: MesaFixture[] = [
  {
    id: 'mesa-1',
    numero: 1,
    estado: 'disponible',
    comensales: 0,
    platos: [],
    total: 0,
    ultimaActualizacion: '',
  },
  {
    id: 'mesa-2',
    numero: 2,
    estado: 'ocupada',
    comensales: 2,
    platos: [
      {
        id: 'pedido-1',
        platoId: 'plato-1',
        nombre: 'Almuerzo Completo',
        cantidad: 2,
        precioUnitario: parseCurrency('8.50'),
        subtotal: parseCurrency('17.00'),
        configuracion: {
          modalidad: 'en_mesa',
          sopa: 'incluida',
          proteina: 'Pollo',
          principio: 'Arroz',
          acompañamientos: ['Ensalada', 'Plátano maduro'],
          extras: [],
        },
        estado: 'confirmado',
      },
    ],
    total: parseCurrency('17.00'),
    ultimaActualizacion: '12:14',
  },
  {
    id: 'mesa-3',
    numero: 3,
    estado: 'pendiente',
    comensales: 4,
    platos: [
      {
        id: 'pedido-2',
        platoId: 'plato-4',
        nombre: 'Almuerzo Ejecutivo',
        cantidad: 1,
        precioUnitario: parseCurrency('11.00'),
        subtotal: parseCurrency('11.00'),
        configuracion: {
          modalidad: 'en_mesa',
          sopa: 'incluida',
          proteina: 'Res',
          principio: 'Arroz',
          acompañamientos: ['Ensalada', 'Plátano maduro'],
          extras: ['Postre del día'],
        },
        estado: 'borrador',
      },
    ],
    total: parseCurrency('11.00'),
    ultimaActualizacion: '12:20',
  },
  {
    id: 'mesa-4',
    numero: 4,
    estado: 'disponible',
    comensales: 0,
    platos: [],
    total: 0,
    ultimaActualizacion: '',
  },
  {
    id: 'mesa-5',
    numero: 5,
    estado: 'ocupada',
    comensales: 1,
    platos: [
      {
        id: 'pedido-3',
        platoId: 'plato-2',
        nombre: 'Almuerzo Para Llevar',
        cantidad: 1,
        precioUnitario: parseCurrency('7.00'),
        subtotal: parseCurrency('7.00'),
        configuracion: {
          modalidad: 'para_llevar',
          sopa: 'omitida',
          proteina: 'Res',
          principio: 'Papas',
          acompañamientos: ['Ensalada'],
          extras: ['Salsa hogao'],
        },
        estado: 'en_cocina',
      },
    ],
    total: parseCurrency('7.00'),
    ultimaActualizacion: '12:05',
  },
  {
    id: 'mesa-6',
    numero: 6,
    estado: 'disponible',
    comensales: 0,
    platos: [],
    total: 0,
    ultimaActualizacion: '',
  },
];

// ── Fixtures de modalidades y tarifas ──
const MODALIDADES: ModalidadTarifa[] = [
  {
    id: 'mod-1',
    nombre: 'Almuerzo Completo en Mesa',
    descripcion: 'Sopa incluida, servicio en mesa',
    precio: parseCurrency('8.50'),
    incluyeSopa: true,
    disponible: true,
    opcionesIncluidas: ['Sopa', 'Proteína', 'Principio', 'Acompañamientos'],
  },
  {
    id: 'mod-2',
    nombre: 'Almuerzo Para Llevar',
    descripcion: 'Sin sopa, empaque individual',
    precio: parseCurrency('7.00'),
    incluyeSopa: false,
    disponible: true,
    opcionesIncluidas: ['Proteína', 'Principio', 'Acompañamientos'],
  },
  {
    id: 'mod-3',
    nombre: 'Almuerzo Vegetariano',
    descripcion: 'Sopa incluida, opción sin carne',
    precio: parseCurrency('7.50'),
    incluyeSopa: true,
    disponible: true,
    opcionesIncluidas: ['Sopa', 'Proteína vegetal', 'Principio', 'Acompañamientos'],
  },
  {
    id: 'mod-4',
    nombre: 'Almuerzo Ejecutivo',
    descripcion: 'Porción doble de proteína',
    precio: parseCurrency('11.00'),
    incluyeSopa: true,
    disponible: true,
    opcionesIncluidas: ['Sopa', 'Proteína (doble)', 'Principio', 'Acompañamientos'],
  },
];

export const useDemoStore = defineStore('demo', () => {
  // ── Estado ──
  const mesas = ref<MesaFixture[]>([...MESAS]);
  const platos = ref<PlatoFixture[]>([...PLATOS]);
  const modalidades = ref<ModalidadTarifa[]>([...MODALIDADES]);
  const comandas = ref<ComandaFixture[]>([]);
  const modalAbierta = ref<{
    tipo: 'mesa' | 'plato' | 'modalidad' | null;
    id: string | null;
    origen: HTMLElement | null;
  }>({ tipo: null, id: null, origen: null });
  const notificaciones = ref<
    {
      id: string;
      tipo: 'exito' | 'error' | 'info';
      mensaje: string;
      duracion?: number;
    }[]
  >([]);

  // ── Computados ──
  const mesasDisponibles = computed(() => mesas.value.filter((m) => m.estado === 'disponible'));
  const mesasOcupadas = computed(() => mesas.value.filter((m) => m.estado === 'ocupada'));
  const mesasPendientes = computed(() => mesas.value.filter((m) => m.estado === 'pendiente'));
  const platosDisponibles = computed(() => platos.value.filter((p) => p.disponible));
  const totalServicio = computed(() => mesas.value.reduce((sum, m) => sum + m.total, 0));

  // ── Acciones ──
  function abrirModal(
    tipo: 'mesa' | 'plato' | 'modalidad',
    id: string,
    origen: HTMLElement | null
  ) {
    modalAbierta.value = { tipo, id, origen };
  }

  function cerrarModal() {
    modalAbierta.value = { tipo: null, id: null, origen: null };
  }

  function agregarPlatoAMesa(mesaId: string, plato: PedidoPlato) {
    const mesa = mesas.value.find((m) => m.id === mesaId);
    if (!mesa) return;
    mesa.platos.push(plato);
    mesa.total = mesa.platos.reduce((sum, p) => sum + p.subtotal, 0);
    mesa.estado = 'ocupada';
    mesa.ultimaActualizacion = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    mostrarNotificacion('Plato agregado al pedido', 'exito');
  }

  function removerPlatoDeMesa(mesaId: string, pedidoPlatoId: string) {
    const mesa = mesas.value.find((m) => m.id === mesaId);
    if (!mesa) return;
    mesa.platos = mesa.platos.filter((p) => p.id !== pedidoPlatoId);
    mesa.total = mesa.platos.reduce((sum, p) => sum + p.subtotal, 0);
    if (mesa.platos.length === 0) {
      mesa.estado = 'disponible';
      mesa.comensales = 0;
      mesa.ultimaActualizacion = '';
    }
    mostrarNotificacion('Plato removido del pedido', 'info');
  }

  function cambiarEstadoMesa(mesaId: string, estado: MesaFixture['estado']) {
    const mesa = mesas.value.find((m) => m.id === mesaId);
    if (mesa) {
      mesa.estado = estado;
    }
  }

  function crearComanda(mesaId: string) {
    const mesa = mesas.value.find((m) => m.id === mesaId);
    if (!mesa || mesa.platos.length === 0) return;
    const comanda: ComandaFixture = {
      id: `comanda-${Date.now()}`,
      mesaId,
      mesaNumero: mesa.numero,
      platos: [...mesa.platos.map((p) => ({ ...p }))],
      estado: 'confirmado',
      horaCreacion: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    comandas.value.push(comanda);
    mostrarNotificacion(`Comanda ${comanda.id} enviada a cocina`, 'exito');
  }

  function cambiarEstadoComanda(comandaId: string, estado: ComandaFixture['estado']) {
    const comanda = comandas.value.find((c) => c.id === comandaId);
    if (comanda) {
      comanda.estado = estado;
    }
  }

  function mostrarNotificacion(mensaje: string, tipo: 'exito' | 'error' | 'info', duracion = 4000) {
    const id = `notif-${Date.now()}`;
    notificaciones.value.push({ id, tipo, mensaje, duracion });
    setTimeout(() => {
      notificaciones.value = notificaciones.value.filter((n) => n.id !== id);
    }, duracion);
  }

  function formatearMoneda(centavos: number): string {
    return formatCurrency(centavos);
  }

  return {
    // Estado
    mesas,
    platos,
    modalidades,
    comandas,
    modalAbierta,
    notificaciones,
    // Computados
    mesasDisponibles,
    mesasOcupadas,
    mesasPendientes,
    platosDisponibles,
    totalServicio,
    // Acciones
    abrirModal,
    cerrarModal,
    agregarPlatoAMesa,
    removerPlatoDeMesa,
    cambiarEstadoMesa,
    crearComanda,
    cambiarEstadoComanda,
    mostrarNotificacion,
    formatearMoneda,
  };
});
