import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    titleColor: "text-green-900",
    messageColor: "text-green-700",
    iconColor: "text-green-600",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    titleColor: "text-red-900",
    messageColor: "text-red-700",
    iconColor: "text-red-600",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    titleColor: "text-blue-900",
    messageColor: "text-blue-700",
    iconColor: "text-blue-600",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    titleColor: "text-yellow-900",
    messageColor: "text-yellow-700",
    iconColor: "text-yellow-600",
  },
};

export function AppToast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Aguardar animação
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        animate-in fade-in slide-in-from-top-2 duration-300
        ${!isVisible ? "animate-out fade-out slide-out-to-top-2" : ""}
        flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md
        ${config.bgColor} ${config.borderColor}
      `}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1">
        <h3 className={`font-semibold ${config.titleColor}`}>{title}</h3>
        {message && <p className={`text-sm mt-1 ${config.messageColor}`}>{message}</p>}
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
        className={`flex-shrink-0 p-1 rounded hover:bg-white/50 transition-colors ${config.iconColor}`}
        aria-label="Fechar notificação"
      >
        <X size={18} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <AppToast key={toast.id} {...toast} onClose={onRemove} />
      ))}
    </div>
  );
}
