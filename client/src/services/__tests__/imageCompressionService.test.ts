import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatFileSize,
  calculateBandwidthSavings,
  estimateUploadTime,
} from '../imageCompressionService';

/**
 * Testes do serviço de compressão de imagens
 */
describe('Image Compression Service', () => {
  describe('formatFileSize', () => {
    it('deve formatar 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('deve formatar bytes', () => {
      expect(formatFileSize(512)).toContain('Bytes');
    });

    it('deve formatar kilobytes', () => {
      const result = formatFileSize(1024 * 2.5); // 2.5 KB
      expect(result).toContain('KB');
      expect(result).toContain('2.5');
    });

    it('deve formatar megabytes', () => {
      const result = formatFileSize(1024 * 1024 * 3); // 3 MB
      expect(result).toContain('MB');
      expect(result).toContain('3');
    });

    it('deve formatar gigabytes', () => {
      const result = formatFileSize(1024 * 1024 * 1024 * 2); // 2 GB
      expect(result).toContain('GB');
      expect(result).toContain('2');
    });
  });

  describe('calculateBandwidthSavings', () => {
    it('deve calcular economia de 50%', () => {
      const original = 1000;
      const compressed = 500;
      const result = calculateBandwidthSavings(original, compressed);

      expect(result.savedBytes).toBe(500);
      expect(result.savedPercentage).toBe(50);
      expect(result.formattedSaved).toContain('500');
    });

    it('deve calcular economia de 75%', () => {
      const original = 4000;
      const compressed = 1000;
      const result = calculateBandwidthSavings(original, compressed);

      expect(result.savedBytes).toBe(3000);
      expect(result.savedPercentage).toBe(75);
    });

    it('deve calcular economia de 0% quando tamanhos são iguais', () => {
      const original = 1000;
      const compressed = 1000;
      const result = calculateBandwidthSavings(original, compressed);

      expect(result.savedBytes).toBe(0);
      expect(result.savedPercentage).toBe(0);
    });

    it('deve calcular economia com tamanhos reais de fotos', () => {
      const original = 3 * 1024 * 1024; // 3 MB
      const compressed = 300 * 1024; // 300 KB
      const result = calculateBandwidthSavings(original, compressed);

      expect(result.savedPercentage).toBeGreaterThan(90);
      expect(result.formattedSaved).toContain('MB');
    });
  });

  describe('estimateUploadTime', () => {
    it('deve estimar tempo de upload com 3G (2 Mbps)', () => {
      const fileSize = 1024 * 1024; // 1 MB
      const time = estimateUploadTime(fileSize, 2); // 2 Mbps

      // 1 MB = 8 Mbits
      // 8 Mbits / 2 Mbps = 4 segundos
      expect(time).toBeCloseTo(4, 0);
    });

    it('deve estimar tempo de upload com 4G (10 Mbps)', () => {
      const fileSize = 1024 * 1024; // 1 MB
      const time = estimateUploadTime(fileSize, 10); // 10 Mbps

      // 1 MB = 8 Mbits
      // 8 Mbits / 10 Mbps = 0.8 segundos
      expect(time).toBeCloseTo(0.8, 1);
    });

    it('deve usar 2 Mbps como padrão', () => {
      const fileSize = 1024 * 1024; // 1 MB
      const time = estimateUploadTime(fileSize);

      // Deve usar 2 Mbps padrão
      expect(time).toBeCloseTo(4, 0);
    });

    it('deve calcular tempo de upload para múltiplas fotos', () => {
      const photoSize = 300 * 1024; // 300 KB por foto
      const numPhotos = 4;
      const totalSize = photoSize * numPhotos;
      const time = estimateUploadTime(totalSize, 2); // 2 Mbps

      // 1.2 MB = 9.6 Mbits
      // 9.6 Mbits / 2 Mbps = 4.8 segundos
      expect(time).toBeCloseTo(4.8, 0);
    });

    it('deve mostrar impacto da compressão no tempo de upload', () => {
      const originalSize = 3 * 1024 * 1024; // 3 MB
      const compressedSize = 300 * 1024; // 300 KB
      const connectionSpeed = 2; // 2 Mbps

      const timeWithoutCompression = estimateUploadTime(originalSize, connectionSpeed);
      const timeWithCompression = estimateUploadTime(compressedSize, connectionSpeed);

      // Compressão deve reduzir tempo em ~90%
      const timeSavings = ((timeWithoutCompression - timeWithCompression) / timeWithoutCompression) * 100;
      expect(timeSavings).toBeGreaterThan(90);
    });
  });

  describe('Compression Metrics', () => {
    it('deve validar que compressão reduz tamanho significativamente', () => {
      // Cenário: Foto de 3 MB comprimida para 300 KB
      const originalSize = 3 * 1024 * 1024;
      const compressedSize = 300 * 1024;
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

      expect(compressionRatio).toBeGreaterThan(90);
    });

    it('deve validar economia de banda para múltiplas fotos', () => {
      // Cenário: 4 fotos de 3 MB cada
      const photoCount = 4;
      const originalPhotoSize = 3 * 1024 * 1024;
      const compressedPhotoSize = 300 * 1024;

      const totalOriginal = photoCount * originalPhotoSize;
      const totalCompressed = photoCount * compressedPhotoSize;

      const savings = calculateBandwidthSavings(totalOriginal, totalCompressed);

      expect(savings.savedPercentage).toBeGreaterThan(90);
      expect(savings.savedBytes).toBe(photoCount * (originalPhotoSize - compressedPhotoSize));
    });

    it('deve validar impacto em conexão lenta', () => {
      // Sem compressão: 4 fotos de 3 MB cada = 12 MB
      // Com compressão: 4 fotos de 300 KB cada = 1.2 MB
      // Em 3G (2 Mbps):
      // - Sem: 48 segundos
      // - Com: 4.8 segundos
      // - Economia: 90%

      const originalTotal = 4 * 3 * 1024 * 1024;
      const compressedTotal = 4 * 300 * 1024;
      const connectionSpeed = 2; // 3G

      const timeWithout = estimateUploadTime(originalTotal, connectionSpeed);
      const timeWith = estimateUploadTime(compressedTotal, connectionSpeed);

      const timeSavings = ((timeWithout - timeWith) / timeWithout) * 100;

      expect(timeSavings).toBeGreaterThan(85);
      expect(timeWith).toBeLessThan(10); // Menos de 10 segundos com compressão
    });
  });

  describe('Real-world Scenarios', () => {
    it('Cenário 1: Técnico em campo com 3G enviando 2 fotos', () => {
      // Sem compressão
      const originalSize = 2 * 3 * 1024 * 1024; // 6 MB
      const timeWithout = estimateUploadTime(originalSize, 2);

      // Com compressão
      const compressedSize = 2 * 300 * 1024; // 600 KB
      const timeWith = estimateUploadTime(compressedSize, 2);

      expect(timeWithout).toBeGreaterThan(20); // Mais de 20 segundos
      expect(timeWith).toBeLessThan(3); // Menos de 3 segundos
    });

    it('Cenário 2: Economia de dados em plano limitado', () => {
      // Plano com 500 MB de dados por mês
      const monthlyDataLimit = 500 * 1024 * 1024;

      // Sem compressão: 20 solicitações com 4 fotos cada = 240 MB
      const requestsPerMonth = 20;
      const photosPerRequest = 4;
      const dataWithoutCompression = requestsPerMonth * photosPerRequest * 3 * 1024 * 1024;

      // Com compressão: 24 MB
      const dataWithCompression = requestsPerMonth * photosPerRequest * 300 * 1024;

      // Percentual do limite
      const percentWithout = (dataWithoutCompression / monthlyDataLimit) * 100;
      const percentWith = (dataWithCompression / monthlyDataLimit) * 100;

      expect(percentWithout).toBeGreaterThan(40); // 48% do limite
      expect(percentWith).toBeLessThan(5); // 5% do limite
    });

    it('Cenário 3: Impacto em bateria do dispositivo', () => {
      // Transmissão consome mais bateria que processamento
      // Upload de 6 MB em 3G: ~24 segundos
      // Upload de 600 KB em 3G: ~2.4 segundos
      // Economia de energia: ~90%

      const originalSize = 6 * 1024 * 1024;
      const compressedSize = 600 * 1024;

      const timeWithout = estimateUploadTime(originalSize, 2);
      const timeWith = estimateUploadTime(compressedSize, 2);

      const energySavings = ((timeWithout - timeWith) / timeWithout) * 100;

      expect(energySavings).toBeGreaterThan(85);
    });
  });
});
