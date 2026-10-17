import { FastifyInstance } from 'fastify';
import { pricingQuoteRequestSchema, type PricingQuoteRequest } from './schemas';
import { cotizarPrecio, PrecioValidacionError } from './service';

export async function pricingRoutes(app: FastifyInstance) {
  // POST /api/v1/pricing/quote - Cotizar precio de un producto configurado
  app.post('/quote', async (request, reply) => {
    try {
      const parseResult = pricingQuoteRequestSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'validacion_fallida',
          message: 'Datos de entrada inválidos',
        });
      }

      const cotizacion = await cotizarPrecio(parseResult.data as PricingQuoteRequest);
      return reply.status(200).send(cotizacion);
    } catch (error) {
      if (error instanceof PrecioValidacionError) {
        return reply.status(400).send({
          error: error.codigo,
          message: error.message,
          detalles: error.detalles,
        });
      }
      throw error;
    }
  });
}
