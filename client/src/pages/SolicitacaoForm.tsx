import { useState, useEffect } from "react";
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
import { Loader2, Trash2, Plus } from "lucide-react";

interface MaterialItem {
  id: string;
  material_descricao: string;
  material_especificacao: string;
  quantidade: number;
  unidade: string;
  urgencia: string;
  foto1?: File;
  foto2?: File;
}

export default function SolicitacaoForm() {
  const [lojas, setLojas] = useState<LojaOption[]>([]);
  const [selectedLoja, setSelectedLoja] = useState<LojaOption | null>(null);
  const [searchLoja, setSearchLoja] = useState("");
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

  // Formulário principal
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

  // Carrega lista de lojas
  useEffect(() => {
    fetch("/lojas.json")
      .then((res) => res.json())
      .then((data) => setLojas(data))
      .catch((err) => {
        console.error("Erro ao carregar lojas:", err);
        toast.error("Erro ao carregar lista de lojas");
      });
  }, []);

  const filteredLojas = lojas.filter((loja) =>
    loja.Loja_Label.toLowerCase().includes(searchLoja.toLowerCase())
  );

  const handleMaterialChange = (id: string, field: string, value: unknown) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const handleAddMaterial = () => {
    const newId = String(Math.max(...materials.map((m) => parseInt(m.id) || 0)) + 1);
    setMaterials((prev) => [
      ...prev,
      {
        id: newId,
        material_descricao: "",
        material_especificacao: "",
        quantidade: 1,
        unidade: "un",
        urgencia: "Média",
      },
    ]);
  };

  const handleRemoveMaterial = (id: string) => {
    if (materials.length > 1) {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleFileChange = (id: string, field: string, file: File | undefined) => {
    handleMaterialChange(id, field, file);
  };

  const submitMutation = trpc.solicitacoes.submit.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!selectedLoja) {
      toast.error("Selecione uma loja");
      return;
    }

    if (!formData.solicitante_nome.trim()) {
      toast.error("Nome do solicitante é obrigatório");
      return;
    }

    if (formData.tipo_equipe === "Terceirizada" && !formData.empresa_terceira.trim()) {
      toast.error("Empresa terceira é obrigatória");
      return;
    }

    if (!formData.descricao_geral_servico.trim()) {
      toast.error("Descrição geral do serviço é obrigatória");
      return;
    }

    // Valida materiais
    for (const material of materials) {
      if (!material.material_descricao.trim()) {
        toast.error("Descrição do material é obrigatória");
        return;
      }
      if (material.quantidade <= 0) {
        toast.error("Quantidade deve ser maior que 0");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Processa fotos
      const itemsWithPhotos = await Promise.all(
        materials.map(async (material) => {
          let foto1: Buffer | undefined;
          let foto1_type: string | undefined;
          let foto2: Buffer | undefined;
          let foto2_type: string | undefined;

          if (material.foto1) {
            const buffer = await material.foto1.arrayBuffer();
            foto1 = Buffer.from(buffer);
            foto1_type = material.foto1.type;
          }

          if (material.foto2) {
            const buffer = await material.foto2.arrayBuffer();
            foto2 = Buffer.from(buffer);
            foto2_type = material.foto2.type;
          }

          return {
            material_descricao: material.material_descricao,
            material_especificacao: material.material_especificacao || "",
            quantidade: material.quantidade,
            unidade: material.unidade as "un" | "cx" | "par" | "m" | "kg" | "L" | "rolo" | "kit" | "outro",
            urgencia: material.urgencia as "Alta" | "Média" | "Baixa",
            foto1,
            foto1_type,
            foto2,
            foto2_type,
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
        tipo_servico: formData.tipo_servico as "Preventiva" | "Corretiva",
        sistema_afetado: formData.sistema_afetado as "HVAC" | "Elétrica" | "Hidráulica" | "Civil" | "PPCI" | "Outros",
        descricao_geral_servico: formData.descricao_geral_servico,
        items: itemsWithPhotos,
        honeypot: formData.honeypot,
      });

      toast.success("Solicitação enviada com sucesso!");
      // Redireciona para tela de sucesso
      window.location.href = `/sucesso?requestId=${result.requestId}`;
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao enviar solicitação"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-8 pt-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Solicitação de Materiais
          </h1>
          <p className="text-gray-600">Decathlon - Técnicos de Campo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
          <Card className="p-6 border-2 border-blue-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              1. Dados Principais
            </h2>

            <div className="space-y-4">
              {/* Loja */}
              <div>
                <Label className="text-gray-700 font-medium">
                  Loja / Cliente <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-2">
                  <Input
                    type="text"
                    placeholder="Pesquise a loja..."
                    value={searchLoja}
                    onChange={(e) => setSearchLoja(e.target.value)}
                    className="w-full"
                  />
                  {searchLoja && filteredLojas.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto mt-1">
                      {filteredLojas.map((loja) => (
                        <button
                          key={loja.Loja_ID}
                          type="button"
                          onClick={() => {
                            setSelectedLoja(loja);
                            setSearchLoja("");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm"
                        >
                          {loja.Loja_Label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedLoja && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {selectedLoja.Loja_Label}
                  </p>
                )}
              </div>

              {/* Nome do Solicitante */}
              <div>
                <Label className="text-gray-700 font-medium">
                  Nome do Solicitante <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.solicitante_nome}
                  onChange={(e) =>
                    setFormData({ ...formData, solicitante_nome: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              {/* Telefone */}
              <div>
                <Label className="text-gray-700 font-medium">
                  Telefone / WhatsApp
                </Label>
                <Input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.solicitante_telefone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      solicitante_telefone: e.target.value,
                    })
                  }
                  className="mt-2"
                />
              </div>

              {/* Número do Chamado */}
              <div>
                <Label className="text-gray-700 font-medium">
                  Número do Chamado
                </Label>
                <Input
                  type="text"
                  placeholder="Ex: CHM-2026-001"
                  value={formData.numero_chamado}
                  onChange={(e) =>
                    setFormData({ ...formData, numero_chamado: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* SEÇÃO 2: EQUIPE E SERVIÇO */}
          <Card className="p-6 border-2 border-blue-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              2. Equipe e Serviço
            </h2>

            <div className="space-y-4">
              {/* Tipo de Equipe */}
              <div>
                <Label className="text-gray-700 font-medium">
                  Tipo de Equipe <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.tipo_equipe}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipo_equipe: value })
                  }
                >
                  <SelectTrigger className="mt-2">
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
                  <Label className="text-gray-700 font-medium">
                    Empresa / Nome da Equipe Terceirizada{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Nome da empresa"
                    value={formData.empresa_terceira}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        empresa_terceira: e.target.value,
                      })
                    }
                    className="mt-2"
                  />
                </div>
              )}

              {/* Tipo de Serviço */}
              <div>
                <Label className="text-gray-700 font-medium">
                  Tipo de Serviço <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.tipo_servico}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipo_servico: value })
                  }
                >
                  <SelectTrigger className="mt-2">
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
                <Label className="text-gray-700 font-medium">
                  Tipo de Serviço / Equipamento <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.sistema_afetado}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sistema_afetado: value })
                  }
                >
                  <SelectTrigger className="mt-2">
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
                <Label className="text-gray-700 font-medium">
                  Descrição Geral do Serviço <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Descreva o serviço que será realizado..."
                  value={formData.descricao_geral_servico}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      descricao_geral_servico: e.target.value,
                    })
                  }
                  className="mt-2 min-h-24"
                />
              </div>
            </div>
          </Card>

          {/* SEÇÃO 3: MATERIAIS */}
          <Card className="p-6 border-2 border-blue-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              3. Materiais <span className="text-red-500">*</span>
            </h2>

            <div className="space-y-4">
              {materials.map((material, index) => (
                <div
                  key={material.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">
                      Material {index + 1}
                    </h3>
                    {materials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(material.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Descrição */}
                    <div>
                      <Label className="text-sm text-gray-700">
                        Descrição <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder="Descreva o material"
                        value={material.material_descricao}
                        onChange={(e) =>
                          handleMaterialChange(
                            material.id,
                            "material_descricao",
                            e.target.value
                          )
                        }
                        className="mt-1"
                      />
                    </div>

                    {/* Especificação */}
                    <div>
                      <Label className="text-sm text-gray-700">
                        Especificação Técnica
                      </Label>
                      <Input
                        type="text"
                        placeholder="Ex: 220V, 10A"
                        value={material.material_especificacao}
                        onChange={(e) =>
                          handleMaterialChange(
                            material.id,
                            "material_especificacao",
                            e.target.value
                          )
                        }
                        className="mt-1"
                      />
                    </div>

                    {/* Quantidade e Unidade */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm text-gray-700">
                          Quantidade <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={material.quantidade}
                          onChange={(e) =>
                            handleMaterialChange(
                              material.id,
                              "quantidade",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-700">
                          Unidade <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={material.unidade}
                          onValueChange={(value) =>
                            handleMaterialChange(material.id, "unidade", value)
                          }
                        >
                          <SelectTrigger className="mt-1">
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
                    </div>

                    {/* Urgência */}
                    <div>
                      <Label className="text-sm text-gray-700">
                        Urgência <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={material.urgencia}
                        onValueChange={(value) =>
                          handleMaterialChange(material.id, "urgencia", value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Alta">Alta</SelectItem>
                          <SelectItem value="Média">Média</SelectItem>
                          <SelectItem value="Baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fotos */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm text-gray-700">Foto 1</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(
                              material.id,
                              "foto1",
                              e.target.files?.[0]
                            )
                          }
                          className="mt-1"
                        />
                        {material.foto1 && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ {material.foto1.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm text-gray-700">Foto 2</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(
                              material.id,
                              "foto2",
                              e.target.files?.[0]
                            )
                          }
                          className="mt-1"
                        />
                        {material.foto2 && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ {material.foto2.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botão Adicionar Material */}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddMaterial}
                className="w-full"
              >
                <Plus size={18} className="mr-2" />
                Adicionar Material
              </Button>
            </div>
          </Card>

          {/* Botão Enviar */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Solicitação"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
