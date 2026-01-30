/**
 * Gera um Request_ID no formato YYYYMMDD-HHMMSS-6CHARS
 */
export function generateRequestId(): string {
  const now = new Date();
  
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  
  // Gera 6 caracteres aleatórios (A-Z, 0-9)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${year}${month}${day}-${hours}${minutes}${seconds}-${randomPart}`;
}

/**
 * Valida se a resposta do webhook é JSON válido com ok: true
 */
export function isValidWebhookResponse(response: unknown): boolean {
  if (typeof response !== 'object' || response === null) {
    return false;
  }
  return (response as Record<string, unknown>).ok === true;
}

/**
 * Detecta se uma string é HTML
 */
export function isHtmlResponse(text: string): boolean {
  return /^\s*<!DOCTYPE|^\s*<html/i.test(text.trim());
}
