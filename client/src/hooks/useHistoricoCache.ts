import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

/**
 * Hook para gerenciar cache de histórico
 * Fornece métodos para invalidar, prefetch e gerenciar dados em cache
 */
export function useHistoricoCache() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  /**
   * Prefetch lista de solicitações
   * Carrega dados em background antes do usuário acessar
   */
  const prefetchLista = async (params: {
    pagina?: number;
    limite?: number;
    ordenarPor?: "data_desc" | "data_asc" | "loja";
  } = {}) => {
    await queryClient.prefetchQuery({
      queryKey: [["historico", "listar"], { type: "query", input: params }],
      queryFn: () => utils.historico.listar.fetch(params),
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  };

  /**
   * Prefetch detalhe de uma solicitação
   */
  const prefetchDetalhe = async (requestId: string) => {
    await queryClient.prefetchQuery({
      queryKey: [
        ["historico", "detalhe"],
        { type: "query", input: { request_id: requestId } },
      ],
      queryFn: () => utils.historico.detalhe.fetch({ request_id: requestId }),
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  };

  /**
   * Invalida cache de lista
   * Força refetch na próxima vez que o componente renderizar
   */
  const invalidateLista = () => {
    utils.historico.listar.invalidate();
  };

  /**
   * Invalida cache de detalhe
   */
  const invalidateDetalhe = (requestId: string) => {
    queryClient.invalidateQueries({
      queryKey: [
        ["historico", "detalhe"],
        { type: "query", input: { request_id: requestId } },
      ],
    });
  };

  /**
   * Invalida cache de contagem
   */
  const invalidateContar = () => {
    utils.historico.contar.invalidate();
  };

  /**
   * Invalida todo o cache de histórico
   */
  const invalidateAll = () => {
    utils.historico.invalidate();
  };

  /**
   * Remove dados em cache de uma página específica
   */
  const removeLista = (pagina: number = 1) => {
    queryClient.removeQueries({
      queryKey: [
        ["historico", "listar"],
        { type: "query", input: { pagina } },
      ],
    });
  };

  /**
   * Obtém dados em cache da lista
   */
  const getLista = (pagina: number = 1) => {
    return queryClient.getQueryData([
      ["historico", "listar"],
      { type: "query", input: { pagina } },
    ]);
  };

  /**
   * Obtém dados em cache do detalhe
   */
  const getDetalhe = (requestId: string) => {
    return queryClient.getQueryData([
      ["historico", "detalhe"],
      { type: "query", input: { request_id: requestId } },
    ]);
  };

  /**
   * Atualiza dados em cache da lista
   * Útil para otimistic updates
   */
  const updateLista = (
    pagina: number,
    updater: (old: any) => any
  ) => {
    queryClient.setQueryData(
      [["historico", "listar"], { type: "query", input: { pagina } }],
      updater
    );
  };

  /**
   * Atualiza dados em cache do detalhe
   */
  const updateDetalhe = (requestId: string, updater: (old: any) => any) => {
    queryClient.setQueryData(
      [
        ["historico", "detalhe"],
        { type: "query", input: { request_id: requestId } },
      ],
      updater
    );
  };

  return {
    prefetchLista,
    prefetchDetalhe,
    invalidateLista,
    invalidateDetalhe,
    invalidateContar,
    invalidateAll,
    removeLista,
    getLista,
    getDetalhe,
    updateLista,
    updateDetalhe,
  };
}
