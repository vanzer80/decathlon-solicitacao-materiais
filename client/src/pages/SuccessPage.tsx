import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function SuccessPage() {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    // Extrai o requestId da URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("requestId");
    setRequestId(id);
  }, []);

  const handleCopyRequestId = () => {
    if (requestId) {
      navigator.clipboard.writeText(requestId);
      toast.success("Request ID copiado!");
    }
  };

  const handleNewRequest = () => {
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center border-2 border-green-200 shadow-lg">
        {/* Ícone de sucesso */}
        <div className="flex justify-center mb-6">
          <CheckCircle size={64} className="text-green-500" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Solicitação Enviada!
        </h1>

        {/* Descrição */}
        <p className="text-gray-600 mb-6">
          Sua solicitação de materiais foi recebida com sucesso e será processada em breve.
        </p>

        {/* Request ID */}
        {requestId && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Número da Solicitação:</p>
            <div className="flex items-center justify-between bg-white p-3 rounded border border-blue-300">
              <code className="font-mono font-bold text-lg text-blue-600">
                {requestId}
              </code>
              <button
                onClick={handleCopyRequestId}
                className="text-blue-600 hover:text-blue-700 p-1"
                title="Copiar"
              >
                <Copy size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Guarde este número para referência
            </p>
          </div>
        )}

        {/* Mensagem informativa */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-700">
            <strong>Próximos passos:</strong>
          </p>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
            <li>Sua solicitação foi registrada no sistema</li>
            <li>Os materiais serão processados conforme prioridade</li>
            <li>Você receberá atualizações por WhatsApp (se informado)</li>
          </ul>
        </div>

        {/* Botões */}
        <div className="space-y-3">
          <Button
            onClick={handleNewRequest}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
          >
            Nova Solicitação
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full"
          >
            Voltar
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-6">
          Decathlon - Solicitação de Materiais
        </p>
      </Card>
    </div>
  );
}
