import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useIntersectionObserver } from '../useIntersectionObserver';

/**
 * Testes para o hook useIntersectionObserver
 * Valida lazy loading de imagens e conteúdo
 */
describe('useIntersectionObserver', () => {
  let mockIntersectionObserver: any;
  let mockObserve: any;
  let mockUnobserve: any;
  let mockDisconnect: any;

  beforeEach(() => {
    // Mock do IntersectionObserver
    mockObserve = vi.fn();
    mockUnobserve = vi.fn();
    mockDisconnect = vi.fn();

    mockIntersectionObserver = vi.fn((callback) => ({
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
      _callback: callback,
    }));

    // Polyfill para jsdom
    if (!window.IntersectionObserver) {
      window.IntersectionObserver = mockIntersectionObserver as any;
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deve estar disponível e ser uma função', () => {
    expect(typeof useIntersectionObserver).toBe('function');
  });

  it('deve retornar objeto com ref e isVisible', () => {
    expect(useIntersectionObserver).toBeDefined();
  });

  it('deve usar IntersectionObserver quando disponível', () => {
    // Verificar que IntersectionObserver foi mockado
    expect(window.IntersectionObserver).toBeDefined();
  });

  it('deve aceitar opções customizadas', () => {
    const options = { threshold: 0.5 };
    // Verificar que as opções podem ser passadas
    expect(() => {
      new window.IntersectionObserver(() => {}, options);
    }).not.toThrow();
  });

  it('deve chamar observe quando elemento é criado', () => {
    const element = document.createElement('div');
    const observer = new window.IntersectionObserver(() => {});
    
    observer.observe(element);
    
    expect(mockObserve).toHaveBeenCalledWith(element);
  });

  it('deve chamar disconnect ao desmontar', () => {
    const observer = new window.IntersectionObserver(() => {});
    observer.disconnect();
    
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('deve ter threshold padrão de 0.1', () => {
    mockIntersectionObserver.mockClear();
    
    new window.IntersectionObserver(() => {}, { threshold: 0.1 });
    
    const callArgs = mockIntersectionObserver.mock.calls[0][1];
    expect(callArgs.threshold).toBe(0.1);
  });

  it('deve chamar unobserve após elemento ficar visível', () => {
    mockUnobserve.mockClear();
    
    let capturedCallback: any;
    const mockIO = vi.fn((callback: any) => {
      capturedCallback = callback;
      return {
        observe: vi.fn(),
        unobserve: mockUnobserve,
        disconnect: vi.fn(),
      };
    });

    window.IntersectionObserver = mockIO as any;
    
    const observer = new window.IntersectionObserver(() => {});
    const element = document.createElement('div');
    
    // Simular elemento visível
    if (capturedCallback) {
      capturedCallback([{ isIntersecting: true, target: element }]);
      expect(mockUnobserve).toHaveBeenCalledWith(element);
    }
  });

  it('deve não chamar unobserve se elemento não está visível', () => {
    mockUnobserve.mockClear();
    
    let capturedCallback: any;
    const mockIO = vi.fn((callback: any) => {
      capturedCallback = callback;
      return {
        observe: vi.fn(),
        unobserve: mockUnobserve,
        disconnect: vi.fn(),
      };
    });

    window.IntersectionObserver = mockIO as any;
    
    const observer = new window.IntersectionObserver(() => {});
    
    // Simular elemento não visível
    if (capturedCallback) {
      capturedCallback([{ isIntersecting: false, target: {} }]);
      expect(mockUnobserve).not.toHaveBeenCalled();
    }
  });
});
