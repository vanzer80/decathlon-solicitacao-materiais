// Gera um Request ID único no formato YYYYMMDD-HHMMSS-6CHARS
export function generateRequestId(): string {
  const now = new Date();
  
  // Formato: YYYYMMDD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;
  
  // Formato: HHMMSS
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timePart = `${hours}${minutes}${seconds}`;
  
  // 6 caracteres aleatórios (letras maiúsculas + números)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${datePart}-${timePart}-${randomPart}`;
}

// Valida um arquivo de imagem
export function validateImageFile(file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Apenas imagens são permitidas' };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Tamanho máximo: ${maxSizeMB}MB` };
  }
  
  return { valid: true };
}

// Formata um número de telefone
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}
