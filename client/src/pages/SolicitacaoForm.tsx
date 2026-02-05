import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { LojaOption } from "@shared/types";
import { Loader2, Trash2, Plus, Camera, Image as ImageIcon, X, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { AppToast, ToastContainer } from "@/components/AppToast";
import { UploadProgress, PhotoCounter } from "@/components/UploadProgress";
import { SuccessAnimation } from "@/components/SuccessAnimation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { lazy, Suspense } from "react";
import { DiagnosticModal } from "@/components/DiagnosticModal";
import { compressImage, formatFileSize, calculateBandwidthSavings } from "@/services/imageCompressionService";

const MainDataSection = lazy(() => import("@/components/MainDataSection").then(m => ({ default: m.MainDataSection })));
const TeamServiceSection = lazy(() => import("@/components/TeamServiceSection").then(m => ({ default: m.TeamServiceSection })));
const MaterialsSection = lazy(() => import("@/components/MaterialsSection").then(m => ({ default: m.MaterialsSection })));

// Loading fallback para seções
const SectionSkeleton = () => (
  <div className="mb-6 border border-slate-200 rounded-lg p-6 bg-slate-50 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-slate-200 rounded"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
  </div>
);

// Detecta se o dispositivo suporta câmera
const isCameraSupported = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);
  return isMobile;
};

interface MaterialItem {
  id: string;
  material_descricao: string;
  material_especificacao: string;
  quantidade: number;
  unidade: string;
  urgencia: string;
  foto1?: File;
  foto1Preview?: string;
  foto2?: File;
  foto2Preview?: string;
}

export default function SolicitacaoForm() {
  const [lojas, setLojas] = useState<LojaOption[]>([]);
  const [selectedLoja, setSelectedLoja] = useState<LojaOption | null>(null);
  const [searchLoja, setSearchLoja] = useState("");
  const [isLojaDropdownOpen, setIsLojaDropdownOpen] = useState(false);
  const [materials, setMaterials] = useState<MaterialItem[]>([
    {
      id: "1",
      material_descricao: "",
      material_especificacao: "",
      quantidade: 1,
      unidade: "un",
      urgencia: "Média",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [, setLocation] = useLocation();
  
  // Feedback Visual
  const [toasts, setToasts] = useState<any[]>([]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successRequestId, setSuccessRequestId] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const [formData, setFormData] = useState({
    solicitante_nome: "",
    solicitante_telefone: "",
    numero_chamado: "",
    tipo_equipe: "Própria",
    empresa_terceira: "",
    tipo_servico: "Preventiva",
    sistema_afetado: "HVAC",
    descricao_geral_servico: "",
    honeypot: "",
  });

  const fileInputRefs = useRef<Record<string, Record<string, HTMLInputElement | null>>>({});

  const addToast = (type: string, title: string, message?: string) => {
    const id = `toast-${Date.now()}`;
    const newToast = { id, type, title, message, duration: 5000 };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredLojas = lojas.filter((loja) =>
    loja.Loja_Label.toLowerCase().includes(searchLoja.toLowerCase())
  );

  const triggerFileInput = (
    materialId: string,
    fotoSlot: "foto1" | "foto2",
    inputType: "gallery" | "camera"
  ) => {
    if (!fileInputRefs.current[materialId]) {
      fileInputRefs.current[materialId] = {};
    }

    const key = `${fotoSlot}-${inputType}`;
    const input = fileInputRefs.current[materialId][key] as HTMLInputElement | null;
    
    if (input) {
      // Reset input value para permitir selecionar o mesmo arquivo novamente
      input.value = "";
      
      // Log para debug
      console.log(`[Camera] Acionando ${inputType} para ${fotoSlot}`, {
        hasCapture: input.hasAttribute("capture"),
        captureValue: input.getAttribute("capture"),
        accept: input.getAttribute("accept"),
      });
      
      // Trigger file input
      input.click();
    } else {
      console.warn(`[Camera] Input não encontrado: ${key}`);
    }
  };

  const uploadMutation = trpc.upload.uploadPhoto.useMutation();
  const submitMutation = trpc.solicitacoes.submit.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLoja) {
      toast.error("Selecione uma loja");
      return;
    }

    if (!formData.solicitante_nome.trim()) {
      toast.error("Nome do solicitante é obrigatório");
      return;
    }

    if (formData.honeypot) {
      console.warn("[Security] Honeypot field filled - potential bot");
      return;
    }

    if (materials.length === 0) {
      toast.error("Adicione pelo menos um material");
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsWithPhotos = await Promise.all(
        materials.map(async (material) => {
          let foto1_url = "";
          let foto2_url = "";

          if (material.foto1) {
            try {
              const arrayBuffer = await material.foto1.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              const result = await uploadMutation.mutateAsync({
                fileName: `foto1-${material.id}-${Date.now()}`,
                fileData: uint8Array,
                mimeType: material.foto1.type || "image/jpeg",
              });
              foto1_url = result.url || "";
            } catch (error) {
              console.error("Erro ao fazer upload de foto1:", error);
              toast.error("Erro ao fazer upload de foto");
            }
          }

          if (material.foto2) {
            try {
              const arrayBuffer = await material.foto2.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              const result = await uploadMutation.mutateAsync({
                fileName: `foto2-${material.id}-${Date.now()}`,
                fileData: uint8Array,
                mimeType: material.foto2.type || "image/jpeg",
              });
              foto2_url = result.url || "";
            } catch (error) {
              console.error("Erro ao fazer upload de foto2:", error);
              toast.error("Erro ao fazer upload de foto");
            }
          }

          return {
            material_descricao: material.material_descricao,
            material_especificacao: material.material_especificacao || "",
            quantidade: material.quantidade,
            unidade: material.unidade as "un" | "cx" | "par" | "m" | "kg" | "L" | "rolo" | "kit" | "outro",
            urgencia: material.urgencia as "Alta" | "Média" | "Baixa",
            foto1: undefined as any,
            foto1_type: undefined,
            foto2: undefined as any,
            foto2_type: undefined,
            foto1_url: foto1_url,
            foto2_url: foto2_url,
          };
        })
      );

      const result = await submitMutation.mutateAsync({
        loja_id: selectedLoja.Loja_ID,
        loja_label: selectedLoja.Loja_Label,
        solicitante_nome: formData.solicitante_nome,
        solicitante_telefone: formData.solicitante_telefone,
        numero_chamado: formData.numero_chamado,
        tipo_equipe: formData.tipo_equipe as "Própria" | "Terceirizada",
        empresa_terceira: formData.empresa_terceira,
        tipo_servico: formData.tipo_servico as "Preventiva" | "Corretiva",
        sistema_afetado: formData.sistema_afetado as "HVAC" | "Elétrica" | "Hidráulica" | "Civil" | "PPCI" | "Outros",
        descricao_geral_servico: formData.descricao_geral_servico,
        items: itemsWithPhotos,
        honeypot: formData.honeypot,
      });

      if (result.requestId) {
        setSuccessRequestId(result.requestId);
        setShowSuccessAnimation(true);
        addToast("success", "Sucesso!", `Solicitacao #${result.requestId} enviada com sucesso`);
        
        setTimeout(() => {
          setLocation(`/sucesso?id=${result.requestId}`);
        }, 2500);
      }
    } catch (error: any) {
      console.error("[API Mutation Error]", error);
      if (error.data?.code === "BAD_REQUEST") {
        const issues = error.data.zodError?.fieldErrors;
        if (issues) {
          Object.entries(issues).forEach(([field, messages]: any) => {
            toast.error(`${field}: ${messages[0]}`);
          });
        }
      } else {
        addToast("error", "Erro ao enviar", error.message || "Tente novamente");
      }
      setShowDiagnosticModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = async (materialId: string, fotoSlot: "foto1" | "foto2", file?: File) => {
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
      const successMessage = result.usedFallback
        ? 'Foto salva (compressão não disponível)'
        : `Redução: ${result.compressionRatio.toFixed(0)}% | Economizado: ${savings.formattedSaved}`;

      setToasts((prev) => [...prev, {
        id: `success-${toastId}`,
        type: 'success',
        title: result.usedFallback ? 'Foto salva!' : 'Imagem comprimida com sucesso!',
        message: successMessage,
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
  };

  const handleRemovePhoto = (materialId: string, fotoSlot: "foto1" | "foto2") => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === materialId
          ? {
              ...m,
              [fotoSlot]: undefined,
              [`${fotoSlot}Preview`]: undefined,
            }
          : m
      )
    );
  };

  const addMaterial = () => {
    setMaterials((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        material_descricao: "",
        material_especificacao: "",
        quantidade: 1,
        unidade: "un",
        urgencia: "Média",
      },
    ]);
  };

  const removeMaterial = (id: string) => {
    if (materials.length > 1) {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    }
  };



  useEffect(() => {
    fetch("/lojas.json")
      .then((res) => res.json())
      .then((data) => setLojas(data))
      .catch((err) => console.error("Erro ao carregar lojas:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-32 transition-colors">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Solicitação de Materiais</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">MOPAR – Técnicos de Campo</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Sem login • Rápido • Seguro</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* CONTAINER PRINCIPAL */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 dark:text-white">
        {/* Honeypot */}
        <input
          type="text"
          name="honeypot"
          value={formData.honeypot}
          onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
          style={{ display: "none" }}
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* SEÇÃO 1: DADOS PRINCIPAIS */}
        <Suspense fallback={<SectionSkeleton />}>
          <MainDataSection
          selectedLoja={selectedLoja}
          searchLoja={searchLoja}
          filteredLojas={filteredLojas}
          isLojaDropdownOpen={isLojaDropdownOpen}
          formData={{
            solicitante_nome: formData.solicitante_nome,
            solicitante_telefone: formData.solicitante_telefone,
            numero_chamado: formData.numero_chamado,
          }}
          onSearchLoja={setSearchLoja}
          onOpenLojaDropdown={() => setIsLojaDropdownOpen(true)}
          onSelectLoja={(loja) => {
            setSelectedLoja(loja);
            setSearchLoja("");
            setIsLojaDropdownOpen(false);
          }}
          onFormChange={(field, value) => setFormData({ ...formData, [field]: value })}
          />
        </Suspense>

        {/* SEÇÃO 2: EQUIPE E SERVIÇO */}
        <Suspense fallback={<SectionSkeleton />}>
          <TeamServiceSection
          formData={{
            tipo_equipe: formData.tipo_equipe,
            empresa_terceira: formData.empresa_terceira,
            tipo_servico: formData.tipo_servico,
            sistema_afetado: formData.sistema_afetado,
            descricao_geral_servico: formData.descricao_geral_servico,
          }}
          onFormChange={(field, value) => setFormData({ ...formData, [field]: value })}
          />
        </Suspense>

        {/* SEÇÃO 3: MATERIAIS */}
        <Suspense fallback={<SectionSkeleton />}>
          <MaterialsSection
          materials={materials}
          onMaterialChange={(materialId, field, value) => {
            setMaterials((prev) =>
              prev.map((m) =>
                m.id === materialId ? { ...m, [field]: value } : m
              )
            );
          }}
          onAddMaterial={addMaterial}
          onRemoveMaterial={removeMaterial}
          onFileSelect={(materialId, fotoSlot, file) => {
            if (file) handleFileSelect(materialId, fotoSlot, file);
          }}
          onRemovePhoto={handleRemovePhoto}
          />
        </Suspense>

        {/* BOTÃO STICKY BOTTOM */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base rounded-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-md hover:shadow-lg active:shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Enviar Solicitação
                </>
              )}
            </button>
          </div>
        </div>

        <div className="h-4" />
      </form>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Success Animation */}
      <SuccessAnimation show={showSuccessAnimation} requestId={successRequestId} />

      {/* MODAL DIAGNÓSTICO */}
      <DiagnosticModal
        isOpen={showDiagnosticModal}
        isDiagnosing={isDiagnosing}
        diagnosticResult={diagnosticResult}
        onDiagnose={() => {}}
        onClose={() => setShowDiagnosticModal(false)}
      />
    </div>
  );
}
