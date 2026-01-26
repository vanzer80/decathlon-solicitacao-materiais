import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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
        if (typeof val !== 'object' || val === null) throw new Error('Invalid input');
        return val as any;
      })
      .mutation(async ({ input }) => {
        try {
          const { requestId, timestampEnvio, header, items, foto1Urls, foto2Urls } = input;
          
          // Validar honeypot
          if (input.honeypot) {
            console.warn('[Webhook] Honeypot triggered');
            return { success: true, requestId }; // Retornar sucesso silenciosamente
          }
          
          // Modo desenvolvimento: usar mock webhook se variável de ambiente estiver definida
          const useMockWebhook = process.env.USE_MOCK_WEBHOOK === 'true';
          if (useMockWebhook) {
            console.log('[Webhook] MODO MOCK ATIVADO - Simulando resposta do webhook');
            return { success: true, requestId };
          }
          
          // Montar payload para webhook
          const payload = {
            request_id: requestId,
            timestamp_envio: timestampEnvio,
            header: {
              loja_id: header.lojaId,
              loja_label: header.lojaLabel,
              solicitante_nome: header.solicitanteNome,
              solicitante_telefone: header.solicitanteTelefone || '',
              numero_chamado: header.numeroChamado || '',
              tipo_equipe: header.tipoEquipe,
              empresa_terceira: header.empresaTerceira || '',
              tipo_servico: header.tipoServico,
              sistema_afetado: header.sistemaAfetado,
              descricao_geral_servico: header.descricaoGeralServico,
            },
            items: items.map((item: any, index: number) => ({
              material_descricao: item.materialDescricao,
              material_especificacao: item.materialEspecificacao || '',
              quantidade: item.quantidade,
              unidade: item.unidade,
              urgencia: item.urgencia,
              foto1_url: foto1Urls?.[index] || '',
              foto2_url: foto2Urls?.[index] || '',
            })),
          };
          
          // Enviar para webhook
          const webhookUrlString = process.env.WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbz5-qhpg3UDrWSP0pDydcnK9olN8dF7fCzI0oFXcRIs-AhnAiy_xQcpB0mhaddxaEBK/exec';
          const webhookUrl = new URL(webhookUrlString);
          webhookUrl.searchParams.append('token', 'DECATHLON-2026');
          
          console.log('[Webhook] Enviando para:', webhookUrl.toString().split('?')[0]);
          console.log('[Webhook] Token:', 'DECATHLON-2026');
          
          // Usar apenas token em query param (método que passou no teste)
          const response = await fetch(webhookUrl.toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          const responseText = await response.text();
          console.log('[Webhook] Status:', response.status, response.statusText);
          console.log('[Webhook] Response Text:', responseText.substring(0, 300));
          
          // Verificar se a resposta é válida
          if (!response.ok) {
            console.error('[Webhook] HTTP Error:', response.status);
            console.error('[Webhook] Response:', responseText.substring(0, 200));
            
            // Erro 401: Problema de autenticação
            if (response.status === 401) {
              console.error('[Webhook] ❌ Erro 401: Falha de autenticação');
              console.error('[Webhook] Dicas para resolver:');
              console.error('[Webhook] 1. Verifique se o token DECATHLON-2026 está correto nas propriedades do script');
              console.error('[Webhook] 2. Verifique se a URL do webhook está correta');
              console.error('[Webhook] 3. Verifique se o Apps Script está publicado como aplicativo web');
              console.error('[Webhook] 4. Tente acessar a URL diretamente no navegador para testar');
              return { success: false, error: 'Erro de autenticação com o servidor (401). Verifique o token e a URL do webhook.' };
            }
            
            return { success: false, error: `Erro HTTP ${response.status} do servidor` };
          }
          
          let responseData;
          try {
            // Tentar fazer parse da resposta como JSON
            responseData = JSON.parse(responseText);
          } catch (e) {
            console.error('[Webhook] Failed to parse JSON:', e);
            console.error('[Webhook] Response was:', responseText.substring(0, 500));
            // Se não for JSON válido, verificar se é HTML ou vazio
            if (responseText.trim() === '') {
              console.log('[Webhook] ⚠️  Received empty response, assuming success');
              return { success: true, requestId };
            }
            if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
              console.error('[Webhook] ❌ Webhook retornou HTML em vez de JSON');
              console.error('[Webhook] Isso geralmente significa: URL incorreta ou Apps Script não publicado');
              return { success: false, error: 'Webhook retornou HTML. Verifique a URL e se o Apps Script está publicado.' };
            }
            return { success: false, error: 'Resposta inválida do servidor (não é JSON válido)' };
          }
          
          if (responseData.ok === true) {
            console.log('[Webhook] ✅ Success response received');
            console.log('[Webhook] Request ID:', responseData.request_id);
            console.log('[Webhook] Rows written:', responseData.rows_written);
            return { success: true, requestId };
          } else if (responseData.ok === false) {
            console.error('[Webhook] ❌ Error from webhook:', responseData.error);
            return { success: false, error: responseData.error || 'Erro ao enviar solicitação' };
          } else if (responseData.success === true) {
            console.log('[Webhook] ✅ Success (alternative format):', responseData);
            return { success: true, requestId };
          } else {
            // Se não houver campo 'ok', considerar como sucesso se houver um ID
            console.log('[Webhook] ✅ Response received:', responseData);
            return { success: true, requestId };
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
