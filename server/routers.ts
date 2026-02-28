import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { z } from "zod";

// Schema de validação para entrada
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

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  solicitacao: router({
    submit: publicProcedure
      .input((val: unknown) => {
        // Validar com Zod
        const parsed = SolicitacaoInputSchema.safeParse(val);
        if (!parsed.success) {
          const errorMessages = parsed.error.issues.map((issue: any) => issue.message).join(', ');
          console.error('[Validation] Schema validation failed:', errorMessages);
          throw new Error(`Validação falhou: ${errorMessages}`);
        }
        return parsed.data;
      })
      .mutation(async ({ input }) => {
        try {
          // Honeypot check
          if (input.honeypot) {
            console.warn('[Honeypot] Spam detectado - retornando sucesso silenciosamente');
            return { success: true, requestId: input.requestId };
          }

          // Modo desenvolvimento: usar mock webhook se variável de ambiente estiver definida
          const useMockWebhook = process.env.USE_MOCK_WEBHOOK === 'true';
          if (useMockWebhook) {
            console.log('[Webhook] MODO MOCK ATIVADO - Simulando resposta do webhook');
            return { success: true, requestId: input.requestId };
          }

          // ✅ CORREÇÃO 1: Mapeamento correto de dados
          // Montar payload para webhook com estrutura correta
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
            // ✅ CORREÇÃO 2: Mapear materiais corretamente com nomes snake_case
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

          // ✅ CORREÇÃO 3: Logging detalhado do payload
          console.log('[Webhook] Payload a ser enviado:');
          console.log('[Webhook] Request ID:', payload.request_id);
          console.log('[Webhook] Timestamp:', payload.timestamp_envio);
          console.log('[Webhook] Header:', JSON.stringify(payload.header, null, 2));
          console.log('[Webhook] Items count:', payload.items.length);
          console.log('[Webhook] Items:', JSON.stringify(payload.items, null, 2));

          // Enviar para webhook
          const webhookUrlString = process.env.WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbz5-qhpg3UDrWSP0pDydcnK9olN8dF7fCzI0oFXcRIs-AhnAiy_xQcpB0mhaddxaEBK/exec';
          const webhookUrl = new URL(webhookUrlString);
          webhookUrl.searchParams.append('token', 'DECATHLON-2026');

          console.log('[Webhook] Enviando para:', webhookUrl.toString().split('?')[0]);
          console.log('[Webhook] Token:', 'DECATHLON-2026');

          // ✅ CORREÇÃO 4: Melhorar tratamento de resposta
          const response = await fetch(webhookUrl.toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const responseText = await response.text();
          console.log('[Webhook] Status HTTP:', response.status, response.statusText);
          console.log('[Webhook] Response Text (primeiros 500 chars):', responseText.substring(0, 500));

          // ✅ CORREÇÃO 5: Não retornar sucesso falso
          // Verificar se a resposta é válida
          if (!response.ok) {
            console.error('[Webhook] ❌ HTTP Error:', response.status);
            console.error('[Webhook] Response completa:', responseText);

            if (response.status === 401) {
              console.error('[Webhook] ❌ Erro 401: Falha de autenticação');
              console.error('[Webhook] Dicas para resolver:');
              console.error('[Webhook] 1. Verifique se o token DECATHLON-2026 está correto nas propriedades do script');
              console.error('[Webhook] 2. Verifique se a URL do webhook está correta');
              console.error('[Webhook] 3. Verifique se o Apps Script está publicado como aplicativo web');
              return { success: false, error: 'Erro de autenticação com o servidor (401). Verifique o token e a URL do webhook.' };
            }

            return { success: false, error: `Erro HTTP ${response.status} do servidor` };
          }

          let responseData;
          try {
            // Tentar fazer parse da resposta como JSON
            responseData = JSON.parse(responseText);
            console.log('[Webhook] Response JSON:', JSON.stringify(responseData, null, 2));
          } catch (e) {
            console.error('[Webhook] Failed to parse JSON:', e);
            console.error('[Webhook] Response was:', responseText.substring(0, 500));

            // ✅ CORREÇÃO 6: Não retornar sucesso falso para respostas vazias
            if (responseText.trim() === '') {
              console.error('[Webhook] ❌ Received empty response - webhook pode ter falhado');
              return { success: false, error: 'Resposta vazia do webhook. Verifique se o Apps Script está processando corretamente.' };
            }

            if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
              console.error('[Webhook] ❌ Webhook retornou HTML em vez de JSON');
              console.error('[Webhook] Isso geralmente significa: URL incorreta ou Apps Script não publicado');
              return { success: false, error: 'Webhook retornou HTML. Verifique a URL e se o Apps Script está publicado.' };
            }

            return { success: false, error: 'Resposta inválida do servidor (não é JSON válido)' };
          }

          // ✅ CORREÇÃO 7: Validar resposta do webhook
          if (responseData.ok === true) {
            console.log('[Webhook] ✅ Success response received');
            console.log('[Webhook] Request ID:', responseData.request_id);
            console.log('[Webhook] Rows written:', responseData.rows_written);
            return { success: true, requestId: input.requestId };
          } else if (responseData.ok === false) {
            console.error('[Webhook] ❌ Error from webhook:', responseData.error);
            return { success: false, error: responseData.error || 'Erro ao enviar solicitação' };
          } else if (responseData.success === true) {
            console.log('[Webhook] ✅ Success (alternative format):', responseData);
            return { success: true, requestId: input.requestId };
          } else {
            // ✅ CORREÇÃO 8: Não retornar sucesso falso se não houver confirmação explícita
            console.error('[Webhook] ❌ Response format not recognized:', responseData);
            return { success: false, error: 'Resposta do webhook não reconhecida. Verifique se o Apps Script está retornando o formato correto.' };
          }
        } catch (error: any) {
          console.error('[Webhook] ❌ Catch Error:', error.message);
          console.error('[Webhook] Stack:', error.stack);
          console.error('[Webhook] Dica: Se receber erro de CORS, verifique se o Apps Script está configurado para aceitar requisições de qualquer origem');
          return { success: false, error: error.message || 'Erro ao processar solicitação' };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
