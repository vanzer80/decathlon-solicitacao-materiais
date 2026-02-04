import { Upload, CheckCircle2, AlertCircle } from "lucide-react";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadProgressProps {
  status: UploadStatus;
  progress?: number; // 0-100
  fileName?: string;
  errorMessage?: string;
}

export function UploadProgress({
  status,
  progress = 0,
  fileName,
  errorMessage,
}: UploadProgressProps) {
  if (status === "idle") return null;

  return (
    <div className="space-y-2">
      {/* Header com ícone e status */}
      <div className="flex items-center gap-2">
        {status === "uploading" && (
          <Upload className="h-4 w-4 text-blue-600 animate-pulse" />
        )}
        {status === "success" && (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        )}
        {status === "error" && (
          <AlertCircle className="h-4 w-4 text-red-600" />
        )}

        <span className="text-sm font-medium">
          {status === "uploading" && "Enviando..."}
          {status === "success" && "Enviado com sucesso!"}
          {status === "error" && "Erro ao enviar"}
        </span>
      </div>

      {/* Nome do arquivo */}
      {fileName && (
        <p className="text-xs text-slate-600 truncate">{fileName}</p>
      )}

      {/* Progress bar */}
      {status === "uploading" && (
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Porcentagem */}
      {status === "uploading" && (
        <p className="text-xs text-slate-500 text-right">{Math.round(progress)}%</p>
      )}

      {/* Mensagem de erro */}
      {status === "error" && errorMessage && (
        <p className="text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}

interface PhotoCounterProps {
  current: number;
  max: number;
}

export function PhotoCounter({ current, max }: PhotoCounterProps) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
      <span>📷 {current}/{max}</span>
    </div>
  );
}
