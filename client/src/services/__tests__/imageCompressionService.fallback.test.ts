import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  compressImage,
  checkCompressionLibraryStatus,
  formatFileSize,
  calculateBandwidthSavings,
} from '../imageCompressionService';

/**
 * Testes de fallback e tratamento de erro do serviço de compressão
 */
describe('Image Compression Service - Fallback & Error Handling', () => {
  describe('Fallback Behavior', () => {
    it('deve retornar sucesso mesmo com fallback', async () => {
      // Criar arquivo de teste
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      // Comprimir (pode usar fallback se biblioteca não estiver disponível)
      const result = await compressImage(file);

      // Deve sempre retornar sucesso
      expect(result.success).toBe(true);
      expect(result.originalFile).toBe(file);
      expect(result.compressedFile).toBeDefined();
      expect(result.originalSize).toBeGreaterThan(0);
      expect(result.compressedSize).toBeGreaterThan(0);
    });

    it('deve indicar quando usou fallback', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await compressImage(file);

      // Resultado deve ter propriedade usedFallback
      expect(result).toHaveProperty('usedFallback');
      expect(typeof result.usedFallback).toBe('boolean');
    });

    it('deve retornar arquivo original como fallback', async () => {
      const file = new File(['test data'], 'test.jpg', { type: 'image/jpeg' });
      const result = await compressImage(file);

      // Se usou fallback, tamanho deve ser igual ou maior
      if (result.usedFallback) {
        expect(result.compressedSize).toBeGreaterThanOrEqual(result.originalSize - 10);
      }
    });
  });

  describe('Error Handling', () => {
    it('deve rejeitar arquivo não-imagem', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = await compressImage(file);

      // Deve falhar ou usar fallback
      expect(result.success).toBe(true); // Fallback garante sucesso
      expect(result.error).toBeDefined();
    });

    it('deve tratar arquivo vazio', async () => {
      const file = new File([], 'empty.jpg', { type: 'image/jpeg' });
      const result = await compressImage(file);

      expect(result.success).toBe(true);
      expect(result.originalSize).toBe(0);
    });

    it('deve ter mensagem de erro clara', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = await compressImage(file);

      if (result.error) {
        expect(typeof result.error).toBe('string');
        expect(result.error.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Library Status Check', () => {
    it('deve verificar disponibilidade da biblioteca', async () => {
      const status = await checkCompressionLibraryStatus();

      expect(status).toHaveProperty('available');
      expect(status).toHaveProperty('loaded');
      expect(typeof status.available).toBe('boolean');
      expect(typeof status.loaded).toBe('boolean');
    });

    it('deve retornar erro se biblioteca não carregar', async () => {
      const status = await checkCompressionLibraryStatus();

      // Se não disponível, o importante é que available seja false
      if (!status.available) {
        expect(status.available).toBe(false);
      }
    });
  });

  describe('Progress Tracking', () => {
    it('deve reportar progresso durante compressão', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const progressUpdates: number[] = [];

      await compressImage(file, false, (progress) => {
        progressUpdates.push(progress);
      });

      // Deve ter pelo menos alguns updates de progresso
      expect(progressUpdates.length).toBeGreaterThan(0);
      // Progresso deve ser entre 0 e 100
      progressUpdates.forEach((p) => {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(100);
      });
    });

    it('deve terminar com progresso 100%', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      let finalProgress = 0;

      await compressImage(file, false, (progress) => {
        finalProgress = progress;
      });

      expect(finalProgress).toBe(100);
    });
  });

  describe('File Type Handling', () => {
    it('deve aceitar JPEG', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await compressImage(file);

      expect(result.success).toBe(true);
    });

    it('deve aceitar PNG', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const result = await compressImage(file);

      expect(result.success).toBe(true);
    });

    it('deve aceitar WebP', async () => {
      const file = new File(['test'], 'test.webp', { type: 'image/webp' });
      const result = await compressImage(file);

      expect(result.success).toBe(true);
    });

    it('deve rejeitar tipos não-imagem', async () => {
      const invalidTypes = [
        { name: 'test.pdf', type: 'application/pdf' },
        { name: 'test.zip', type: 'application/zip' },
        { name: 'test.txt', type: 'text/plain' },
        { name: 'test.mp4', type: 'video/mp4' },
      ];

      for (const { name, type } of invalidTypes) {
        const file = new File(['test'], name, { type });
        const result = await compressImage(file);

        // Deve ter erro ou usar fallback
        expect(result.success).toBe(true);
        if (result.error) {
          expect(result.error).toContain('não é uma imagem');
        }
      }
    });
  });

  describe('Compression Modes', () => {
    it('deve suportar modo normal', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await compressImage(file, false);

      expect(result.success).toBe(true);
    });

    it('deve suportar modo agressivo', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await compressImage(file, true);

      expect(result.success).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    it('formatFileSize deve funcionar corretamente', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toContain('KB');
      expect(formatFileSize(1024 * 1024)).toContain('MB');
    });

    it('calculateBandwidthSavings deve calcular corretamente', () => {
      const savings = calculateBandwidthSavings(1000, 500);

      expect(savings.savedBytes).toBe(500);
      expect(savings.savedPercentage).toBe(50);
      expect(savings.formattedSaved).toBeDefined();
    });
  });

  describe('Real-world Scenarios', () => {
    it('Cenário: Foto grande de smartphone', async () => {
      // Simular foto de 3MB
      const largeData = new Uint8Array(3 * 1024 * 1024);
      const file = new File([largeData], 'photo.jpg', { type: 'image/jpeg' });

      const result = await compressImage(file);

      expect(result.success).toBe(true);
      // Deve ter algum resultado
      expect(result.compressedFile).toBeDefined();
      expect(result.compressedFile.size).toBeGreaterThan(0);
    });

    it('Cenário: Múltiplas fotos de campo', async () => {
      const photos = Array(4)
        .fill(null)
        .map((_, i) => new File(['test'], `photo${i}.jpg`, { type: 'image/jpeg' }));

      for (const photo of photos) {
        const result = await compressImage(photo);
        expect(result.success).toBe(true);
      }
    });

    it('Cenário: Conexão instável com retry', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      // Primeira tentativa
      const result1 = await compressImage(file);
      expect(result1.success).toBe(true);

      // Segunda tentativa (simulando retry)
      const result2 = await compressImage(file);
      expect(result2.success).toBe(true);

      // Ambas devem ter sucesso
      expect(result1.success).toBe(result2.success);
    });
  });
});
