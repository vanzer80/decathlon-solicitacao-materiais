import { ENV } from "../_core/env";
import { SolicitacaoPayload, WebhookResponse } from "../../shared/types";
import { isHtmlResponse, isValidWebhookResponse } from "../../shared/utils";

/**
 * Envia a solicitação para o webhook do Google Apps Script
 */
export async function submitToWebhook(
  payload: SolicitacaoPayload
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

    console.log("[Webhook] Sending request to:", url.toString());
    console.log("[Webhook] Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Token": ENV.webhookToken,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("[Webhook] Response status:", response.status);
    console.log("[Webhook] Response text (first 200 chars):", responseText.substring(0, 200));

    // Verifica se a resposta é HTML (erro de URL/publicação)
    if (isHtmlResponse(responseText)) {
      console.error("[Webhook] Response is HTML - URL or publication issue");
      return {
        success: false,
        message: "Webhook retornou HTML — verifique URL /exec e publicação do Apps Script",
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
        message: "Resposta do webhook não é JSON válido",
      };
    }

    // Verifica autenticação
    if (response.status === 401) {
      console.error("[Webhook] Authentication failed (401)");
      return {
        success: false,
        message: "Erro de autenticação - verifique token do webhook",
      };
    }

    // Verifica sucesso
    if (!isValidWebhookResponse(jsonResponse)) {
      console.error("[Webhook] Response does not contain ok: true");
      return {
        success: false,
        message: "Webhook respondeu com erro",
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
    return {
      success: false,
      message: `Erro ao enviar solicitação: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}
