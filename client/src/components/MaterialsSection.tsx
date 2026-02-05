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
import { Trash2, Plus, Camera, Image as ImageIcon, X } from "lucide-react";
import { useRef, useCallback } from "react";

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

interface MaterialsSectionProps {
  materials: MaterialItem[];
  onMaterialChange: (materialId: string, field: string, value: any) => void;
  onAddMaterial: () => void;
  onRemoveMaterial: (materialId: string) => void;
  onFileSelect: (materialId: string, fotoSlot: "foto1" | "foto2", file?: File) => void;
  onRemovePhoto: (materialId: string, fotoSlot: "foto1" | "foto2") => void;
}

export function MaterialsSection({
  materials,
  onMaterialChange,
  onAddMaterial,
  onRemoveMaterial,
  onFileSelect,
  onRemovePhoto,
}: MaterialsSectionProps) {
  const fileInputRefs = useRef<Record<string, Record<string, HTMLInputElement | null>>>({});

  /**
   * CORREÇÃO BUG 1 + BUG 4: Trigger file input com reset de value
   * Garante que onChange dispara mesmo para o mesmo arquivo
   * Usa useCallback para estabilizar refs
   */
  const triggerFileInput = useCallback((
    materialId: string,
    fotoSlot: "foto1" | "foto2",
    type: "gallery" | "camera"
  ) => {
    const key = `${fotoSlot}-${type}`;
    const input = fileInputRefs.current[materialId]?.[key];

    if (input) {
      // CRÍTICO: Reset value para permitir selecionar o mesmo arquivo novamente
      input.value = '';
      input.click();
    }
  }, []);

  /**
   * CORREÇÃO BUG 4: Usar useCallback para estabilizar refs
   * Evita que refs sejam reinicializadas em cada render
   */
  const createRefCallback = useCallback((materialId: string, key: string) => {
    return (el: HTMLInputElement | null) => {
      if (!fileInputRefs.current[materialId]) {
        fileInputRefs.current[materialId] = {};
      }
      fileInputRefs.current[materialId][key] = el;
    };
  }, []);

  /**
   * CORREÇÃO BUG 3 + BUG 6: Validar arquivo antes de processar
   * Trata erros e valida tipo de arquivo
   */
  const handleFileSelect = useCallback((
    materialId: string,
    fotoSlot: "foto1" | "foto2",
    file?: File
  ) => {
    try {
      if (!file) {
        return;
      }

      // BUG 6: Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        console.error('[MaterialsSection] Arquivo não é uma imagem:', {
          fileName: file.name,
          fileType: file.type,
        });
        // Mostrar erro para usuário seria ideal aqui
        return;
      }

      // BUG 3: Chamar handler com tratamento de erro
      onFileSelect(materialId, fotoSlot, file);
    } catch (error) {
      // BUG 3: Tratamento de erro com logging
      console.error('[MaterialsSection] Erro ao selecionar arquivo:', {
        materialId,
        fotoSlot,
        error: error instanceof Error ? error.message : String(error),
      });
      // Mostrar toast de erro para usuário seria ideal aqui
    }
  }, [onFileSelect]);

  return (
    <Card className="mb-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 dark:border-slate-700 dark:bg-slate-900">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md">
            3
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Materiais</h2>
          <span className="ml-auto text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            {materials.length} {materials.length === 1 ? "item" : "itens"}
          </span>
        </div>

        <div className="space-y-6">
          {materials.map((material, index) => (
            <div key={material.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 transition-colors">
              {/* Cabeçalho do Material */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-slate-900 dark:text-white">Material {index + 1}</h3>
                {materials.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveMaterial(material.id)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 p-1 rounded transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Descrição */}
                <div>
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                    Descrição <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Ex: Filtro de ar"
                    value={material.material_descricao}
                    onChange={(e) => onMaterialChange(material.id, "material_descricao", e.target.value)}
                    className="h-10 text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Especificação */}
                <div>
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                    Especificação
                  </Label>
                  <Input
                    type="text"
                    placeholder="Ex: Modelo XYZ-123"
                    value={material.material_especificacao}
                    onChange={(e) => onMaterialChange(material.id, "material_especificacao", e.target.value)}
                    className="h-10 text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Quantidade, Unidade, Urgência */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                      Qtd <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={material.quantidade}
                      onChange={(e) => onMaterialChange(material.id, "quantidade", parseInt(e.target.value) || 1)}
                      className="h-10 text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                      Unidade <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={material.unidade}
                      onValueChange={(value) => onMaterialChange(material.id, "unidade", value)}
                    >
                      <SelectTrigger className="h-10 text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500">
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
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                      Urgência <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={material.urgencia}
                      onValueChange={(value) => onMaterialChange(material.id, "urgencia", value)}
                    >
                      <SelectTrigger className="h-10 text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500">
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
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-3">Fotos (Máx 5MB • Até 2 fotos)</p>

                  {/* Foto 1 */}
                  <div className="mb-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Foto 1</p>
                    {material.foto1Preview ? (
                      <div className="relative inline-block">
                        <img
                          src={material.foto1Preview}
                          alt="Preview foto 1"
                          loading="lazy"
                          className="h-24 w-24 object-cover rounded-lg border-2 border-blue-300 dark:border-blue-600 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => onRemovePhoto(material.id, "foto1")}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => triggerFileInput(material.id, "foto1", "gallery")}
                          className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <ImageIcon size={18} />
                          Galeria
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerFileInput(material.id, "foto1", "camera")}
                          className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <Camera size={18} />
                          Câmera
                        </button>
                      </div>
                    )}
                    {/* CORREÇÃO BUG 2: Sintaxe correta - accept e capture separados */}
                    <input
                      ref={createRefCallback(material.id, "foto1-gallery")}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileSelect(material.id, "foto1", e.target.files?.[0])}
                    />
                    <input
                      ref={createRefCallback(material.id, "foto1-camera")}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileSelect(material.id, "foto1", e.target.files?.[0])}
                    />
                  </div>

                  {/* Foto 2 */}
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Foto 2</p>
                    {material.foto2Preview ? (
                      <div className="relative inline-block">
                        <img
                          src={material.foto2Preview}
                          alt="Preview foto 2"
                          loading="lazy"
                          className="h-24 w-24 object-cover rounded-lg border-2 border-blue-300 dark:border-blue-600 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => onRemovePhoto(material.id, "foto2")}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => triggerFileInput(material.id, "foto2", "gallery")}
                          className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <ImageIcon size={18} />
                          Galeria
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerFileInput(material.id, "foto2", "camera")}
                          className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <Camera size={18} />
                          Câmera
                        </button>
                      </div>
                    )}
                    {/* CORREÇÃO BUG 2: Sintaxe correta - accept e capture separados */}
                    <input
                      ref={createRefCallback(material.id, "foto2-gallery")}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileSelect(material.id, "foto2", e.target.files?.[0])}
                    />
                    <input
                      ref={createRefCallback(material.id, "foto2-camera")}
                      type="file"
                      accept="image/*"
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
            onClick={onAddMaterial}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors"
          >
            <Plus size={18} />
            Adicionar Material
          </button>
        </div>
      </div>
    </Card>
  );
}
