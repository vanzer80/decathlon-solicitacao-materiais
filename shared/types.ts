/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

import { TIPOS_EQUIPE, TIPOS_SERVICO, SISTEMAS_AFETADOS, UNIDADES, URGENCIAS } from "./constants";

export type TipoEquipe = (typeof TIPOS_EQUIPE)[number];
export type TipoServico = (typeof TIPOS_SERVICO)[number];
export type SistemaAfetado = (typeof SISTEMAS_AFETADOS)[number];
export type Unidade = (typeof UNIDADES)[number];
export type Urgencia = (typeof URGENCIAS)[number];

export interface Loja {
  id: string;
  label: string;
}

export interface MaterialItem {
  descricao: string;
  especificacao?: string;
  quantidade: number;
  unidade: Unidade;
  urgencia: Urgencia;
  foto1?: File;
  foto2?: File;
}

export interface SolicitacaoFormData {
  lojaId: string;
  lojaLabel: string;
  solicitanteNome: string;
  solicitanteTelefone?: string;
  numeroChamado?: string;
  tipoEquipe: TipoEquipe;
  empresaTerceira?: string;
  tipoServico: TipoServico;
  sistemaAfetado: SistemaAfetado;
  descricaoGeralServico: string;
  materiais: MaterialItem[];
}

export interface WebhookPayload {
  request_id: string;
  timestamp_envio: string;
  header: {
    loja_id: string;
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
  items: Array<{
    material_descricao: string;
    material_especificacao: string;
    quantidade: number;
    unidade: string;
    urgencia: string;
    foto1_url: string;
    foto2_url: string;
  }>;
}

export interface WebhookResponse {
  ok: boolean;
  message?: string;
  error?: string;
}
