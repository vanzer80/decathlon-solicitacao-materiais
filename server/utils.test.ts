import { describe, it, expect } from 'vitest';
import { generateRequestId, validateImageFile, formatPhoneNumber } from '../shared/utils';

// Testes para utilitários compartilhados

describe('generateRequestId', () => {
  it('deve gerar um Request ID no formato YYYYMMDD-HHMMSS-6CHARS', () => {
    const requestId = generateRequestId();
    const regex = /^\d{8}-\d{6}-[A-Z0-9]{6}$/;
    expect(requestId).toMatch(regex);
  });

  it('deve gerar IDs únicos', () => {
    const ids = new Set();
    for (let i = 0; i < 10; i++) {
      ids.add(generateRequestId());
    }
    expect(ids.size).toBe(10);
  });

  it('deve ter data válida no início do ID', () => {
    const requestId = generateRequestId();
    const datePart = requestId.substring(0, 8);
    const year = parseInt(datePart.substring(0, 4));
    const month = parseInt(datePart.substring(4, 6));
    const day = parseInt(datePart.substring(6, 8));

    expect(year).toBeGreaterThanOrEqual(2020);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
  });
});

describe('validateImageFile', () => {
  it('deve validar arquivo de imagem válido', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('deve rejeitar arquivo não-imagem', () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error?.toLowerCase()).toContain('imagens');
  });

  it('deve rejeitar arquivo muito grande', () => {
    // Criar um arquivo simulado com tamanho grande
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
    const file = new File([largeBuffer], 'large.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file, 5);
    expect(result.valid).toBe(false);
    expect(result.error?.toLowerCase()).toContain('tamanho');
  });

  it('deve aceitar arquivo dentro do limite de tamanho', () => {
    const content = Buffer.alloc(2 * 1024 * 1024);
    const file = new File([content], 'test.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file, 5);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe('formatPhoneNumber', () => {
  it('deve formatar número de telefone com 11 dígitos', () => {
    const formatted = formatPhoneNumber('11999999999');
    expect(formatted).toBe('(11) 99999-9999');
  });

  it('deve retornar número original se não tiver 11 dígitos', () => {
    const phone = '1234567';
    const formatted = formatPhoneNumber(phone);
    expect(formatted).toBe(phone);
  });

  it('deve remover caracteres não-numéricos antes de formatar', () => {
    const formatted = formatPhoneNumber('(11) 99999-9999');
    expect(formatted).toBe('(11) 99999-9999');
  });
});
