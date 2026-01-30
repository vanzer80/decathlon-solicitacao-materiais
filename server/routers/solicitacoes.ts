import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { createMaterialRequest, createMaterialItem } from "../db";
import { submitToWebhook } from "../services/webhookService";
import { uploadPhoto } from "../services/uploadService";
import { generateRequestId } from "../../shared/utils";
import { SolicitacaoPayload } from "../../shared/types";

const MaterialItemSchema = z.object({
  material_descricao: z.string().min(1, "Descrição do material é obrigatória"),
  material_especificacao: z.string().optional().default(""),
  quantidade: z.number().int().min(1, "Quantidade deve ser maior que 0"),
  unidade: z.enum(["un", "cx", "par", "m", "kg", "L", "rolo", "kit", "outro"]),
  urgencia: z.enum(["Alta", "Média", "Baixa"]),
  foto1: z.instanceof(Buffer).optional(),
  foto1_type: z.string().optional(),
  foto2: z.instanceof(Buffer).optional(),
  foto2_type: z.string().optional(),
});

const SolicitacaoSchema = z.object({
  loja_id: z.number().int().min(0, "Loja é obrigatória"),
  loja_label: z.string().min(1, "Label da loja é obrigatório"),
  solicitante_nome: z.string().min(1, "Nome do solicitante é obrigatório"),
  solicitante_telefone: z.string().optional().default(""),
  numero_chamado: z.string().optional().default(""),
  tipo_equipe: z.enum(["Própria", "Terceirizada"]),
  empresa_terceira: z.string().optional().default(""),
  tipo_servico: z.enum(["Preventiva", "Corretiva"]),
  sistema_afetado: z.enum(["HVAC", "Elétrica", "Hidráulica", "Civil", "PPCI", "Outros"]),
  descricao_geral_servico: z.string().min(1, "Descrição geral do serviço é obrigatória"),
  items: z.array(MaterialItemSchema).min(1, "Adicione pelo menos um material"),
  honeypot: z.string().optional().default(""),
});

export const solicitacoesRouter = router({
  submit: publicProcedure
    .input(SolicitacaoSchema)
    .mutation(async ({ input }) => {
      // Validação honeypot
      if (input.honeypot && input.honeypot.trim() !== "") {
        console.log("[Honeypot] Spam detected");
        // Retorna sucesso silenciosamente para não revelar o honeypot
        return {
          success: true,
          requestId: generateRequestId(),
          message: "Solicitação recebida",
        };
      }

      // Validação: se terceirizada, empresa_terceira é obrigatória
      if (input.tipo_equipe === "Terceirizada" && !input.empresa_terceira?.trim()) {
        throw new Error("Empresa terceira é obrigatória quando o tipo de equipe é Terceirizada");
      }

      const requestId = generateRequestId();
      const timestampEnvio = new Date().toISOString();

      try {
        // Processa fotos e monta payload
        const items = await Promise.all(
          input.items.map(async (item) => {
            let foto1_url = "";
            let foto2_url = "";

            if (item.foto1 && item.foto1_type) {
              const result = await uploadPhoto(item.foto1, item.foto1_type, `foto1-${requestId}`);
              if (result.success && result.url) {
                foto1_url = result.url;
              }
            }

            if (item.foto2 && item.foto2_type) {
              const result = await uploadPhoto(item.foto2, item.foto2_type, `foto2-${requestId}`);
              if (result.success && result.url) {
                foto2_url = result.url;
              }
            }

            return {
              material_descricao: item.material_descricao,
              material_especificacao: item.material_especificacao || "",
              quantidade: item.quantidade,
              unidade: item.unidade,
              urgencia: item.urgencia,
              foto1_url,
              foto2_url,
            };
          })
        );

        // Monta payload para webhook
        const payload: SolicitacaoPayload = {
          request_id: requestId,
          timestamp_envio: timestampEnvio,
          header: {
            loja_id: input.loja_id,
            loja_label: input.loja_label,
            solicitante_nome: input.solicitante_nome,
            solicitante_telefone: input.solicitante_telefone || "",
            numero_chamado: input.numero_chamado || "",
            tipo_equipe: input.tipo_equipe,
            empresa_terceira: input.empresa_terceira || "",
            tipo_servico: input.tipo_servico,
            sistema_afetado: input.sistema_afetado,
            descricao_geral_servico: input.descricao_geral_servico,
          },
          items,
        };

        // Envia para webhook
        const webhookResult = await submitToWebhook(payload);

        if (!webhookResult.success) {
          throw new Error(webhookResult.message);
        }

        // Salva no banco de dados (para referência local)
        await createMaterialRequest({
          requestId,
          timestampEnvio: new Date(timestampEnvio),
          lojaId: input.loja_id,
          lojaLabel: input.loja_label,
          solicitanteNome: input.solicitante_nome,
          solicitanteTelefone: input.solicitante_telefone || null,
          numeroChamado: input.numero_chamado || null,
          tipoEquipe: input.tipo_equipe,
          empresaTerceira: input.empresa_terceira || null,
          tipoServico: input.tipo_servico,
          sistemaAfetado: input.sistema_afetado,
          descricaoGeralServico: input.descricao_geral_servico,
        });

        // Salva itens no banco de dados
        for (const item of items) {
          await createMaterialItem({
            requestId,
            materialDescricao: item.material_descricao,
            materialEspecificacao: item.material_especificacao || null,
            quantidade: item.quantidade,
            unidade: item.unidade,
            urgencia: item.urgencia,
            foto1Url: item.foto1_url || null,
            foto2Url: item.foto2_url || null,
          });
        }

        return {
          success: true,
          requestId,
          message: "Solicitação enviada com sucesso",
        };
      } catch (error) {
        console.error("[Submit] Error:", error);
        throw error;
      }
    }),
});
