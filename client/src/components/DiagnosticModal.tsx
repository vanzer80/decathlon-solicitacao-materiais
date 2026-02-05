import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DiagnosticModalProps {
  isOpen: boolean;
  isDiagnosing: boolean;
  diagnosticResult: any;
  onDiagnose: () => void;
  onClose: () => void;
}

export function DiagnosticModal({
  isOpen,
  isDiagnosing,
  diagnosticResult,
  onDiagnose,
  onClose,
}: DiagnosticModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Diagnosticar Webhook
        </h3>
        {diagnosticResult ? (
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto text-sm">
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">URL:</p>
              <p className="text-slate-600 dark:text-slate-400 break-all">
                {diagnosticResult.url}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">Status:</p>
              <p
                className={
                  diagnosticResult.status === 200
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {diagnosticResult.status}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                Content-Type:
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {diagnosticResult.contentType}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                Snippet:
              </p>
              <p className="text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 rounded font-mono text-xs">
                {diagnosticResult.bodySnippet}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Clique em "Diagnosticar" para testar a conexão com o webhook.
          </p>
        )}
        <div className="flex gap-2">
          <Button
            onClick={onDiagnose}
            disabled={isDiagnosing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {isDiagnosing ? "Diagnosticando..." : "Diagnosticar"}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 dark:border-slate-600 dark:text-white dark:hover:bg-slate-800"
          >
            Fechar
          </Button>
        </div>
      </Card>
    </div>
  );
}
