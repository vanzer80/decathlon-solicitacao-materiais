/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Tipos para solicitação de materiais

export interface LojaOption {
  Loja_ID: number;
  Loja_Label: string;
}

export interface MaterialItemPayload {
  material_descricao: string;
  material_especificacao: string;
  quantidade: number;
  unidade: string;
  urgencia: string;
  foto1_url: string;
  foto2_url: string;
}

export interface SolicitacaoPayload {
  request_id: string;
  timestamp_envio: string;
  header: {
    loja_id: number;
    loja_label: string;
    solicitante_nome: string;
    solicitante_telefone: string;
    numero_chamado: string;
    tipo_equipe: string;
    empresa_terceira: string;
    tipo_servico: string;
    sistema_afetado: string;
    descricao_geral_servico: string;
  };
  items: MaterialItemPayload[];
}

export interface WebhookResponse {
  ok: boolean;
  message?: string;
}
