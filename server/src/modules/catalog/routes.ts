import { FastifyInstance } from 'fastify';
import {
  productoCreateSchema,
  productoUpdateSchema,
  modalidadCreateSchema,
  modalidadUpdateSchema,
  grupoOpcionesCreateSchema,
  grupoOpcionesUpdateSchema,
  opcionCreateSchema,
  opcionUpdateSchema,
  opcionIncluidaCreateSchema,
  sustitucionCreateSchema,
  sustitucionUpdateSchema,
  adicionalCreateSchema,
  adicionalUpdateSchema,
  type ProductoCreateInput,
  type ProductoUpdateInput,
  type ModalidadCreateInput,
  type ModalidadUpdateInput,
  type GrupoOpcionesCreateInput,
  type GrupoOpcionesUpdateInput,
  type OpcionCreateInput,
  type OpcionUpdateInput,
  type OpcionIncluidaCreateInput,
  type SustitucionCreateInput,
  type SustitucionUpdateInput,
  type AdicionalCreateInput,
  type AdicionalUpdateInput,
} from './schemas';
import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  listarModalidades,
  obtenerModalidad,
  crearModalidad,
  actualizarModalidad,
  listarGruposOpciones,
  crearGrupoOpciones,
  actualizarGrupoOpciones,
  listarOpciones,
  crearOpcion,
  actualizarOpcion,
  agregarOpcionIncluida,
  listarOpcionesIncluidas,
  crearSustitucion,
  listarSustituciones,
  actualizarSustitucion,
  listarAdicionales,
  crearAdicional,
  actualizarAdicional,
} from './service';

export async function catalogRoutes(app: FastifyInstance) {
  const requireAdmin = (app as any).requirePermission('configurar_precios');

  // ── Productos ──
  app.get('/productos', async (_request, reply) => {
    const productos = await listarProductos();
    return reply.send(productos);
  });

  app.get('/productos/:id', async (request, reply) => {
    const id = Number((request.params as any).id);
    const producto = await obtenerProducto(id);
    if (!producto) {
      return reply
        .status(404)
        .send({ error: 'producto_no_encontrado', message: 'Producto no encontrado' });
    }
    return reply.send(producto);
  });

  app.post('/productos', { preHandler: requireAdmin }, async (request, reply) => {
    const parseResult = productoCreateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send({ error: 'validacion_fallida', message: 'Datos de entrada inválidos' });
    }
    const producto = await crearProducto(parseResult.data as ProductoCreateInput);
    return reply.status(201).send(producto);
  });

  app.put('/productos/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const parseResult = productoUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send({ error: 'validacion_fallida', message: 'Datos de entrada inválidos' });
    }
    const producto = await actualizarProducto(id, parseResult.data as ProductoUpdateInput);
    if (!producto) {
      return reply
        .status(404)
        .send({ error: 'producto_no_encontrado', message: 'Producto no encontrado' });
    }
    return reply.send(producto);
  });

  app.delete('/productos/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const producto = await desactivarProducto(id);
    if (!producto) {
      return reply
        .status(404)
        .send({ error: 'producto_no_encontrado', message: 'Producto no encontrado' });
    }
    return reply.send({ message: 'Producto desactivado' });
  });

  // ── Modalidades ──
  app.get('/modalidades', async (request, reply) => {
    const productoId = (request.query as any).productoId
      ? Number((request.query as any).productoId)
      : undefined;
    const modalidades = await listarModalidades(productoId);
    return reply.send(modalidades);
  });

  app.get('/modalidades/:id', async (request, reply) => {
    const id = Number((request.params as any).id);
    const modalidad = await obtenerModalidad(id);
    if (!modalidad) {
      return reply
        .status(404)
        .send({ error: 'modalidad_no_encontrada', message: 'Modalidad no encontrada' });
    }
    return reply.send(modalidad);
  });

  app.post('/modalidades', { preHandler: requireAdmin }, async (request, reply) => {
    const parseResult = modalidadCreateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send({ error: 'validacion_fallida', message: 'Datos de entrada inválidos' });
    }
    const modalidad = await crearModalidad(parseResult.data as ModalidadCreateInput);
    return reply.status(201).send(modalidad);
  });

  app.put('/modalidades/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const parseResult = modalidadUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send({ error: 'validacion_fallida', message: 'Datos de entrada inválidos' });
    }
    const modalidad = await actualizarModalidad(id, parseResult.data as ModalidadUpdateInput);
    if (!modalidad) {
      return reply
        .status(404)
        .send({ error: 'modalidad_no_encontrada', message: 'Modalidad no encontrada' });
    }
    return reply.send(modalidad);
  });

  // ── Grupos de Opciones ──
  app.get('/grupos-opciones', async (request, reply) => {
    const productoId = (request.query as any).productoId
      ? Number((request.query as any).productoId)
      : undefined;
    const grupos = await listarGruposOpciones(productoId);
    return reply.send(grupos);
  });

  app.post('/grupos-opciones', { preHandler: requireAdmin }, async (request, reply) => {
    const parseResult = grupoOpcionesCreateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send({ error: 'validacion_fallida', message: 'Datos de entrada inválidos' });
    }
    const grupo = await crearGrupoOpciones(parseResult.data as GrupoOpcionesCreateInput);
    return reply.status(201).send(grupo);
  });

  app.put('/grupos-opciones/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const parseResult = grupoOpcionesUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send({ error: 'validacion_fallida', message: 'Datos de entrada inválidos' });
    }
    const grupo = await actualizarGrupoOpciones(id, parseResult.data as GrupoOpcionesUpdateInput);
    if (!grupo) {
      return reply
        .status(404)
        .send({ error: 'grupo_no_encontrado', message: 'Grupo de opciones no encontrado' });
    }
    return reply.send(grupo);
  });

  // ── Opciones ──
  app.get('/opciones', async (request, reply) => {
    const grupoId = (request.query as any).grupoId
      ? Number((request.query as any).grupoId)
      : undefined;
    const opciones = await listarOpciones(grupoId);
    return reply.send(opciones);
  });

  app.post('/opciones', { preHandler: requireAdmin }, async (request, reply) => {
    const parseResult = opcionCreateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send({ error: 'validacion_fallida', message: 'Datos de entrada inválidos' });
    }
    const opcion = await crearOpcion(parseResult.data as OpcionCreateInput);
    return reply.status(201).send(opcion);
  });

  app.put('/opciones/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const parseResult = opcionUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send({ error: 'validacion_fallida', message: 'Datos de entrada inválidos' });
    }
    const opcion = await actualizarOpcion(id, parseResult.data as OpcionUpdateInput);
    if (!opcion) {
      return reply
        .status(404)
        .send({ error: 'opcion_no_encontrada', message: 'Opción no encontrada' });
    }
    return reply.send(opcion);
  });

  // ── Opciones Incluidas en Modalidad ──
  app.get('/modalidades/:modalidadId/opciones-incluidas', async (request, reply) => {
    const modalidadId = Number((request.params as any).modalidadId);
    const opcionesIncluidas = await listarOpcionesIncluidas(modalidadId);
    return reply.send(opcionesIncluidas);
  });

  app.post(
    '/modalidades/:modalidadId/opciones-incluidas',
    { preHandler: requireAdmin },
    async (request, reply) => {
      const parseResult = opcionIncluidaCreateSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply
          .status(400)
          .send({ error: 'validacion_fallida', message: 'Datos de entrada inválidos' });
      }
      const incluida = await agregarOpcionIncluida(parseResult.data as OpcionIncluidaCreateInput);
      return reply.status(201).send(incluida);
    }
  );

  // ── Sustituciones ──
  app.get('/modalidades/:modalidadId/sustituciones', async (request, reply) => {
    const modalidadId = Number((request.params as any).modalidadId);
    const sustituciones = await listarSustituciones(modalidadId);
    return reply.send(sustituciones);
  });

  app.post('/sustituciones', { preHandler: requireAdmin }, async (request, reply) => {
    const parseResult = sustitucionCreateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send({ error: 'validacion_fallida', message: 'Datos de entrada inválidos' });
    }
    const sustitucion = await crearSustitucion(parseResult.data as SustitucionCreateInput);
    return reply.status(201).send(sustitucion);
  });

  app.put('/sustituciones/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const parseResult = sustitucionUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send({ error: 'validacion_fallida', message: 'Datos de entrada inválidos' });
    }
    const sustitucion = await actualizarSustitucion(id, parseResult.data as SustitucionUpdateInput);
    if (!sustitucion) {
      return reply
        .status(404)
        .send({ error: 'sustitucion_no_encontrada', message: 'Sustitución no encontrada' });
    }
    return reply.send(sustitucion);
  });

  // ── Adicionales ──
  app.get('/adicionales', async (request, reply) => {
    const productoId = (request.query as any).productoId
      ? Number((request.query as any).productoId)
      : undefined;
    const adicionales = await listarAdicionales(productoId);
    return reply.send(adicionales);
  });

  app.post('/adicionales', { preHandler: requireAdmin }, async (request, reply) => {
    const parseResult = adicionalCreateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send({ error: 'validacion_fallida', message: 'Datos de entrada inválidos' });
    }
    const adicional = await crearAdicional(parseResult.data as AdicionalCreateInput);
    return reply.status(201).send(adicional);
  });

  app.put('/adicionales/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const id = Number((request.params as any).id);
    const parseResult = adicionalUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send({ error: 'validacion_fallida', message: 'Datos de entrada inválidos' });
    }
    const adicional = await actualizarAdicional(id, parseResult.data as AdicionalUpdateInput);
    if (!adicional) {
      return reply
        .status(404)
        .send({ error: 'adicional_no_encontrado', message: 'Adicional no encontrado' });
    }
    return reply.send(adicional);
  });
}
