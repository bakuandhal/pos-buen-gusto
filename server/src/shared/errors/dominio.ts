/**
 * Errores de dominio del servicio de pedidos.
 *
 * Se distinguen del error genérico del servidor para poder devolver
 * respuestas HTTP con el código correcto y un mensaje útil,
 * sin exponer trazas ni detalles internos.
 */
export class ErrorNegocio extends Error {
  public codigo: string;
  public statusCode: number;
  public detalles: Record<string, string>[];

  constructor(
    codigo: string,
    mensaje: string,
    statusCode: number = 400,
    detalles: Record<string, string>[] = []
  ) {
    super(mensaje);
    this.name = 'ErrorNegocio';
    this.codigo = codigo;
    this.statusCode = statusCode;
    this.detalles = detalles;
  }
}

export class PedidoNoEncontradoError extends ErrorNegocio {
  constructor(id: number) {
    super('pedido_no_encontrado', `El pedido ${id} no existe`, 404, [
      { campo: 'pedidoId', valor: String(id), problema: 'no existe' },
    ]);
  }
}

export class PlatoNoEncontradoError extends ErrorNegocio {
  constructor(id: number) {
    super('plato_no_encontrado', `El plato ${id} no existe`, 404, [
      { campo: 'platoId', valor: String(id), problema: 'no existe' },
    ]);
  }
}

export class MesaNoEncontradaError extends ErrorNegocio {
  constructor(id: number) {
    super('mesa_no_encontrada', `La mesa ${id} no existe`, 404, [
      { campo: 'mesaId', valor: String(id), problema: 'no existe' },
    ]);
  }
}

export class MesaNumeroDuplicadoError extends ErrorNegocio {
  constructor(numero: number) {
    super('mesa_duplicada', `Ya existe una mesa con el número ${numero}`, 409, [
      { campo: 'numero', valor: String(numero), problema: 'ya existe' },
    ]);
  }
}

export class MesaConPedidoAbiertoError extends ErrorNegocio {
  constructor(id: number) {
    super(
      'mesa_con_pedido_abierto',
      `La mesa ${id} tiene un pedido abierto y no puede desactivarse`,
      409,
      [{ campo: 'mesaId', valor: String(id), problema: 'pedido abierto' }]
    );
  }
}

export class MesaOcupadaError extends ErrorNegocio {
  constructor(id: number) {
    super('mesa_ocupada', `La mesa ${id} ya tiene un servicio abierto`, 409, [
      { campo: 'mesaId', valor: String(id), problema: 'ya tiene un pedido abierto' },
    ]);
  }
}

export class PedidoNoEditableError extends ErrorNegocio {
  constructor(id: number, estado: string) {
    super(
      'pedido_no_editable',
      `El pedido ${id} está en estado "${estado}" y no admite cambios`,
      409,
      [{ campo: 'pedidoId', valor: String(id), problema: `estado ${estado}` }]
    );
  }
}

export class PlatoNoEditableError extends ErrorNegocio {
  constructor(id: number, estado: string) {
    super(
      'plato_no_editable',
      `El plato ${id} ya fue enviado a cocina y no puede modificarse`,
      409,
      [{ campo: 'platoId', valor: String(id), problema: `estado ${estado}` }]
    );
  }
}

export class ComandaNoEncontradaError extends ErrorNegocio {
  constructor(id: number) {
    super('comanda_no_encontrada', `La comanda ${id} no existe`, 404, [
      { campo: 'comandaId', valor: String(id), problema: 'no existe' },
    ]);
  }
}

export class SinPlatosParaEnviarError extends ErrorNegocio {
  constructor(id: number) {
    super('sin_platos_para_enviar', `El pedido ${id} no tiene platos pendientes de enviar`, 409, [
      { campo: 'pedidoId', valor: String(id), problema: 'no hay platos en borrador' },
    ]);
  }
}

export class TransicionInvalidaError extends ErrorNegocio {
  constructor(estadoActual: string, estadoDestino: string) {
    super(
      'transicion_invalida',
      `No se puede pasar de "${estadoActual}" a "${estadoDestino}"`,
      409,
      [{ campo: 'estado', valor: estadoDestino, problema: `estado actual ${estadoActual}` }]
    );
  }
}
