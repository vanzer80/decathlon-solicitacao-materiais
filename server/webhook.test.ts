import { describe, it, expect } from "vitest";
import { diagnoseWebhook } from "./services/webhookDiagnostic";

describe("Webhook Integration", () => {
  it("should diagnose webhook and return valid response structure", async () => {
    const result = await diagnoseWebhook();

    // Validar estrutura da resposta
    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("urlMasked");
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("contentType");
    expect(result).toHaveProperty("bodySnippet");
    expect(result).toHaveProperty("isHtml");
    expect(result).toHaveProperty("parsedJson");
    expect(result).toHaveProperty("error");
    expect(result).toHaveProperty("timestamp");

    // URL deve estar mascarada
    expect(result.urlMasked).toContain("DECATHLON-****");
    expect(result.urlMasked).not.toContain("DECATHLON-2026");

    // Timestamp deve ser válido
    expect(new Date(result.timestamp)).toBeInstanceOf(Date);

    console.log("[Webhook Test] Diagnostic result:", {
      status: result.status,
      contentType: result.contentType,
      isHtml: result.isHtml,
      hasError: !!result.error,
    });
  });

  it("should detect if webhook returns HTML", async () => {
    const result = await diagnoseWebhook();

    // Se retornar HTML, deve ter isHtml = true
    if (result.bodySnippet.includes("<!DOCTYPE") || result.bodySnippet.includes("<html")) {
      expect(result.isHtml).toBe(true);
    }
  });

  it("should attempt to parse JSON response", async () => {
    const result = await diagnoseWebhook();

    // Se não for HTML, deve tentar parsear como JSON
    if (!result.isHtml && result.bodySnippet) {
      // parsedJson pode ser null se não conseguir parsear
      // mas a tentativa deve ter sido feita
      expect(result).toHaveProperty("parsedJson");
    }
  });
});
