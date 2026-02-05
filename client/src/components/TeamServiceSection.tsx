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

interface TeamServiceSectionProps {
  formData: {
    tipo_equipe: string;
    empresa_terceira: string;
    tipo_servico: string;
    sistema_afetado: string;
    descricao_geral_servico: string;
  };
  onFormChange: (field: string, value: string) => void;
}

export function TeamServiceSection({
  formData,
  onFormChange,
}: TeamServiceSectionProps) {
  return (
    <Card className="mb-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 dark:border-slate-700 dark:bg-slate-900">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md">
            2
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Equipe e Serviço</h2>
        </div>

        <div className="space-y-5">
          {/* Tipo de Equipe */}
          <div>
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Tipo de Equipe <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.tipo_equipe} onValueChange={(value) => onFormChange("tipo_equipe", value)}>
              <SelectTrigger className="w-full h-12 text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200">
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
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Empresa / Nome da Equipe <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Nome da empresa"
                value={formData.empresa_terceira}
                onChange={(e) => onFormChange("empresa_terceira", e.target.value)}
                className="h-11 text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Tipo de Serviço */}
          <div>
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Tipo de Serviço <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.tipo_servico} onValueChange={(value) => onFormChange("tipo_servico", value)}>
              <SelectTrigger className="w-full h-12 text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200">
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
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Sistema Afetado <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.sistema_afetado} onValueChange={(value) => onFormChange("sistema_afetado", value)}>
              <SelectTrigger className="w-full h-12 text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200">
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
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Descrição Geral do Serviço <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Descreva o serviço realizado..."
              value={formData.descricao_geral_servico}
              onChange={(e) => onFormChange("descricao_geral_servico", e.target.value)}
              className="min-h-24 text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 transition-all duration-200 resize-none"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
