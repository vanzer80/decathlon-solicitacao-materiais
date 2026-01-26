import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Check, RotateCcw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Câmera traseira em dispositivos móveis
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Aguardar o vídeo estar pronto
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err: any) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Permissão de câmera negada. Verifique as configurações do seu navegador.'
          : err.name === 'NotFoundError'
          ? 'Nenhuma câmera encontrada no dispositivo.'
          : `Erro ao acessar câmera: ${err.message}`
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
      }
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      canvasRef.current?.toBlob(
        (blob) => {
          if (blob) {
            onCapture(blob);
            stopCamera();
            onClose();
          }
        },
        'image/jpeg',
        0.9
      );
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-black">
          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center text-white">
                    <div className="mb-2 inline-block animate-spin">
                      <Camera className="h-8 w-8" />
                    </div>
                    <p className="text-sm">Inicializando câmera...</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <img
              src={capturedImage}
              alt="Foto capturada"
              className="h-full w-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {error && (
          <div className="border-t border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="border-t p-4">
          {!capturedImage ? (
            <div className="flex gap-2">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={!isCameraReady}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={capturePhoto}
                className="flex-1 bg-[#0082C3] hover:bg-[#006ba3]"
                disabled={!isCameraReady}
              >
                <Camera className="mr-2 h-4 w-4" />
                Tirar Foto
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={retakePhoto}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Refazer
              </Button>
              <Button
                onClick={confirmCapture}
                className="flex-1 bg-[#0082C3] hover:bg-[#006ba3]"
              >
                <Check className="mr-2 h-4 w-4" />
                Confirmar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
