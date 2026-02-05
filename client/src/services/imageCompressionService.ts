import imageCompression from 'browser-image-compression';

/**
 * Configuração de compressão de imagens
 * Otimizada para fotos de smartphone em conexão 3G/4G
 */
const compressionOptions: any = {
  // Tamanho máximo em MB (5MB)
  maxSizeMB: 5,
  // Largura máxima em pixels (2048px)
  maxWidthOrHeight: 2048,
  // Usar WebP se suportado (melhor compressão)
  useWebWorker: true,
  // Qualidade JPEG (0-100)
  // 70 = bom equilíbrio entre qualidade e tamanho
  fileType: 'image/jpeg',
};

/**
 * Opções agressivas para conexão lenta
 * Reduz mais, mas com qualidade visual aceitável
 */
const aggressiveOptions: any = {
  maxSizeMB: 0.5, // 500KB
  maxWidthOrHeight: 1024,
  useWebWorker: true,
  fileType: 'image/jpeg',
};

export interface CompressionResult {
  success: boolean;
  originalFile: File;
  compressedFile: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  error?: string;
}

/**
 * Comprime uma imagem mantendo qualidade visual
 * @param file - Arquivo de imagem
 * @param aggressive - Se true, usa compressão mais agressiva
 * @param onProgress - Callback de progresso (0-100)
 * @returns Resultado da compressão
 */
export async function compressImage(
  file: File,
  aggressive: boolean = false,
  onProgress?: (progress: number) => void
): Promise<CompressionResult> {
  try {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      throw new Error('Arquivo não é uma imagem válida');
    }

    // Selecionar opções baseado em modo
    const options = aggressive ? aggressiveOptions : compressionOptions;

    // Reportar progresso inicial
    onProgress?.(10);

    // Comprimir imagem
    const compressedBlob = await (imageCompression as any).compress(file, options);

    // Reportar progresso final
    onProgress?.(100);

    // Calcular métricas
    const originalSize = file.size;
    const compressedSize = compressedBlob.size;
    const compressionRatio = (1 - compressedSize / originalSize) * 100;

    return {
      success: true,
      originalFile: file,
      compressedFile: compressedBlob,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  } catch (error) {
    return {
      success: false,
      originalFile: file,
      compressedFile: new Blob(),
      originalSize: file.size,
      compressedSize: 0,
      compressionRatio: 0,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Comprime múltiplas imagens em paralelo
 * @param files - Array de arquivos
 * @param aggressive - Se true, usa compressão mais agressiva
 * @param onProgress - Callback de progresso (0-100)
 * @returns Array de resultados
 */
export async function compressImages(
  files: File[],
  aggressive: boolean = false,
  onProgress?: (progress: number) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  const totalFiles = files.length;

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    const progress = Math.round((i / totalFiles) * 100);
    onProgress?.(progress);

    const result = await compressImage(file, aggressive);
    results.push(result);
  }

  onProgress?.(100);
  return results;
}

/**
 * Formata tamanho de arquivo em bytes para string legível
 * @param bytes - Tamanho em bytes
 * @returns String formatada (ex: "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calcula economia de banda
 * @param originalSize - Tamanho original em bytes
 * @param compressedSize - Tamanho comprimido em bytes
 * @returns Objeto com economia em bytes e percentual
 */
export function calculateBandwidthSavings(
  originalSize: number,
  compressedSize: number
) {
  const savedBytes = originalSize - compressedSize;
  const savedPercentage = (savedBytes / originalSize) * 100;

  return {
    savedBytes,
    savedPercentage,
    formattedSaved: formatFileSize(savedBytes),
  };
}

/**
 * Estima tempo de upload baseado em tamanho e velocidade de conexão
 * @param fileSizeBytes - Tamanho do arquivo em bytes
 * @param connectionSpeedMbps - Velocidade de conexão em Mbps
 * @returns Tempo estimado em segundos
 */
export function estimateUploadTime(
  fileSizeBytes: number,
  connectionSpeedMbps: number = 2 // 3G/4G típico
): number {
  const fileSizeMbits = (fileSizeBytes * 8) / (1024 * 1024);
  return fileSizeMbits / connectionSpeedMbps;
}

/**
 * Detecta se a conexão é lenta (3G/4G)
 * @returns true se conexão é lenta
 */
export async function isSlowConnection(): Promise<boolean> {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      return effectiveType === '3g' || effectiveType === '4g';
    }
  }
  return false;
}
