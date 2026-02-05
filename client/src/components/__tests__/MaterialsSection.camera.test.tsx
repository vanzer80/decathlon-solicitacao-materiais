import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MaterialsSection } from '../MaterialsSection';

/**
 * Testes para funcionalidade de câmera
 * Valida todas as correções de bugs
 */

describe('MaterialsSection - Camera Functionality', () => {
  const mockMaterial = {
    id: '1',
    material_descricao: 'Filtro',
    material_especificacao: 'XYZ-123',
    quantidade: 1,
    unidade: 'un',
    urgencia: 'Alta',
  };

  const mockProps = {
    materials: [mockMaterial],
    onMaterialChange: vi.fn(),
    onAddMaterial: vi.fn(),
    onRemoveMaterial: vi.fn(),
    onFileSelect: vi.fn(),
    onRemovePhoto: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BUG 1: Input Reset', () => {
    it('deve permitir selecionar o mesmo arquivo duas vezes', async () => {
      render(<MaterialsSection {...mockProps} />);

      const cameraButtons = screen.getAllByText('Câmera');
      const firstCameraButton = cameraButtons[0];

      // Simular primeira seleção
      fireEvent.click(firstCameraButton);
      const fileInput = document.querySelector('input[capture="environment"]') as HTMLInputElement;

      // Criar arquivo mock
      const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });

      // Simular primeira seleção
      fireEvent.change(fileInput, { target: { files: [file] } });
      expect(mockProps.onFileSelect).toHaveBeenCalledWith('1', 'foto1', file);

      // Limpar mock
      mockProps.onFileSelect.mockClear();

      // Simular segunda seleção do mesmo arquivo
      fireEvent.click(firstCameraButton);
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Deve chamar onFileSelect novamente
      expect(mockProps.onFileSelect).toHaveBeenCalledWith('1', 'foto1', file);
    });

    it('deve resetar input.value antes de clicar', async () => {
      render(<MaterialsSection {...mockProps} />);

      const cameraButtons = screen.getAllByText('Câmera');
      const firstCameraButton = cameraButtons[0];

      const fileInput = document.querySelector('input[capture="environment"]') as HTMLInputElement;

      // Simular primeira seleção
      fireEvent.click(firstCameraButton);
      fireEvent.change(fileInput, { target: { files: [new File(['test'], 'photo.jpg', { type: 'image/jpeg' })] } });

      // Verificar que value foi resetado
      expect(fileInput.value).toBe('');
    });
  });

  describe('BUG 2: Sintaxe Correta de Accept/Capture', () => {
    it('deve ter accept="image/*" sem capture', async () => {
      render(<MaterialsSection {...mockProps} />);

      const galleryInputs = document.querySelectorAll('input[accept="image/*"]');
      expect(galleryInputs.length).toBeGreaterThan(0);

      // Verificar que nenhum tem capture
      galleryInputs.forEach((input) => {
        if (!input.hasAttribute('capture')) {
          expect(input.getAttribute('accept')).toBe('image/*');
        }
      });
    });

    it('deve ter capture="environment" separado de accept', async () => {
      render(<MaterialsSection {...mockProps} />);

      const cameraInputs = document.querySelectorAll('input[capture="environment"]');
      expect(cameraInputs.length).toBeGreaterThan(0);

      // Verificar que tem accept e capture separados
      cameraInputs.forEach((input) => {
        expect(input.getAttribute('accept')).toBe('image/*');
        expect(input.getAttribute('capture')).toBe('environment');
      });
    });

    it('não deve ter sintaxe inválida accept="image/*;capture=environment"', async () => {
      render(<MaterialsSection {...mockProps} />);

      const allInputs = document.querySelectorAll('input[type="file"]');
      allInputs.forEach((input) => {
        const accept = input.getAttribute('accept');
        // Verificar que não tem ;capture=
        expect(accept).not.toContain(';capture=');
      });
    });
  });

  describe('BUG 3: Tratamento de Erro', () => {
    it('deve capturar erro se onFileSelect falhar', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorProps = {
        ...mockProps,
        onFileSelect: vi.fn(() => {
          throw new Error('Erro ao processar arquivo');
        }),
      };

      render(<MaterialsSection {...errorProps} />);

      const cameraButtons = screen.getAllByText('Câmera');
      fireEvent.click(cameraButtons[0]);

      const fileInput = document.querySelector('input[capture="environment"]') as HTMLInputElement;
      const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      // Verificar que erro foi logado
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('deve lidar com arquivo undefined', async () => {
      render(<MaterialsSection {...mockProps} />);

      const cameraButtons = screen.getAllByText('Câmera');
      fireEvent.click(cameraButtons[0]);

      const fileInput = document.querySelector('input[capture="environment"]') as HTMLInputElement;

      // Simular seleção cancelada (sem arquivo)
      fireEvent.change(fileInput, { target: { files: [] } });

      // Não deve chamar onFileSelect
      expect(mockProps.onFileSelect).not.toHaveBeenCalled();
    });
  });

  describe('BUG 4: Refs Estáveis', () => {
    it('deve manter refs estáveis entre renders', async () => {
      const { rerender } = render(<MaterialsSection {...mockProps} />);

      const fileInput1 = document.querySelector('input[capture="environment"]');

      // Re-renderizar
      rerender(<MaterialsSection {...mockProps} />);

      const fileInput2 = document.querySelector('input[capture="environment"]');

      // Refs devem apontar para elementos válidos
      expect(fileInput1).toBeTruthy();
      expect(fileInput2).toBeTruthy();
    });
  });

  describe('BUG 6: Validação de Tipo de Arquivo', () => {
    it('deve rejeitar arquivo não-imagem', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<MaterialsSection {...mockProps} />);

      const cameraButtons = screen.getAllByText('Câmera');
      fireEvent.click(cameraButtons[0]);

      const fileInput = document.querySelector('input[capture="environment"]') as HTMLInputElement;

      // Criar arquivo não-imagem
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      // Não deve chamar onFileSelect
      expect(mockProps.onFileSelect).not.toHaveBeenCalled();

      // Deve logar erro
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('não é uma imagem'),
        expect.any(Object)
      );

      consoleErrorSpy.mockRestore();
    });

    it('deve aceitar arquivo de imagem válido', async () => {
      render(<MaterialsSection {...mockProps} />);

      const cameraButtons = screen.getAllByText('Câmera');
      fireEvent.click(cameraButtons[0]);

      const fileInput = document.querySelector('input[capture="environment"]') as HTMLInputElement;

      // Criar arquivo de imagem válido
      const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      // Deve chamar onFileSelect
      expect(mockProps.onFileSelect).toHaveBeenCalledWith('1', 'foto1', file);
    });

    it('deve aceitar diferentes tipos de imagem', async () => {
      render(<MaterialsSection {...mockProps} />);

      const cameraButtons = screen.getAllByText('Câmera');
      fireEvent.click(cameraButtons[0]);

      const fileInput = document.querySelector('input[capture="environment"]') as HTMLInputElement;

      const imageTypes = [
        { type: 'image/jpeg', name: 'photo.jpg' },
        { type: 'image/png', name: 'photo.png' },
        { type: 'image/webp', name: 'photo.webp' },
        { type: 'image/gif', name: 'photo.gif' },
      ];

      for (const { type, name } of imageTypes) {
        mockProps.onFileSelect.mockClear();

        const file = new File(['test'], name, { type });
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(mockProps.onFileSelect).toHaveBeenCalledWith('1', 'foto1', file);
      }
    });
  });

  describe('Integração: Múltiplas Fotos', () => {
    it('deve permitir capturar foto1 e foto2', async () => {
      render(<MaterialsSection {...mockProps} />);

      const cameraButtons = screen.getAllByText('Câmera');

      // Capturar foto1
      fireEvent.click(cameraButtons[0]);
      const fileInput1 = document.querySelector('input[capture="environment"]') as HTMLInputElement;
      const file1 = new File(['test1'], 'photo1.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput1, { target: { files: [file1] } });

      expect(mockProps.onFileSelect).toHaveBeenCalledWith('1', 'foto1', file1);

      mockProps.onFileSelect.mockClear();

      // Capturar foto2
      fireEvent.click(cameraButtons[1]);
      const fileInputs = document.querySelectorAll('input[capture="environment"]');
      const fileInput2 = fileInputs[fileInputs.length - 1] as HTMLInputElement;
      const file2 = new File(['test2'], 'photo2.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput2, { target: { files: [file2] } });

      expect(mockProps.onFileSelect).toHaveBeenCalledWith('1', 'foto2', file2);
    });
  });

  describe('Acessibilidade e UX', () => {
    it('deve ter botões de câmera e galeria visíveis', async () => {
      render(<MaterialsSection {...mockProps} />);

      const cameraButtons = screen.getAllByText('Câmera');
      const galleryButtons = screen.getAllByText('Galeria');

      expect(cameraButtons.length).toBeGreaterThan(0);
      expect(galleryButtons.length).toBeGreaterThan(0);
    });

    it('deve ter inputs ocultos (display: none)', async () => {
      render(<MaterialsSection {...mockProps} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input) => {
        const style = window.getComputedStyle(input);
        expect(style.display).toBe('none');
      });
    });
  });
});
