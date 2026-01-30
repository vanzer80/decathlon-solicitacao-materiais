import { ENV } from "../_core/env";

export interface DiagnosticResult {
  url: string;
  urlMasked: string;
  status: number | null;
  contentType: string | null;
  bodySnippet: string;
  isHtml: boolean;
  parsedJson: unknown;
  error: string | null;
  timestamp: string;
}

/**
 * Faz diagnóstico do webhook enviando um payload de teste
 */
export async function diagnoseWebhook(): Promise<DiagnosticResult> {
  const timestamp = new Date().toISOString();
  const testPayload = { ping: true };

  try {
    const url = new URL(ENV.webhookUrl);
    url.searchParams.append("token", ENV.webhookToken);

    const urlMasked = url.toString().replace(ENV.webhookToken, "DECATHLON-****");

    console.log("[Diagnostic] Testing webhook at:", urlMasked);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Token": ENV.webhookToken,
      },
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(10000), // 10 segundo timeout
    });

    const responseText = await response.text();
    const contentType = response.headers.get("content-type") || "unknown";
    const bodySnippet = responseText.substring(0, 500);

    // Detecta se é HTML
    const isHtml =
      contentType.includes("text/html") ||
      responseText.includes("<!DOCTYPE") ||
      responseText.includes("<html");

    // Tenta parsear como JSON
    let parsedJson: unknown = null;
    if (!isHtml) {
      try {
        parsedJson = JSON.parse(responseText);
      } catch {
        // Não é JSON válido
      }
    }

    console.log("[Diagnostic] Response:", {
      status: response.status,
      contentType,
      isHtml,
      bodySnippetLength: responseText.length,
    });

    return {
      url: url.toString(),
      urlMasked,
      status: response.status,
      contentType,
      bodySnippet,
      isHtml,
      parsedJson,
      error: null,
      timestamp,
    };
  } catch (error) {
    console.error("[Diagnostic] Error:", error);
    return {
      url: ENV.webhookUrl,
      urlMasked: ENV.webhookUrl.replace(ENV.webhookToken, "DECATHLON-****"),
      status: null,
      contentType: null,
      bodySnippet: "",
      isHtml: false,
      parsedJson: null,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      timestamp,
    };
  }
}
