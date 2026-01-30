import { storagePut } from "../storage";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Valida e faz upload de uma foto
 */
export async function uploadPhoto(
  fileBuffer: Uint8Array | Buffer,
  mimeType: string,
  fileName: string
): Promise<UploadResult> {
  // Validar tipo
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return {
      success: false,
      error: `Tipo de arquivo não permitido. Aceitos: ${ALLOWED_TYPES.join(", ")}`,
    };
  }

  // Validar tamanho
  if (fileBuffer.length > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  try {
    // Gera um nome único para o arquivo
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = getFileExtension(mimeType);
    const fileKey = `solicitacoes/${timestamp}-${randomSuffix}.${extension}`;

    console.log("[Upload] Uploading file:", fileKey);

    const { url } = await storagePut(fileKey, fileBuffer, mimeType);

    console.log("[Upload] Success:", url);

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error("[Upload] Error:", error);
    return {
      success: false,
      error: `Erro ao fazer upload: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

/**
 * Obtém a extensão do arquivo baseado no MIME type
 */
function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };
  return extensions[mimeType] || "jpg";
}
