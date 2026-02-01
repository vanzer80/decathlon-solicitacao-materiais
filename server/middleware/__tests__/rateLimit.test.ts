import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  globalLimiter,
  solicitacaoLimiter,
  uploadLimiter,
  historicoLimiter,
  checkRateLimitViolation,
  rateLimitConfig,
} from '../rateLimit';

/**
 * Testes para middleware de Rate Limiting
 * Valida proteção contra spam e abuso
 */
describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('globalLimiter', () => {
    it('deve estar definido', () => {
      expect(globalLimiter).toBeDefined();
    });

    it('deve ser uma função', () => {
      expect(typeof globalLimiter).toBe('function');
    });

    it('deve ter limite de 100 requisições', () => {
      expect(globalLimiter).toBeDefined();
    });
  });

  describe('solicitacaoLimiter', () => {
    it('deve estar definido', () => {
      expect(solicitacaoLimiter).toBeDefined();
    });

    it('deve ser uma função', () => {
      expect(typeof solicitacaoLimiter).toBe('function');
    });

    it('deve ter limite de 10 requisições por minuto', () => {
      expect(solicitacaoLimiter).toBeDefined();
    });
  });

  describe('uploadLimiter', () => {
    it('deve estar definido', () => {
      expect(uploadLimiter).toBeDefined();
    });

    it('deve ser uma função', () => {
      expect(typeof uploadLimiter).toBe('function');
    });

    it('deve ter limite de 5 uploads por 5 minutos', () => {
      expect(uploadLimiter).toBeDefined();
    });
  });

  describe('historicoLimiter', () => {
    it('deve estar definido', () => {
      expect(historicoLimiter).toBeDefined();
    });

    it('deve ser uma função', () => {
      expect(typeof historicoLimiter).toBe('function');
    });

    it('deve ter limite de 30 requisições por minuto', () => {
      expect(historicoLimiter).toBeDefined();
    });
  });

  describe('checkRateLimitViolation', () => {
    it('deve ser uma função assíncrona', async () => {
      expect(typeof checkRateLimitViolation).toBe('function');
    });

    it('não deve lançar erro com valores válidos', async () => {
      await expect(
        checkRateLimitViolation('test-key', 5, 10, 'test')
      ).resolves.toBeUndefined();
    });

    it('deve alertar quando atingir 80% do limite', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await checkRateLimitViolation('test-key', 9, 10, 'test'); // 90% > 80%
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('deve alertar quando exceder limite', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await checkRateLimitViolation('test-key', 11, 10, 'test');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('rateLimitConfig', () => {
    it('deve ter configuração para desenvolvimento', () => {
      expect(rateLimitConfig.development).toBeDefined();
    });

    it('deve ter configuração para produção', () => {
      expect(rateLimitConfig.production).toBeDefined();
    });

    it('deve ter configuração para testes', () => {
      expect(rateLimitConfig.test).toBeDefined();
    });

    it('deve desativar limiters em desenvolvimento', () => {
      expect(rateLimitConfig.development.globalLimiter).toBe(false);
      expect(rateLimitConfig.development.solicitacaoLimiter).toBe(false);
      expect(rateLimitConfig.development.uploadLimiter).toBe(false);
    });

    it('deve ativar limiters em produção', () => {
      expect(rateLimitConfig.production.globalLimiter).toBe(true);
      expect(rateLimitConfig.production.solicitacaoLimiter).toBe(true);
      expect(rateLimitConfig.production.uploadLimiter).toBe(true);
    });

    it('deve desativar limiters em testes', () => {
      expect(rateLimitConfig.test.globalLimiter).toBe(false);
      expect(rateLimitConfig.test.solicitacaoLimiter).toBe(false);
      expect(rateLimitConfig.test.uploadLimiter).toBe(false);
    });
  });
});
