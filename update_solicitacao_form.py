import re

with open('/home/ubuntu/decathlon-solicitacao-materiais/client/src/pages/SolicitacaoForm.tsx', 'r') as f:
    content = f.read()

# Adicionar import de compressão
old_imports = '''import { AppToast, ToastContainer } from "@/components/AppToast";
import { UploadProgress, PhotoCounter } from "@/components/UploadProgress";
import { SuccessAnimation } from "@/components/SuccessAnimation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { lazy, Suspense } from "react";
import { DiagnosticModal } from "@/components/DiagnosticModal";'''

new_imports = '''import { AppToast, ToastContainer } from "@/components/AppToast";
import { UploadProgress, PhotoCounter } from "@/components/UploadProgress";
import { SuccessAnimation } from "@/components/SuccessAnimation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { lazy, Suspense, useState } from "react";
import { DiagnosticModal } from "@/components/DiagnosticModal";
import { compressImage, formatFileSize, calculateBandwidthSavings } from "@/services/imageCompressionService";'''

content = content.replace(old_imports, new_imports)

# Substituir handleFileSelect com compressão
old_handler = '''  const handleFileSelect = (materialId: string, fotoSlot: "foto1" | "foto2", file?: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === materialId
            ? {
                ...m,
                [fotoSlot]: file,
                [`${fotoSlot}Preview`]: e.target?.result as string,
              }
            : m
        )
      );
    };
    reader.readAsDataURL(file);
  };'''

new_handler = '''  const handleFileSelect = async (materialId: string, fotoSlot: "foto1" | "foto2", file?: File) => {
    if (!file) return;

    // Mostrar toast de compressão
    const toastId = `compress-${materialId}-${fotoSlot}`;
    setToasts((prev) => [...prev, {
      id: toastId,
      type: 'info',
      title: 'Comprimindo imagem...',
      message: 'Aguarde enquanto otimizamos a foto para upload rápido',
    }]);

    try {
      // Comprimir imagem
      const result = await compressImage(file, false, (progress) => {
        // Atualizar progresso
        setUploadProgress((prev) => ({
          ...prev,
          [toastId]: progress,
        }));
      });

      if (!result.success) {
        throw new Error(result.error || 'Erro ao comprimir imagem');
      }

      // Calcular economia
      const savings = calculateBandwidthSavings(result.originalSize, result.compressedSize);

      // Remover toast de compressão
      setToasts((prev) => prev.filter((t) => t.id !== toastId));

      // Mostrar sucesso com economia
      setToasts((prev) => [...prev, {
        id: `success-${toastId}`,
        type: 'success',
        title: 'Imagem comprimida com sucesso!',
        message: `Redução: ${result.compressionRatio.toFixed(0)}% | Economizado: ${savings.formattedSaved}`,
      }]);

      // Converter blob para File
      const compressedFile = new File(
        [result.compressedFile],
        file.name,
        { type: 'image/jpeg' }
      );

      // Ler como data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === materialId
              ? {
                  ...m,
                  [fotoSlot]: compressedFile,
                  [`${fotoSlot}Preview`]: e.target?.result as string,
                }
              : m
          )
        );
      };
      reader.readAsDataURL(result.compressedFile);
    } catch (error) {
      // Remover toast de compressão
      setToasts((prev) => prev.filter((t) => t.id !== toastId));

      // Mostrar erro
      setToasts((prev) => [...prev, {
        id: `error-${toastId}`,
        type: 'error',
        title: 'Erro ao comprimir imagem',
        message: error instanceof Error ? error.message : 'Tente novamente',
      }]);
    }
  };'''

content = content.replace(old_handler, new_handler)

with open('/home/ubuntu/decathlon-solicitacao-materiais/client/src/pages/SolicitacaoForm.tsx', 'w') as f:
    f.write(content)

print("OK")
