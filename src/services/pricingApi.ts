const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  orden_presentacion: number;
  esta_activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Modalidad {
  id: number;
  producto_id: number;
  nombre: string;
  descripcion: string | null;
  precio_base_centavos: number;
  incluye_sopa: boolean;
  esta_activo: boolean;
  disponible_desde: string | null;
  disponible_hasta: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface GrupoOpciones {
  id: number;
  producto_id: number;
  nombre: string;
  descripcion: string | null;
  es_obligatorio: boolean;
  cantidad_minima: number;
  cantidad_maxima: number;
  permite_varias_elecciones: boolean;
  esta_activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Opcion {
  id: number;
  grupo_id: number;
  nombre: string;
  descripcion: string | null;
  esta_activo: boolean;
  orden_presentacion: number;
  creado_en: string;
  actualizado_en: string;
}

export interface OpcionIncluida {
  id: number;
  modalidad_id: number;
  opcion_id: number;
  creado_en: string;
}

export interface Sustitucion {
  id: number;
  modalidad_id: number;
  opcion_original_id: number;
  opcion_sustituta_id: number;
  ajuste_precio_centavos: number;
  esta_activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Adicional {
  id: number;
  producto_id: number;
  nombre: string;
  descripcion: string | null;
  precio_centavos: number;
  esta_activo: boolean;
  cantidad_maxima: number;
  creado_en: string;
  actualizado_en: string;
}

export interface PricingQuoteRequest {
  productoId: number;
  modalidadId: number;
  opcionesSeleccionadas: number[];
  sustituciones: { opcionOriginalId: number; opcionSustitutaId: number }[];
  adicionales: { adicionalId: number; cantidad: number }[];
}

export interface PricingQuoteResponse {
  productoId: number;
  productoNombre: string;
  modalidadId: number;
  modalidadNombre: string;
  precioBaseCentavos: number;
  opcionesIncluidas: { opcionId: number; nombre: string }[];
  sustitucionesAplicadas: {
    opcionOriginalId: number;
    opcionOriginalNombre: string;
    opcionSustitutaId: number;
    opcionSustitutaNombre: string;
    ajustePrecioCentavos: number;
  }[];
  adicionales: {
    adicionalId: number;
    nombre: string;
    precioUnitarioCentavos: number;
    cantidad: number;
    subtotalCentavos: number;
  }[];
  totalCentavos: number;
}

// ── Productos ──
export async function listarProductos(): Promise<Producto[]> {
  return request('/api/v1/catalog/productos');
}

export async function obtenerProducto(id: number): Promise<Producto> {
  return request(`/api/v1/catalog/productos/${id}`);
}

export async function crearProducto(data: {
  nombre: string;
  descripcion?: string;
  ordenPresentacion?: number;
}): Promise<Producto> {
  return request('/api/v1/catalog/productos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function actualizarProducto(
  id: number,
  data: { nombre?: string; descripcion?: string; ordenPresentacion?: number; estaActivo?: boolean }
): Promise<Producto> {
  return request(`/api/v1/catalog/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function desactivarProducto(id: number): Promise<void> {
  return request(`/api/v1/catalog/productos/${id}`, {
    method: 'DELETE',
  });
}

// ── Modalidades ──
export async function listarModalidades(productoId?: number): Promise<Modalidad[]> {
  const query = productoId ? `?productoId=${productoId}` : '';
  return request(`/api/v1/catalog/modalidades${query}`);
}

export async function obtenerModalidad(id: number): Promise<Modalidad> {
  return request(`/api/v1/catalog/modalidades/${id}`);
}

export async function crearModalidad(data: {
  productoId: number;
  nombre: string;
  descripcion?: string;
  precioBaseCentavos: number;
  incluyeSopa?: boolean;
}): Promise<Modalidad> {
  return request('/api/v1/catalog/modalidades', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function actualizarModalidad(
  id: number,
  data: {
    nombre?: string;
    descripcion?: string;
    precioBaseCentavos?: number;
    incluyeSopa?: boolean;
    estaActivo?: boolean;
  }
): Promise<Modalidad> {
  return request(`/api/v1/catalog/modalidades/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Grupos de Opciones ──
export async function listarGruposOpciones(productoId?: number): Promise<GrupoOpciones[]> {
  const query = productoId ? `?productoId=${productoId}` : '';
  return request(`/api/v1/catalog/grupos-opciones${query}`);
}

export async function crearGrupoOpciones(data: {
  productoId: number;
  nombre: string;
  descripcion?: string;
  esObligatorio?: boolean;
  cantidadMinima?: number;
  cantidadMaxima?: number;
  permiteVariasElecciones?: boolean;
}): Promise<GrupoOpciones> {
  return request('/api/v1/catalog/grupos-opciones', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Opciones ──
export async function listarOpciones(grupoId?: number): Promise<Opcion[]> {
  const query = grupoId ? `?grupoId=${grupoId}` : '';
  return request(`/api/v1/catalog/opciones${query}`);
}

export async function crearOpcion(data: {
  grupoId: number;
  nombre: string;
  descripcion?: string;
  ordenPresentacion?: number;
}): Promise<Opcion> {
  return request('/api/v1/catalog/opciones', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Opciones Incluidas ──
export async function listarOpcionesIncluidas(modalidadId: number): Promise<OpcionIncluida[]> {
  return request(`/api/v1/catalog/modalidades/${modalidadId}/opciones-incluidas`);
}

export async function agregarOpcionIncluida(
  modalidadId: number,
  opcionId: number
): Promise<OpcionIncluida> {
  return request(`/api/v1/catalog/modalidades/${modalidadId}/opciones-incluidas`, {
    method: 'POST',
    body: JSON.stringify({ modalidadId, opcionId }),
  });
}

// ── Sustituciones ──
export async function listarSustituciones(modalidadId: number): Promise<Sustitucion[]> {
  return request(`/api/v1/catalog/modalidades/${modalidadId}/sustituciones`);
}

export async function crearSustitucion(data: {
  modalidadId: number;
  opcionOriginalId: number;
  opcionSustitutaId: number;
  ajustePrecioCentavos?: number;
}): Promise<Sustitucion> {
  return request('/api/v1/catalog/sustituciones', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Adicionales ──
export async function listarAdicionales(productoId?: number): Promise<Adicional[]> {
  const query = productoId ? `?productoId=${productoId}` : '';
  return request(`/api/v1/catalog/adicionales${query}`);
}

export async function crearAdicional(data: {
  productoId: number;
  nombre: string;
  descripcion?: string;
  precioCentavos: number;
  cantidadMaxima?: number;
}): Promise<Adicional> {
  return request('/api/v1/catalog/adicionales', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Cotización de precios ──
export async function cotizarPrecio(data: PricingQuoteRequest): Promise<PricingQuoteResponse> {
  return request('/api/v1/pricing/quote', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
