/**
 * Utilitário para compressão de imagens usando Canvas API
 * Reduz tamanho de arquivo mantendo qualidade visual aceitável
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1, padrão 0.8
  maxSizeKB?: number; // Tamanho máximo em KB
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
}

/**
 * Comprime uma imagem usando Canvas API
 * @param file - Arquivo de imagem para comprimir
 * @param options - Opções de compressão
 * @returns Promise com blob comprimido e estatísticas
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.8,
    maxSizeKB = 500,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const img = new Image();

        img.onload = () => {
          // Calcular novas dimensões mantendo proporção
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Criar canvas e desenhar imagem redimensionada
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Falha ao obter contexto do canvas'));
            return;
          }

          // Desenhar com suavização
          ctx.drawImage(img, 0, 0, width, height);

          // Converter para blob com qualidade especificada
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Falha ao criar blob da imagem'));
                return;
              }

              // Se ainda estiver muito grande, tentar qualidade menor
              if (blob.size > maxSizeKB * 1024) {
                const lowerQuality = Math.max(quality * 0.7, 0.5);
                canvas.toBlob(
                  (smallerBlob) => {
                    if (!smallerBlob) {
                      reject(new Error('Falha ao criar blob com qualidade reduzida'));
                      return;
                    }

                    const originalSize = file.size;
                    const compressedSize = smallerBlob.size;

                    resolve({
                      blob: smallerBlob,
                      originalSize,
                      compressedSize,
                      reductionPercent: Math.round(
                        ((originalSize - compressedSize) / originalSize) * 100
                      ),
                    });
                  },
                  'image/jpeg',
                  lowerQuality
                );
              } else {
                const originalSize = file.size;
                const compressedSize = blob.size;

                resolve({
                  blob,
                  originalSize,
                  compressedSize,
                  reductionPercent: Math.round(
                    ((originalSize - compressedSize) / originalSize) * 100
                  ),
                });
              }
            },
            'image/jpeg',
            quality
          );
        };

        img.onerror = () => {
          reject(new Error('Falha ao carregar imagem'));
        };

        img.src = event.target?.result as string;
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Falha ao ler arquivo'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Formata tamanho de arquivo em bytes para formato legível
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Valida se o arquivo comprimido está dentro do limite
 */
export function isFileSizeValid(blob: Blob, maxSizeKB: number = 5000): boolean {
  return blob.size <= maxSizeKB * 1024;
}
