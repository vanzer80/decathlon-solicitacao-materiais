import DataLoader from "dataloader";
import { getDb } from "../db";
import { materialItems, materialRequests } from "../../drizzle/schema";
import { eq, or } from "drizzle-orm";

/**
 * DataLoader para evitar N+1 queries ao buscar itens de múltiplas solicitações
 * Agrupa múltiplas requisições de itens em uma única query
 */
export class DataLoaderService {
  private materialItemsLoader: DataLoader<string, any[]>;
  private materialRequestLoader: DataLoader<string, any>;

  constructor() {
    // Loader para buscar itens de múltiplas solicitações
    this.materialItemsLoader = new DataLoader(async (requestIds: readonly string[]) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Busca todos os itens em uma única query
      const requestIdArray = Array.from(requestIds);
      const conditions = requestIdArray.map((id) => eq(materialItems.requestId, id));
      const allItems = await db
        .select()
        .from(materialItems)
        .where(conditions.length > 0 ? or(...conditions) : undefined);

      // Agrupa itens por requestId
      const itemsByRequestId = new Map<string, any[]>();
      for (const requestId of requestIds) {
        itemsByRequestId.set(requestId, []);
      }

      for (const item of allItems) {
        const items = itemsByRequestId.get(item.requestId);
        if (items) {
          items.push(item);
        }
      }

      // Retorna na mesma ordem das requestIds
      return requestIds.map((requestId) => itemsByRequestId.get(requestId) || []);
    });

    // Loader para buscar solicitações por ID
    this.materialRequestLoader = new DataLoader(async (requestIds: readonly string[]) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Busca todas as solicitações em uma única query
      const requestIdArray = Array.from(requestIds);
      const conditions = requestIdArray.map((id) => eq(materialRequests.requestId, id));
      const requests = await db
        .select()
        .from(materialRequests)
        .where(conditions.length > 0 ? or(...conditions) : undefined);

      // Cria mapa para lookup rápido
      const requestMap = new Map<string, any>();
      for (const request of requests) {
        requestMap.set(request.requestId, request);
      }

      // Retorna na mesma ordem das requestIds
      return requestIds.map((requestId) => requestMap.get(requestId) || null);
    });
  }

  /**
   * Busca itens de uma solicitação (com batching)
   */
  async loadMaterialItems(requestId: string) {
    return this.materialItemsLoader.load(requestId);
  }

  /**
   * Busca múltiplos itens em batch
   */
  async loadMaterialItemsBatch(requestIds: string[]) {
    return Promise.all(
      requestIds.map((requestId) => this.materialItemsLoader.load(requestId))
    );
  }

  /**
   * Busca uma solicitação por ID (com batching)
   */
  async loadMaterialRequest(requestId: string) {
    return this.materialRequestLoader.load(requestId);
  }

  /**
   * Busca múltiplas solicitações em batch
   */
  async loadMaterialRequestsBatch(requestIds: string[]) {
    return Promise.all(
      requestIds.map((requestId) => this.materialRequestLoader.load(requestId))
    );
  }

  /**
   * Limpa o cache dos loaders
   * Útil após mutações
   */
  clearCache() {
    this.materialItemsLoader.clearAll();
    this.materialRequestLoader.clearAll();
  }

  /**
   * Invalida cache de uma solicitação específica
   */
  invalidateRequest(requestId: string) {
    this.materialItemsLoader.clear(requestId);
    this.materialRequestLoader.clear(requestId);
  }
}

// Singleton para reutilizar a mesma instância
let dataLoaderInstance: DataLoaderService | null = null;

export function getDataLoader(): DataLoaderService {
  if (!dataLoaderInstance) {
    dataLoaderInstance = new DataLoaderService();
  }
  return dataLoaderInstance;
}

export function resetDataLoader() {
  dataLoaderInstance = null;
}
