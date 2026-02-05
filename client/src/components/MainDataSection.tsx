import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { LojaOption } from "@shared/types";

interface MainDataSectionProps {
  selectedLoja: LojaOption | null;
  searchLoja: string;
  filteredLojas: LojaOption[];
  isLojaDropdownOpen: boolean;
  formData: {
    solicitante_nome: string;
    solicitante_telefone: string;
    numero_chamado: string;
  };
  onSearchLoja: (value: string) => void;
  onOpenLojaDropdown: () => void;
  onSelectLoja: (loja: LojaOption) => void;
  onFormChange: (field: string, value: string) => void;
}

export function MainDataSection({
  selectedLoja,
  searchLoja,
  filteredLojas,
  isLojaDropdownOpen,
  formData,
  onSearchLoja,
  onOpenLojaDropdown,
  onSelectLoja,
  onFormChange,
}: MainDataSectionProps) {
  return (
    <Card className="mb-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 dark:border-slate-700 dark:bg-slate-900">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md">
            1
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Dados Principais</h2>
        </div>

        <div className="space-y-5">
          {/* Loja */}
          <div>
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Loja / Cliente <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Pesquise a loja..."
                value={searchLoja}
                onChange={(e) => onSearchLoja(e.target.value)}
                onFocus={onOpenLojaDropdown}
                onClick={onOpenLojaDropdown}
                className="w-full h-12 text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200"
              />
              {isLojaDropdownOpen && filteredLojas.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto mt-2">
                  {filteredLojas.map((loja) => (
                    <button
                      key={loja.Loja_ID}
                      type="button"
                      onClick={() => onSelectLoja(loja)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 text-sm border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors dark:text-white"
                    >
                      {loja.Loja_Label}
                    </button>
                  ))}
                </div>
              )}
              {isLojaDropdownOpen && filteredLojas.length === 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-10 p-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Nenhuma loja encontrada
                </div>
              )}
            </div>
            {selectedLoja && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 size={16} />
                {selectedLoja.Loja_Label}
              </div>
            )}
          </div>

          {/* Nome do Solicitante */}
          <div>
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Nome do Solicitante <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Seu nome completo"
              value={formData.solicitante_nome}
              onChange={(e) => onFormChange("solicitante_nome", e.target.value)}
              className="h-11 text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          {/* Telefone e Número do Chamado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Telefone / WhatsApp
              </Label>
              <Input
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.solicitante_telefone}
                onChange={(e) => onFormChange("solicitante_telefone", e.target.value)}
                className="h-11 text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Número do Chamado
              </Label>
              <Input
                type="text"
                placeholder="Ex: CHM-2026-001"
                value={formData.numero_chamado}
                onChange={(e) => onFormChange("numero_chamado", e.target.value)}
                className="h-11 text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
