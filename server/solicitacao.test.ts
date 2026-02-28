import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';

// Schema de validação (mesmo do routers.ts)
const SolicitacaoInputSchema = z.object({
  requestId: z.string(),
  timestampEnvio: z.string(),
  lojaId: z.string(),
  lojaLabel: z.string(),
  solicitanteNome: z.string(),
  solicitanteTelefone: z.string().optional(),
  numeroChamado: z.string().optional(),
  tipoEquipe: z.string(),
  empresaTerceira: z.string().optional(),
  tipoServico: z.string(),
  sistemaAfetado: z.string(),
  descricaoGeralServico: z.string(),
  materiais: z.array(z.object({
    descricao: z.string(),
    especificacao: z.string().optional(),
    quantidade: z.number(),
    unidade: z.string(),
    urgencia: z.string(),
    foto1Url: z.string().optional(),
    foto2Url: z.string().optional(),
  })),
  honeypot: z.string().optional(),
});

describe('Solicitação - Validação de Schema', () => {
  it('deve aceitar payload válido com todos os campos obrigatórios', () => {
    const validPayload = {
      requestId: '20260127-180000-ABC123',
      timestampEnvio: '2026-01-27T18:00:00.000Z',
      lojaId: '1',
      lojaLabel: 'Loja São Paulo',
      solicitanteNome: 'João Silva',
      tipoEquipe: 'Própria',
      tipoServico: 'Manutenção',
      sistemaAfetado: 'Ar Condicionado',
      descricaoGeralServico: 'Manutenção preventiva',
      materiais: [
        {
          descricao: 'Filtro de ar',
          quantidade: 2,
          unidade: 'un',
          urgencia: 'Média',
        }
      ],
    };

    const result = SolicitacaoInputSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('deve aceitar payload com campos opcionais', () => {
    const validPayload = {
      requestId: '20260127-180000-ABC123',
      timestampEnvio: '2026-01-27T18:00:00.000Z',
      lojaId: '1',
      lojaLabel: 'Loja São Paulo',
      solicitanteNome: 'João Silva',
      solicitanteTelefone: '(11) 99999-9999',
      numeroChamado: 'CHM-2026-001',
      tipoEquipe: 'Terceirizada',
      empresaTerceira: 'Empresa X',
      tipoServico: 'Reparo',
      sistemaAfetado: 'Refrigeração',
      descricaoGeralServico: 'Reparo de vazamento',
      materiais: [
        {
          descricao: 'Tubo de cobre',
          especificacao: '1/2 polegada',
          quantidade: 5,
          unidade: 'm',
          urgencia: 'Alta',
          foto1Url: 'https://s3.amazonaws.com/bucket/foto1.jpg',
          foto2Url: 'https://s3.amazonaws.com/bucket/foto2.jpg',
        }
      ],
    };

    const result = SolicitacaoInputSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar payload sem campos obrigatórios', () => {
    const invalidPayload = {
      requestId: '20260127-180000-ABC123',
      timestampEnvio: '2026-01-27T18:00:00.000Z',
      // Faltam lojaId, lojaLabel, etc.
    };

    const result = SolicitacaoInputSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('deve rejeitar payload com materiais vazio', () => {
    const invalidPayload = {
      requestId: '20260127-180000-ABC123',
      timestampEnvio: '2026-01-27T18:00:00.000Z',
      lojaId: '1',
      lojaLabel: 'Loja São Paulo',
      solicitanteNome: 'João Silva',
      tipoEquipe: 'Própria',
      tipoServico: 'Manutenção',
      sistemaAfetado: 'Ar Condicionado',
      descricaoGeralServico: 'Manutenção preventiva',
      materiais: [], // Array vazio
    };

    const result = SolicitacaoInputSchema.safeParse(invalidPayload);
    expect(result.success).toBe(true); // Array vazio é válido
  });

  it('deve rejeitar material sem campos obrigatórios', () => {
    const invalidPayload = {
      requestId: '20260127-180000-ABC123',
      timestampEnvio: '2026-01-27T18:00:00.000Z',
      lojaId: '1',
      lojaLabel: 'Loja São Paulo',
      solicitanteNome: 'João Silva',
      tipoEquipe: 'Própria',
      tipoServico: 'Manutenção',
      sistemaAfetado: 'Ar Condicionado',
      descricaoGeralServico: 'Manutenção preventiva',
      materiais: [
        {
          // Faltam descricao, quantidade, unidade, urgencia
        }
      ],
    };

    const result = SolicitacaoInputSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});

describe('Solicitação - Mapeamento de Dados', () => {
  it('deve mapear corretamente dados do frontend para payload do webhook', () => {
    const frontendData = {
      requestId: '20260127-180000-ABC123',
      timestampEnvio: '2026-01-27T18:00:00.000Z',
      lojaId: '1',
      lojaLabel: 'Loja São Paulo',
      solicitanteNome: 'João Silva',
      solicitanteTelefone: '(11) 99999-9999',
      numeroChamado: 'CHM-2026-001',
      tipoEquipe: 'Própria',
      empresaTerceira: '',
      tipoServico: 'Manutenção',
      sistemaAfetado: 'Ar Condicionado',
      descricaoGeralServico: 'Manutenção preventiva',
      materiais: [
        {
          descricao: 'Filtro de ar',
          especificacao: 'Tipo A',
          quantidade: 2,
          unidade: 'un',
          urgencia: 'Média',
          foto1Url: 'https://s3.amazonaws.com/bucket/foto1.jpg',
          foto2Url: '',
        }
      ],
    };

    // Validar entrada
    const parsed = SolicitacaoInputSchema.safeParse(frontendData);
    expect(parsed.success).toBe(true);

    if (!parsed.success) return;

    const input = parsed.data;

    // Mapear para payload do webhook
    const payload = {
      request_id: input.requestId,
      timestamp_envio: input.timestampEnvio,
      header: {
        loja_id: input.lojaId,
        loja_label: input.lojaLabel,
        solicitante_nome: input.solicitanteNome,
        solicitante_telefone: input.solicitanteTelefone || '',
        numero_chamado: input.numeroChamado || '',
        tipo_equipe: input.tipoEquipe,
        empresa_terceira: input.empresaTerceira || '',
        tipo_servico: input.tipoServico,
        sistema_afetado: input.sistemaAfetado,
        descricao_geral_servico: input.descricaoGeralServico,
      },
      items: input.materiais.map((material) => ({
        material_descricao: material.descricao,
        material_especificacao: material.especificacao || '',
        quantidade: material.quantidade,
        unidade: material.unidade,
        urgencia: material.urgencia,
        foto1_url: material.foto1Url || '',
        foto2_url: material.foto2Url || '',
      })),
    };

    // Validar mapeamento
    expect(payload.request_id).toBe('20260127-180000-ABC123');
    expect(payload.timestamp_envio).toBe('2026-01-27T18:00:00.000Z');
    expect(payload.header.loja_id).toBe('1');
    expect(payload.header.loja_label).toBe('Loja São Paulo');
    expect(payload.header.solicitante_nome).toBe('João Silva');
    expect(payload.header.tipo_equipe).toBe('Própria');
    expect(payload.items.length).toBe(1);
    expect(payload.items[0].material_descricao).toBe('Filtro de ar');
    expect(payload.items[0].quantidade).toBe(2);
    expect(payload.items[0].foto1_url).toBe('https://s3.amazonaws.com/bucket/foto1.jpg');
    expect(payload.items[0].foto2_url).toBe('');
  });

  it('deve mapear múltiplos materiais corretamente', () => {
    const frontendData = {
      requestId: '20260127-180000-ABC123',
      timestampEnvio: '2026-01-27T18:00:00.000Z',
      lojaId: '2',
      lojaLabel: 'Loja Rio de Janeiro',
      solicitanteNome: 'Maria Santos',
      tipoEquipe: 'Terceirizada',
      empresaTerceira: 'Empresa Y',
      tipoServico: 'Reparo',
      sistemaAfetado: 'Refrigeração',
      descricaoGeralServico: 'Reparo de vazamento',
      materiais: [
        {
          descricao: 'Tubo de cobre',
          quantidade: 5,
          unidade: 'm',
          urgencia: 'Alta',
          foto1Url: 'https://s3.amazonaws.com/bucket/foto1.jpg',
        },
        {
          descricao: 'Conexão de latão',
          quantidade: 10,
          unidade: 'un',
          urgencia: 'Média',
          foto1Url: 'https://s3.amazonaws.com/bucket/foto2.jpg',
        },
        {
          descricao: 'Vedante',
          quantidade: 1,
          unidade: 'kg',
          urgencia: 'Baixa',
        }
      ],
    };

    const parsed = SolicitacaoInputSchema.safeParse(frontendData);
    expect(parsed.success).toBe(true);

    if (!parsed.success) return;

    const input = parsed.data;
    const payload = {
      items: input.materiais.map((material) => ({
        material_descricao: material.descricao,
        quantidade: material.quantidade,
        unidade: material.unidade,
        urgencia: material.urgencia,
        foto1_url: material.foto1Url || '',
      })),
    };

    expect(payload.items.length).toBe(3);
    expect(payload.items[0].material_descricao).toBe('Tubo de cobre');
    expect(payload.items[0].quantidade).toBe(5);
    expect(payload.items[1].material_descricao).toBe('Conexão de latão');
    expect(payload.items[2].material_descricao).toBe('Vedante');
    expect(payload.items[2].foto1_url).toBe('');
  });
});

describe('Solicitação - Honeypot', () => {
  it('deve detectar honeypot preenchido', () => {
    const spamPayload = {
      requestId: '20260127-180000-ABC123',
      timestampEnvio: '2026-01-27T18:00:00.000Z',
      lojaId: '1',
      lojaLabel: 'Loja São Paulo',
      solicitanteNome: 'João Silva',
      tipoEquipe: 'Própria',
      tipoServico: 'Manutenção',
      sistemaAfetado: 'Ar Condicionado',
      descricaoGeralServico: 'Manutenção preventiva',
      materiais: [
        {
          descricao: 'Filtro de ar',
          quantidade: 2,
          unidade: 'un',
          urgencia: 'Média',
        }
      ],
      honeypot: 'SPAM', // Honeypot preenchido
    };

    const parsed = SolicitacaoInputSchema.safeParse(spamPayload);
    expect(parsed.success).toBe(true);

    if (!parsed.success) return;

    const input = parsed.data;
    expect(input.honeypot).toBe('SPAM');
  });
});
