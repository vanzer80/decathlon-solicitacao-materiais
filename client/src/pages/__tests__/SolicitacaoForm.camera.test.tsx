import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SolicitacaoForm from '../SolicitacaoForm';

/**
 * Testes específicos para verificar que o atributo capture funciona corretamente
 * Este teste garante que o bug de câmera não volta a acontecer
 */
describe('SolicitacaoForm - Camera Input Attributes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar sem erros', () => {
    const { container } = render(<SolicitacaoForm />);
    expect(container).toBeDefined();
  });

  it('deve ter inputs de arquivo para câmera e galeria', () => {
    const { container } = render(<SolicitacaoForm />);
    
    const fileInputs = container.querySelectorAll('input[type="file"]');
    expect(fileInputs.length).toBeGreaterThan(0);
  });

  it('deve ter inputs de câmera com capture="environment"', () => {
    const { container } = render(<SolicitacaoForm />);
    
    const fileInputs = container.querySelectorAll('input[type="file"]');
    
    // Procurar por inputs com capture="environment"
    let cameraInputsFound = 0;
    fileInputs.forEach((input) => {
      const capture = input.getAttribute('capture');
      const accept = input.getAttribute('accept');
      
      if (capture === 'environment') {
        cameraInputsFound++;
        // Verificar que tem o atributo correto no accept
        expect(accept).toContain('image/*');
      }
    });
    
    // Deve ter pelo menos 2 inputs de câmera (foto1 e foto2)
    expect(cameraInputsFound).toBeGreaterThanOrEqual(2);
  });

  it('deve ter inputs de galeria SEM capture', () => {
    const { container } = render(<SolicitacaoForm />);
    
    const fileInputs = container.querySelectorAll('input[type="file"]');
    
    // Procurar por inputs sem capture
    let galleryInputsFound = 0;
    fileInputs.forEach((input) => {
      const capture = input.getAttribute('capture');
      const accept = input.getAttribute('accept');
      
      if (!capture && accept?.includes('image/*')) {
        galleryInputsFound++;
      }
    });
    
    // Deve ter pelo menos 2 inputs de galeria (foto1 e foto2)
    expect(galleryInputsFound).toBeGreaterThanOrEqual(2);
  });

  it('deve ter accept="image/*;capture=environment" nos inputs de câmera', () => {
    const { container } = render(<SolicitacaoForm />);
    
    const fileInputs = container.querySelectorAll('input[type="file"]');
    
    let correctAcceptFound = false;
    fileInputs.forEach((input) => {
      const accept = input.getAttribute('accept');
      const capture = input.getAttribute('capture');
      
      // Verificar que inputs de câmera têm o accept correto
      if (capture === 'environment' && accept === 'image/*;capture=environment') {
        correctAcceptFound = true;
      }
    });
    
    // Deve ter pelo menos um input com accept correto
    expect(correctAcceptFound).toBe(true);
  });

  it('deve ter inputs de galeria com accept="image/*" sem capture', () => {
    const { container } = render(<SolicitacaoForm />);
    
    const fileInputs = container.querySelectorAll('input[type="file"]');
    
    let galleryAcceptCorrect = false;
    fileInputs.forEach((input) => {
      const accept = input.getAttribute('accept');
      const capture = input.getAttribute('capture');
      
      // Verificar que inputs de galeria têm accept simples sem capture no atributo
      if (!capture && accept === 'image/*') {
        galleryAcceptCorrect = true;
      }
    });
    
    // Deve ter pelo menos um input de galeria com accept correto
    expect(galleryAcceptCorrect).toBe(true);
  });

  it('deve ter botões de Câmera e Galeria visíveis', () => {
    render(<SolicitacaoForm />);
    
    const cameraButtons = screen.getAllByText('Câmera');
    const galleryButtons = screen.getAllByText('Galeria');
    
    // Deve ter pelo menos 2 botões de câmera (foto1 e foto2)
    expect(cameraButtons.length).toBeGreaterThanOrEqual(2);
    
    // Deve ter pelo menos 2 botões de galeria (foto1 e foto2)
    expect(galleryButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('deve ter inputs de arquivo ocultos (display: none)', () => {
    const { container } = render(<SolicitacaoForm />);
    
    const fileInputs = container.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach((input) => {
      const style = input.getAttribute('style');
      expect(style).toContain('display: none');
    });
  });

  it('deve ter estrutura correta de inputs: 4 inputs (2 câmera + 2 galeria)', () => {
    const { container } = render(<SolicitacaoForm />);
    
    const fileInputs = container.querySelectorAll('input[type="file"]');
    
    // Deve ter exatamente 4 inputs para o primeiro material (2 câmera + 2 galeria)
    expect(fileInputs.length).toBeGreaterThanOrEqual(4);
    
    // Contar câmera e galeria
    let cameraCount = 0;
    let galleryCount = 0;
    
    fileInputs.forEach((input) => {
      if (input.getAttribute('capture') === 'environment') {
        cameraCount++;
      } else if (!input.getAttribute('capture')) {
        galleryCount++;
      }
    });
    
    // Deve ter pelo menos 2 de cada
    expect(cameraCount).toBeGreaterThanOrEqual(2);
    expect(galleryCount).toBeGreaterThanOrEqual(2);
  });
});
