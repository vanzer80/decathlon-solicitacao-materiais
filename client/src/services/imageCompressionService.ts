/**
 * Serviço de compressão de imagens com fallback robusto
 * Trata casos onde a biblioteca não carrega corretamente
 */

// Importar com verificação de disponibilidade
let imageCompressionLib: any = null;

// Tentar carregar a biblioteca
try {
  imageCompressionLib = require('browser-image-compression');
} catch (error) {
  console.warn('browser-image-compression não carregou via require, tentando import dinâmico');
}

/**
 * Configuração de compressão de imagens
 * Otimizada para fotos de smartphone em conexão 3G/4G
 */
const compressionOptions: any = {
  maxSizeMB: 5,
  maxWidthOrHeight: 2048,
  useWebWorker: true,
  fileType: 'image/jpeg',
};

/**
 * Opções agressivas para conexão lenta
 */
const aggressiveOptions: any = {
  maxSizeMB: 0.5,
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
  usedFallback?: boolean;
}

/**
 * Verifica se a biblioteca de compressão está disponível
 */
function isCompressionAvailable(): boolean {
  try {
    return imageCompressionLib && typeof imageCompressionLib.compress === 'function';
  } catch (error) {
    return false;
  }
}

/**
 * Carrega a biblioteca dinamicamente se não estiver disponível
 */
async function loadCompressionLibrary(): Promise<boolean> {
  if (isCompressionAvailable()) {
    return true;
  }

  try {
    // Tentar import dinâmico
    const module = await import('browser-image-compression');
    imageCompressionLib = module.default || module;
    return isCompressionAvailable();
  } catch (error) {
    console.error('Falha ao carregar biblioteca de compressão:', error);
    return false;
  }
}

/**
 * Cria um fallback: retorna arquivo original como blob
 */
function createFallbackBlob(file: File): Blob {
  return new Blob([file], { type: file.type });
}

/**
 * Comprime uma imagem com fallback robusto
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

    onProgress?.(10);

    // Verificar se biblioteca está disponível
    const libAvailable = await loadCompressionLibrary();

    if (!libAvailable) {
      console.warn('Biblioteca de compressão não disponível, usando fallback');
      onProgress?.(100);

      return {
        success: true,
        originalFile: file,
        compressedFile: createFallbackBlob(file),
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        usedFallback: true,
      };
    }

    // Selecionar opções
    const options = aggressive ? aggressiveOptions : compressionOptions;

    onProgress?.(30);

    // Comprimir imagem
    let compressedBlob: Blob;

    try {
      compressedBlob = await imageCompressionLib.compress(file, options);
    } catch (compressionError) {
      console.warn('Erro durante compressão, usando fallback:', compressionError);
      onProgress?.(100);

      return {
        success: true,
        originalFile: file,
        compressedFile: createFallbackBlob(file),
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        usedFallback: true,
      };
    }

    onProgress?.(90);

    // Validar resultado
    if (!compressedBlob || compressedBlob.size === 0) {
      throw new Error('Compressão resultou em blob vazio');
    }

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
      usedFallback: false,
    };
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);

    // Fallback final: retornar arquivo original
    return {
      success: true,
      originalFile: file,
      compressedFile: createFallbackBlob(file),
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      usedFallback: true,
    };
  }
}

/**
 * Comprime múltiplas imagens em paralelo
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
 */
export function estimateUploadTime(
  fileSizeBytes: number,
  connectionSpeedMbps: number = 2
): number {
  const fileSizeMbits = (fileSizeBytes * 8) / (1024 * 1024);
  return fileSizeMbits / connectionSpeedMbps;
}

/**
 * Detecta se a conexão é lenta (3G/4G)
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

/**
 * Verifica disponibilidade da biblioteca de compressão
 * Útil para debugging e testes
 */
export async function checkCompressionLibraryStatus(): Promise<{
  available: boolean;
  loaded: boolean;
  error?: string;
}> {
  try {
    const available = await loadCompressionLibrary();
    return {
      available,
      loaded: isCompressionAvailable(),
    };
  } catch (error) {
    return {
      available: false,
      loaded: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
