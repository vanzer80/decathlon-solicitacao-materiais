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

  const handleFileSelect = (materialId: string, fotoSlot: "foto1" | "foto2", file?: File) => {
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
        <Card className="mb-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md">
                1
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Dados Principais</h2>
            </div>

            <div className="space-y-5">
              {/* Loja */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Loja / Cliente <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Pesquise a loja..."
                    value={searchLoja}
                    onChange={(e) => setSearchLoja(e.target.value)}
                    onFocus={() => setIsLojaDropdownOpen(true)}
                    onClick={() => setIsLojaDropdownOpen(true)}
                    className="w-full h-12 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200"
                  />
                  {isLojaDropdownOpen && filteredLojas.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto mt-2">
                      {filteredLojas.map((loja) => (
                        <button
                          key={loja.Loja_ID}
                          type="button"
                          onClick={() => {
                            setSelectedLoja(loja);
                            setSearchLoja("");
                            setIsLojaDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm border-b border-slate-100 last:border-b-0 transition-colors"
                        >
                          {loja.Loja_Label}
                        </button>
                      ))}
                    </div>
                  )}
                  {isLojaDropdownOpen && filteredLojas.length === 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-lg shadow-lg z-10 p-4 mt-2 text-sm text-slate-600">
                      Nenhuma loja encontrada
                    </div>
                  )}
                </div>
                {selectedLoja && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                    <CheckCircle2 size={16} />
                    {selectedLoja.Loja_Label}
                  </div>
                )}
              </div>

              {/* Nome do Solicitante */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Nome do Solicitante <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.solicitante_nome}
                  onChange={(e) => setFormData({ ...formData, solicitante_nome: e.target.value })}
                  className="h-11 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Telefone e Número do Chamado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Telefone / WhatsApp
                  </Label>
                <Input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.solicitante_telefone}
                  onChange={(e) => setFormData({ ...formData, solicitante_telefone: e.target.value })}
                  className="h-11 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200"
                />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Número do Chamado
                  </Label>
                <Input
                  type="text"
                  placeholder="Ex: CHM-2026-001"
                  value={formData.numero_chamado}
                  onChange={(e) => setFormData({ ...formData, numero_chamado: e.target.value })}
                  className="h-11 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200"
                />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* SEÇÃO 2: EQUIPE E SERVIÇO */}
        <Card className="mb-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md">
                2
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Equipe e Serviço</h2>
            </div>

            <div className="space-y-5">
              {/* Tipo de Equipe */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Tipo de Equipe <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.tipo_equipe} onValueChange={(value) => setFormData({ ...formData, tipo_equipe: value })}>
                  <SelectTrigger className="w-full h-12 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Própria">Própria</SelectItem>
                    <SelectItem value="Terceirizada">Terceirizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Empresa Terceira */}
              {formData.tipo_equipe === "Terceirizada" && (
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Empresa / Nome da Equipe <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Nome da empresa"
                    value={formData.empresa_terceira}
                    onChange={(e) => setFormData({ ...formData, empresa_terceira: e.target.value })}
                    className="h-11 text-sm border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Tipo de Serviço */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Tipo de Serviço <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.tipo_servico} onValueChange={(value) => setFormData({ ...formData, tipo_servico: value })}>
                  <SelectTrigger className="w-full h-12 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventiva">Preventiva</SelectItem>
                    <SelectItem value="Corretiva">Corretiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sistema Afetado */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Sistema Afetado <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.sistema_afetado} onValueChange={(value) => setFormData({ ...formData, sistema_afetado: value })}>
                  <SelectTrigger className="w-full h-12 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Elétrica">Elétrica</SelectItem>
                    <SelectItem value="Hidráulica">Hidráulica</SelectItem>
                    <SelectItem value="Civil">Civil</SelectItem>
                    <SelectItem value="PPCI">PPCI</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição Geral */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Descrição Geral do Serviço <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Descreva o serviço realizado..."
                  value={formData.descricao_geral_servico}
                  onChange={(e) => setFormData({ ...formData, descricao_geral_servico: e.target.value })}
                  className="min-h-24 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200 resize-none"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* SEÇÃO 3: MATERIAIS */}
        <Card className="mb-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md">
                3
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Materiais</h2>
              <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {materials.length} {materials.length === 1 ? "item" : "itens"}
              </span>
            </div>

            <div className="space-y-6">
              {materials.map((material, index) => (
                <div key={material.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 hover:bg-white transition-colors">
                  {/* Cabeçalho do Material */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-slate-900">Material {index + 1}</h3>
                    {materials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMaterial(material.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Descrição */}
                    <div>
                      <Label className="text-xs font-medium text-slate-700 mb-1 block">
                        Descrição <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder="Ex: Filtro de ar"
                        value={material.material_descricao}
                        onChange={(e) =>
                          setMaterials((prev) =>
                            prev.map((m) =>
                              m.id === material.id ? { ...m, material_descricao: e.target.value } : m
                            )
                          )
                        }
                        className="h-10 text-sm border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Especificação */}
                    <div>
                      <Label className="text-xs font-medium text-slate-700 mb-1 block">
                        Especificação
                      </Label>
                      <Input
                        type="text"
                        placeholder="Ex: Modelo XYZ-123"
                        value={material.material_especificacao}
                        onChange={(e) =>
                          setMaterials((prev) =>
                            prev.map((m) =>
                              m.id === material.id ? { ...m, material_especificacao: e.target.value } : m
                            )
                          )
                        }
                        className="h-10 text-sm border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Quantidade, Unidade, Urgência */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs font-medium text-slate-700 mb-1 block">
                          Qtd <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={material.quantidade}
                          onChange={(e) =>
                            setMaterials((prev) =>
                              prev.map((m) =>
                                m.id === material.id ? { ...m, quantidade: parseInt(e.target.value) || 1 } : m
                              )
                            )
                          }
                          className="h-10 text-sm border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-slate-700 mb-1 block">
                          Unidade <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={material.unidade}
                          onValueChange={(value) =>
                            setMaterials((prev) =>
                              prev.map((m) =>
                                m.id === material.id ? { ...m, unidade: value } : m
                              )
                            )
                          }
                        >
                          <SelectTrigger className="h-10 text-sm border-slate-300 focus:ring-2 focus:ring-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="un">un</SelectItem>
                            <SelectItem value="cx">cx</SelectItem>
                            <SelectItem value="par">par</SelectItem>
                            <SelectItem value="m">m</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="rolo">rolo</SelectItem>
                            <SelectItem value="kit">kit</SelectItem>
                            <SelectItem value="outro">outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-slate-700 mb-1 block">
                          Urgência <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={material.urgencia}
                          onValueChange={(value) =>
                            setMaterials((prev) =>
                              prev.map((m) =>
                                m.id === material.id ? { ...m, urgencia: value } : m
                              )
                            )
                          }
                        >
                          <SelectTrigger className="h-10 text-sm border-slate-300 focus:ring-2 focus:ring-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Alta">Alta</SelectItem>
                            <SelectItem value="Média">Média</SelectItem>
                            <SelectItem value="Baixa">Baixa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Fotos */}
                    <div className="border-t border-slate-200 pt-4">
                      <p className="text-xs font-medium text-slate-700 mb-3">Fotos (Máx 5MB • Até 2 fotos)</p>

                      {/* Foto 1 */}
                      <div className="mb-3">
                        <p className="text-xs text-slate-600 mb-2">Foto 1</p>
                        {material.foto1Preview ? (
                          <div className="relative inline-block">
                            <img
                              src={material.foto1Preview}
                              alt="Preview foto 1"
                              loading="lazy"
                              className="h-24 w-24 object-cover rounded-lg border-2 border-blue-300 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(material.id, "foto1")}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-md"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => triggerFileInput(material.id, "foto1", "gallery")}
                              className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-sm font-medium text-slate-700 transition-colors"
                            >
                              <ImageIcon size={18} />
                              Galeria
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerFileInput(material.id, "foto1", "camera")}
                              className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-sm font-medium text-slate-700 transition-colors"
                            >
                              <Camera size={18} />
                              Câmera
                            </button>
                          </div>
                        )}
                        <input
                          ref={(el) => {
                            if (!fileInputRefs.current[material.id]) {
                              fileInputRefs.current[material.id] = {};
                            }
                            fileInputRefs.current[material.id]["foto1-gallery"] = el;
                          }}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleFileSelect(material.id, "foto1", e.target.files?.[0])}
                        />
                        <input
                          ref={(el) => {
                            if (!fileInputRefs.current[material.id]) {
                              fileInputRefs.current[material.id] = {};
                            }
                            fileInputRefs.current[material.id]["foto1-camera"] = el;
                          }}
                          type="file"
                          accept="image/*;capture=environment"
                          capture="environment"
                          style={{ display: "none" }}
                          onChange={(e) => handleFileSelect(material.id, "foto1", e.target.files?.[0])}
                        />
                      </div>

                      {/* Foto 2 */}
                      <div>
                        <p className="text-xs text-slate-600 mb-2">Foto 2</p>
                        {material.foto2Preview ? (
                          <div className="relative inline-block">
                            <img
                              src={material.foto2Preview}
                              alt="Preview foto 2"
                              loading="lazy"
                              className="h-24 w-24 object-cover rounded-lg border-2 border-blue-300 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(material.id, "foto2")}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-md"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => triggerFileInput(material.id, "foto2", "gallery")}
                              className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-sm font-medium text-slate-700 transition-colors"
                            >
                              <ImageIcon size={18} />
                              Galeria
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerFileInput(material.id, "foto2", "camera")}
                              className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-sm font-medium text-slate-700 transition-colors"
                            >
                              <Camera size={18} />
                              Câmera
                            </button>
                          </div>
                        )}
                        <input
                          ref={(el) => {
                            if (!fileInputRefs.current[material.id]) {
                              fileInputRefs.current[material.id] = {};
                            }
                            fileInputRefs.current[material.id]["foto2-gallery"] = el;
                          }}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleFileSelect(material.id, "foto2", e.target.files?.[0])}
                        />
                        <input
                          ref={(el) => {
                            if (!fileInputRefs.current[material.id]) {
                              fileInputRefs.current[material.id] = {};
                            }
                            fileInputRefs.current[material.id]["foto2-camera"] = el;
                          }}
                          type="file"
                          accept="image/*;capture=environment"
                          capture="environment"
                          style={{ display: "none" }}
                          onChange={(e) => handleFileSelect(material.id, "foto2", e.target.files?.[0])}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botão Adicionar Material */}
              <button
                type="button"
                onClick={addMaterial}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-sm font-medium text-blue-600 transition-colors"
              >
                <Plus size={18} />
                Adicionar Material
              </button>
            </div>
          </div>
        </Card>

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
      {showDiagnosticModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Diagnosticar Webhook</h3>
            {diagnosticResult ? (
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto text-sm">
                <div>
                  <p className="font-medium text-slate-700">URL:</p>
                  <p className="text-slate-600 break-all">{diagnosticResult.url}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Status:</p>
                  <p className={diagnosticResult.status === 200 ? "text-green-600" : "text-red-600"}>
                    {diagnosticResult.status}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Content-Type:</p>
                  <p className="text-slate-600">{diagnosticResult.contentType}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Snippet:</p>
                  <p className="text-slate-600 bg-slate-100 p-2 rounded font-mono text-xs">
                    {diagnosticResult.bodySnippet}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 mb-4">Clique em "Diagnosticar" para testar a conexão com o webhook.</p>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => {}}
                disabled={isDiagnosing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isDiagnosing ? "Diagnosticando..." : "Diagnosticar"}
              </Button>
              <Button
                onClick={() => setShowDiagnosticModal(false)}
                variant="outline"
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
