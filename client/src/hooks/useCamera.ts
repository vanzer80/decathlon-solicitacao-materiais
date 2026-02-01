import { useRef, useCallback } from 'react';
import { useState } from 'react';

/**
 * Hook para gerenciar câmera com suporte robusto
 * Detecta suporte a câmera e fornece métodos para capturar fotos
 */

interface CameraSupport {
  hasCamera: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  browserName: string;
}

interface CameraOptions {
  facingMode?: 'user' | 'environment';
  onError?: (error: Error) => void;
}

export function useCamera() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Detecta suporte a câmera do dispositivo
   */
  const detectCameraSupport = useCallback((): CameraSupport => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);

    // Detectar navegador
    let browserName = 'unknown';
    if (/chrome/.test(userAgent) && !/edge|edg/.test(userAgent)) {
      browserName = 'chrome';
    } else if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
      browserName = 'safari';
    } else if (/firefox/.test(userAgent)) {
      browserName = 'firefox';
    } else if (/edge|edg/.test(userAgent)) {
      browserName = 'edge';
    }

    const hasCamera = isMobile && (
      typeof navigator !== 'undefined' &&
      !!(navigator.mediaDevices?.getUserMedia || 
       (navigator as any).getUserMedia ||
       (navigator as any).webkitGetUserMedia ||
       (navigator as any).mozGetUserMedia)
    );

    return {
      hasCamera,
      isIOS,
      isAndroid,
      isMobile,
      browserName,
    };
  }, []);

  /**
   * Abre câmera para capturar foto
   * Usa capture="environment" com fallback para input simples
   */
  const openCamera = useCallback((options: CameraOptions = {}) => {
    const { facingMode = 'environment', onError } = options;

    try {
      // Criar input se não existir
      if (!cameraInputRef.current) {
        cameraInputRef.current = document.createElement('input');
        cameraInputRef.current.type = 'file';
        cameraInputRef.current.accept = 'image/*';
        // Usar capture="environment" para câmera traseira
        cameraInputRef.current.setAttribute('capture', facingMode === 'environment' ? 'environment' : 'user');
      }

      // Reset input value para permitir selecionar o mesmo arquivo novamente
      cameraInputRef.current.value = '';

      // Log para debug
      console.log('[useCamera] Abrindo câmera', {
        facingMode,
        hasCapture: cameraInputRef.current.hasAttribute('capture'),
        captureValue: cameraInputRef.current.getAttribute('capture'),
      });

      // Trigger file input
      cameraInputRef.current.click();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[useCamera] Erro ao abrir câmera:', err);
      onError?.(err);
    }
  }, []);

  /**
   * Abre galeria para selecionar foto
   */
  const openGallery = useCallback((onError?: (error: Error) => void) => {
    try {
      // Criar input se não existir
      if (!fileInputRef.current) {
        fileInputRef.current = document.createElement('input');
        fileInputRef.current.type = 'file';
        fileInputRef.current.accept = 'image/*';
        // NÃO usar capture para galeria
      }

      // Reset input value para permitir selecionar o mesmo arquivo novamente
      fileInputRef.current.value = '';

      // Log para debug
      console.log('[useCamera] Abrindo galeria', {
        hasCapture: fileInputRef.current.hasAttribute('capture'),
      });

      // Trigger file input
      fileInputRef.current.click();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[useCamera] Erro ao abrir galeria:', err);
      onError?.(err);
    }
  }, []);

  /**
   * Configura listeners para input de câmera
   */
  const setCameraInputListener = useCallback((
    callback: (file: File) => void
  ) => {
    if (!cameraInputRef.current) {
      cameraInputRef.current = document.createElement('input');
      cameraInputRef.current.type = 'file';
      cameraInputRef.current.accept = 'image/*';
      cameraInputRef.current.setAttribute('capture', 'environment');
    }

    cameraInputRef.current.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        callback(file);
      }
    };
  }, []);

  /**
   * Configura listeners para input de galeria
   */
  const setGalleryInputListener = useCallback((
    callback: (file: File) => void
  ) => {
    if (!fileInputRef.current) {
      fileInputRef.current = document.createElement('input');
      fileInputRef.current.type = 'file';
      fileInputRef.current.accept = 'image/*';
    }

    fileInputRef.current.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        callback(file);
      }
    };
  }, []);

  return {
    detectCameraSupport,
    openCamera,
    openGallery,
    setCameraInputListener,
    setGalleryInputListener,
    cameraInputRef,
    fileInputRef,
  };
}
