/**
 * Serviço de Lojas com Cache
 * Lê a aba "Lojas" da planilha Google Sheets via Apps Script
 * Cache TTL: 5 minutos
 */

// Nota: URL do Apps Script e token são hardcoded aqui
// Em produção, considere mover para variáveis de ambiente

interface Store {
  loja_id: string;
  loja_label: string;
}

interface StoresResponse {
  ok: boolean;
  stores?: Store[];
  error?: string;
  updatedAt?: string;
  count?: number;
}

interface CacheEntry {
  data: StoresResponse;
  timestamp: number;
}

// Cache em memória
let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Obter lista de lojas com cache
 * Fallback para última resposta válida se houver erro
 */
export async function getStores(): Promise<StoresResponse> {
  const now = Date.now();

  // Verificar cache válido
  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    console.log('[Stores] Cache HIT - retornando lojas em cache');
    return cache.data;
  }

  try {
    console.log('[Stores] Cache MISS - buscando do Apps Script');
    const response = await fetchStoresFromAppsScript();

    // Validar resposta
    if (response.ok && response.stores) {
      // Armazenar em cache
      cache = {
        data: response,
        timestamp: now,
      };
      console.log(`[Stores] ${response.count || 0} lojas carregadas e cacheadas`);
      return response;
    }

    // Se resposta não OK mas temos cache, retornar cache mesmo expirado
    if (cache) {
      console.warn('[Stores] Erro ao buscar, retornando cache expirado como fallback');
      return cache.data;
    }

    // Sem cache e erro
    return {
      ok: false,
      error: response.error || 'Erro desconhecido ao buscar lojas',
    };
  } catch (error) {
    console.error('[Stores] Erro ao buscar lojas:', error);

    // Fallback para cache expirado
    if (cache) {
      console.warn('[Stores] Erro na requisição, retornando cache expirado como fallback');
      return cache.data;
    }

    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar lojas',
    };
  }
}

/**
 * Buscar lojas do Apps Script
 */
async function fetchStoresFromAppsScript(): Promise<StoresResponse> {
  // URL oficial do Apps Script Web App (source of truth)
  const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbzdonIA5DxB4s2fwlZphru10RSDRPxKeG_p61zn0h0CPt6EDOf4_WBO3QStGwmhZchW/exec';
  const token = 'DECATHLON-2026';

  // Construir URL com parâmetros
  const url = new URL(appsScriptUrl);
  url.searchParams.set('action', 'stores');
  url.searchParams.set('token', token);

  console.log('[Stores] Requisição para:', url.toString().replace(token, '***'));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Token': token,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Stores] Resposta do Apps Script:', errorText.substring(0, 200));
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data: StoresResponse = await response.json();
  return data;
}

/**
 * Limpar cache manualmente (útil para testes)
 */
export function clearStoresCache(): void {
  cache = null;
  console.log('[Stores] Cache limpo manualmente');
}

/**
 * Obter informações do cache (debug)
 */
export function getCacheInfo(): { cached: boolean; age?: number; ttl: number } {
  if (!cache) {
    return { cached: false, ttl: CACHE_TTL_MS };
  }

  const age = Date.now() - cache.timestamp;
  const isValid = age < CACHE_TTL_MS;

  return {
    cached: isValid,
    age: isValid ? age : undefined,
    ttl: CACHE_TTL_MS,
  };
}
