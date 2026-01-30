// Valida URL do webhook no startup
function validateWebhookUrl(url: string): void {
  if (!url.endsWith("/exec")) {
    throw new Error(
      `[Startup] WEBHOOK_URL inválida: deve terminar com /exec. Recebido: ${url}`
    );
  }
}

const webhookUrl = process.env.WEBHOOK_URL ?? "https://script.google.com/macros/s/AKfycby9oLYJI9mJqSDOEi6kQQELU7naTfjpesQIYyfRvS8/exec";

// Valida na inicialização se não estiver em modo mock
if (!process.env.USE_MOCK_WEBHOOK || process.env.USE_MOCK_WEBHOOK !== "true") {
  validateWebhookUrl(webhookUrl);
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  webhookUrl,
  webhookToken: process.env.WEBHOOK_TOKEN ?? "DECATHLON-2026",
  useMockWebhook: process.env.USE_MOCK_WEBHOOK === "true",
};
