import { ENV } from "../_core/env";
import { SolicitacaoPayload, WebhookResponse } from "../../shared/types";
import { isHtmlResponse, isValidWebhookResponse } from "../../shared/utils";

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 800;

/**
 * Envia a solicitação para o webhook do Google Apps Script com retry e logs detalhados
 */
export async function submitToWebhook(
  payload: SolicitacaoPayload,
  retryCount = 0
): Promise<{ success: boolean; message: string; requestId?: string }> {
  // Mock mode para testes locais
  if (ENV.useMockWebhook) {
    console.log("[Webhook] Mock mode - returning success");
    return {
      success: true,
      message: "Mock webhook response",
      requestId: payload.request_id,
    };
  }

  try {
    const url = new URL(ENV.webhookUrl);
    url.searchParams.append("token", ENV.webhookToken);

    const urlMasked = url.toString().replace(ENV.webhookToken, "DECATHLON-****");
    console.log("[Webhook] Attempt", retryCount + 1, "- URL:", urlMasked);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Token": ENV.webhookToken,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 segundo timeout
    });

    const responseText = await response.text();
    const contentType = response.headers.get("content-type") || "unknown";
    const bodySnippet = responseText.substring(0, 200);

    console.log("[Webhook] Response:", {
      status: response.status,
      contentType,
      bodySnippetLength: responseText.length,
      bodySnippet,
    });

    // Verifica se a resposta é HTML (erro de URL/publicação)
    if (isHtmlResponse(responseText)) {
      const errorMsg = `Webhook retornou HTML (status ${response.status}, content-type: ${contentType}). ` +
        `Provável causa: Apps Script não está publicado como Web App público (Anyone) ou URL incorreta. ` +
        `Snippet: ${bodySnippet.substring(0, 100)}...`;

      console.error("[Webhook] Error:", errorMsg);

      // Retry apenas uma vez se for erro de rede/timeout
      if (retryCount < MAX_RETRIES && response.status === 0) {
        console.log("[Webhook] Retrying after", RETRY_DELAY_MS, "ms");
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        return submitToWebhook(payload, retryCount + 1);
      }

      return {
        success: false,
        message: errorMsg,
      };
    }

    // Tenta parsear como JSON
    let jsonResponse: WebhookResponse;
    try {
      jsonResponse = JSON.parse(responseText) as WebhookResponse;
    } catch (parseError) {
      console.error("[Webhook] Failed to parse JSON response:", parseError);
      return {
        success: false,
        message: `Resposta do webhook não é JSON válido. Status: ${response.status}, Content-Type: ${contentType}`,
      };
    }

    // Verifica autenticação
    if (response.status === 401) {
      console.error("[Webhook] Authentication failed (401)");
      return {
        success: false,
        message: "Erro de autenticação - token do webhook rejeitado",
      };
    }

    // Verifica sucesso
    if (!isValidWebhookResponse(jsonResponse)) {
      console.error("[Webhook] Response does not contain ok: true");
      return {
        success: false,
        message: `Webhook respondeu com erro: ${JSON.stringify(jsonResponse)}`,
      };
    }

    console.log("[Webhook] Success - request accepted");
    return {
      success: true,
      message: "Solicitação enviada com sucesso",
      requestId: payload.request_id,
    };
  } catch (error) {
    console.error("[Webhook] Error:", error);

    // Retry em caso de erro de rede
    if (retryCount < MAX_RETRIES) {
      console.log("[Webhook] Retrying after", RETRY_DELAY_MS, "ms");
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return submitToWebhook(payload, retryCount + 1);
    }

    const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
    return {
      success: false,
      message: `Erro ao enviar solicitação: ${errorMsg}`,
    };
  }
}
