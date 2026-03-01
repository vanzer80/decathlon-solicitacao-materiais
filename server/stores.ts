import { Express, Request, Response } from 'express';
import { getStores } from './services/storesService';

/**
 * Endpoint REST para carregar lojas
 * GET /api/stores
 * Retorna: { ok: boolean, stores: [{loja_id, loja_label}], updatedAt, count }
 */
export function setupStoresEndpoint(app: Express) {
  app.get('/api/stores', async (req: Request, res: Response) => {
    try {
      console.log('[API] GET /api/stores');
      
      const result = await getStores();
      
      // Sempre retorna JSON com status 200, mesmo em erro
      // (para frontend tratar ok: false)
      res.json(result);
    } catch (error: any) {
      console.error('[API] Erro em /api/stores:', error);
      res.json({
        ok: false,
        error: error.message || 'Erro ao carregar lojas',
      });
    }
  });
}
