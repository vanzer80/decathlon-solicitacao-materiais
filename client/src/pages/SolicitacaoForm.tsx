import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { generateRequestId, validateImageFile } from '@shared/utils';
import { TIPOS_EQUIPE, TIPOS_SERVICO, SISTEMAS_AFETADOS, UNIDADES, URGENCIAS, MAX_FOTO_SIZE } from '@shared/constants';
import type { Loja, MaterialItem } from '@shared/types';
import { Plus, Trash2, Upload, CheckCircle } from 'lucide-react';

interface FormData {
  lojaId: string;
  lojaLabel: string;
  solicitanteNome: string;
  solicitanteTelefone: string;
  numeroChamado: string;
  tipoEquipe: string;
  empresaTerceira: string;
  tipoServico: string;
  sistemaAfetado: string;
  descricaoGeralServico: string;
  honeypot: string;
}

interface MaterialFormData extends MaterialItem {
  id: string;
  foto1Preview?: string;
  foto2Preview?: string;
}

export default function SolicitacaoForm() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [filteredLojas, setFilteredLojas] = useState<Loja[]>([]);
  const [lojaSearchOpen, setLojaSearchOpen] = useState(false);
  const [lojaSearchValue, setLojaSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [successRequestId, setSuccessRequestId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    lojaId: '',
    lojaLabel: '',
    solicitanteNome: '',
    solicitanteTelefone: '',
    numeroChamado: '',
    tipoEquipe: '',
    empresaTerceira: '',
    tipoServico: '',
    sistemaAfetado: '',
    descricaoGeralServico: '',
    honeypot: '',
  });

  const [materiais, setMateriais] = useState<MaterialFormData[]>([
    { id: '1', descricao: '', quantidade: 1, unidade: 'un', urgencia: 'Média' },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const submitMutation = trpc.solicitacao.submit.useMutation();

  // Carregar lojas
  useEffect(() => {
    const loadLojas = async () => {
      try {
        const response = await fetch('/lojas.json');
        const data = await response.json();
        setLojas(data);
      } catch (error) {
        console.error('Erro ao carregar lojas:', error);
        toast.error('Erro ao carregar lista de lojas');
      }
    };
    loadLojas();
  }, []);

  // Filtrar lojas baseado na busca
  useEffect(() => {
    if (lojaSearchValue.trim() === '') {
      setFilteredLojas([]);
    } else {
      const filtered = lojas.filter(loja =>
        loja.label.toLowerCase().includes(lojaSearchValue.toLowerCase()) ||
        loja.id.includes(lojaSearchValue)
      );
      setFilteredLojas(filtered.slice(0, 10));
    }
  }, [lojaSearchValue, lojas]);

  const handleSelectLoja = (loja: Loja) => {
    setFormData(prev => ({
      ...prev,
      lojaId: loja.id,
      lojaLabel: loja.label,
    }));
    setLojaSearchValue(loja.label);
    setLojaSearchOpen(false);
  };

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMaterialChange = (id: string, field: string, value: any) => {
    setMateriais(prev =>
      prev.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const handleAddMaterial = () => {
    const newId = String(Math.max(...materiais.map(m => parseInt(m.id) || 0)) + 1);
    setMateriais(prev => [
      ...prev,
      { id: newId, descricao: '', quantidade: 1, unidade: 'un', urgencia: 'Média' },
    ]);
  };

  const handleRemoveMaterial = (id: string) => {
    if (materiais.length > 1) {
      setMateriais(prev => prev.filter(m => m.id !== id));
    } else {
      toast.error('Deve haver pelo menos um material');
    }
  };

  const handleFotoChange = (id: string, fotoField: 'foto1' | 'foto2', file: File | undefined) => {
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Erro ao validar imagem');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const previewField = fotoField === 'foto1' ? 'foto1Preview' : 'foto2Preview';
        setMateriais(prev =>
          prev.map(m =>
            m.id === id
              ? {
                  ...m,
                  [fotoField]: file,
                  [previewField]: e.target?.result as string,
                }
              : m
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.lojaId) newErrors.lojaId = 'Loja é obrigatória';
    if (!formData.solicitanteNome.trim()) newErrors.solicitanteNome = 'Nome do solicitante é obrigatório';
    if (!formData.tipoEquipe) newErrors.tipoEquipe = 'Tipo de equipe é obrigatório';
    if (formData.tipoEquipe === 'Terceirizada' && !formData.empresaTerceira.trim()) {
      newErrors.empresaTerceira = 'Empresa terceira é obrigatória';
    }
    if (!formData.tipoServico) newErrors.tipoServico = 'Tipo de serviço é obrigatório';
    if (!formData.sistemaAfetado) newErrors.sistemaAfetado = 'Sistema afetado é obrigatório';
    if (!formData.descricaoGeralServico.trim()) newErrors.descricaoGeralServico = 'Descrição é obrigatória';

    if (materiais.length === 0) {
      newErrors.materiais = 'Deve haver pelo menos um material';
    } else {
      materiais.forEach((m, idx) => {
        if (!m.descricao.trim()) newErrors[`material_${m.id}_descricao`] = 'Descrição obrigatória';
        if (m.quantidade <= 0) newErrors[`material_${m.id}_quantidade`] = 'Quantidade deve ser > 0';
        if (!m.unidade) newErrors[`material_${m.id}_unidade`] = 'Unidade obrigatória';
        if (!m.urgencia) newErrors[`material_${m.id}_urgencia`] = 'Urgência obrigatória';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const requestId = generateRequestId();
      const timestampEnvio = new Date().toISOString();

      // Upload de fotos
      const foto1Urls: string[] = [];
      const foto2Urls: string[] = [];

      for (const material of materiais) {
        let foto1Url = '';
        let foto2Url = '';

        if (material.foto1) {
          try {
            const formDataFoto = new FormData();
            formDataFoto.append('file', material.foto1);
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formDataFoto,
            });
            if (uploadResponse.ok) {
              const { url } = await uploadResponse.json();
              foto1Url = url;
            }
          } catch (error) {
            console.error('Erro ao fazer upload da foto 1:', error);
          }
        }

        if (material.foto2) {
          try {
            const formDataFoto = new FormData();
            formDataFoto.append('file', material.foto2);
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formDataFoto,
            });
            if (uploadResponse.ok) {
              const { url } = await uploadResponse.json();
              foto2Url = url;
            }
          } catch (error) {
            console.error('Erro ao fazer upload da foto 2:', error);
          }
        }

        foto1Urls.push(foto1Url);
        foto2Urls.push(foto2Url);
      }

      // Enviar solicitação
      const result = await submitMutation.mutateAsync({
        requestId,
        timestampEnvio,
        honeypot: formData.honeypot,
        header: {
          lojaId: formData.lojaId,
          lojaLabel: formData.lojaLabel,
          solicitanteNome: formData.solicitanteNome,
          solicitanteTelefone: formData.solicitanteTelefone,
          numeroChamado: formData.numeroChamado,
          tipoEquipe: formData.tipoEquipe,
          empresaTerceira: formData.empresaTerceira,
          tipoServico: formData.tipoServico,
          sistemaAfetado: formData.sistemaAfetado,
          descricaoGeralServico: formData.descricaoGeralServico,
        },
        items: materiais.map(m => ({
          materialDescricao: m.descricao,
          materialEspecificacao: m.especificacao || '',
          quantidade: m.quantidade,
          unidade: m.unidade,
          urgencia: m.urgencia,
        })),
        foto1Urls,
        foto2Urls,
      });

      if (result.success) {
        setSuccessRequestId(result.requestId);
        toast.success('Solicitação enviada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao enviar solicitação');
      }
    } catch (error: any) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error(error.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleNovasolicitacao = () => {
    setSuccessRequestId(null);
    setFormData({
      lojaId: '',
      lojaLabel: '',
      solicitanteNome: '',
      solicitanteTelefone: '',
      numeroChamado: '',
      tipoEquipe: '',
      empresaTerceira: '',
      tipoServico: '',
      sistemaAfetado: '',
      descricaoGeralServico: '',
      honeypot: '',
    });
    setMateriais([
      { id: '1', descricao: '', quantidade: 1, unidade: 'un', urgencia: 'Média' },
    ]);
    setErrors({});
  };

  if (successRequestId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#e8f4fb' }}>
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-8">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#0082C3' }} />
              <h2 className="text-2xl font-bold mb-2">Solicitação Enviada!</h2>
              <p className="text-gray-600 mb-6">Sua solicitação foi registrada com sucesso.</p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-1">ID da Solicitação:</p>
                <p className="text-lg font-mono font-bold" style={{ color: '#0082C3' }}>
                  {successRequestId}
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Guarde este ID para acompanhar sua solicitação. O time de Compras entrará em contato em breve.
              </p>

              <Button
                onClick={handleNovasolicitacao}
                className="w-full"
                style={{ backgroundColor: '#0082C3' }}
              >
                Nova Solicitação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-8" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0082C3' }}>
            Solicitação de Materiais
          </h1>
          <p className="text-gray-600">Decathlon - Manutenção e Suporte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot */}
          <input
            type="text"
            name="website"
            value={formData.honeypot}
            onChange={(e) => handleFormChange('honeypot', e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* SEÇÃO 1: DADOS PRINCIPAIS */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Principais</CardTitle>
              <CardDescription>Informações do solicitante e da loja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Loja */}
              <div>
                <Label htmlFor="loja">Loja *</Label>
                <div className="relative mt-2">
                  <Input
                    placeholder="Buscar loja..."
                    value={lojaSearchValue}
                    onChange={(e) => setLojaSearchValue(e.target.value)}
                    onFocus={() => setLojaSearchOpen(true)}
                    className={errors.lojaId ? 'border-red-500' : ''}
                  />
                  {lojaSearchOpen && filteredLojas.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredLojas.map(loja => (
                        <button
                          key={loja.id}
                          type="button"
                          onClick={() => handleSelectLoja(loja)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-b-0"
                        >
                          <div className="font-semibold text-sm">{loja.id}</div>
                          <div className="text-xs text-gray-600">{loja.label}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.lojaId && <p className="text-red-500 text-sm mt-1">{errors.lojaId}</p>}
                {formData.lojaId && (
                  <p className="text-sm text-green-600 mt-1">✓ {formData.lojaLabel}</p>
                )}
              </div>

              {/* Nome do Solicitante */}
              <div>
                <Label htmlFor="solicitanteNome">Nome do Solicitante *</Label>
                <Input
                  id="solicitanteNome"
                  placeholder="Digite seu nome completo"
                  value={formData.solicitanteNome}
                  onChange={(e) => handleFormChange('solicitanteNome', e.target.value)}
                  className={errors.solicitanteNome ? 'border-red-500 mt-2' : 'mt-2'}
                />
                {errors.solicitanteNome && <p className="text-red-500 text-sm mt-1">{errors.solicitanteNome}</p>}
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.solicitanteTelefone}
                  onChange={(e) => handleFormChange('solicitanteTelefone', e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Número do Chamado */}
              <div>
                <Label htmlFor="chamado">Número do Chamado</Label>
                <Input
                  id="chamado"
                  placeholder="Ex: CHM-2026-001"
                  value={formData.numeroChamado}
                  onChange={(e) => handleFormChange('numeroChamado', e.target.value)}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO 2: EQUIPE E SERVIÇO */}
          <Card>
            <CardHeader>
              <CardTitle>Equipe e Serviço</CardTitle>
              <CardDescription>Informações sobre o tipo de serviço</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de Equipe */}
              <div>
                <Label htmlFor="tipoEquipe">Tipo de Equipe *</Label>
                <Select value={formData.tipoEquipe} onValueChange={(value) => handleFormChange('tipoEquipe', value)}>
                  <SelectTrigger id="tipoEquipe" className={`mt-2 ${errors.tipoEquipe ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_EQUIPE.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoEquipe && <p className="text-red-500 text-sm mt-1">{errors.tipoEquipe}</p>}
              </div>

              {/* Empresa Terceira (condicional) */}
              {formData.tipoEquipe === 'Terceirizada' && (
                <div>
                  <Label htmlFor="empresaTerceira">Empresa / Nome da Equipe Terceirizada *</Label>
                  <Input
                    id="empresaTerceira"
                    placeholder="Digite o nome da empresa"
                    value={formData.empresaTerceira}
                    onChange={(e) => handleFormChange('empresaTerceira', e.target.value)}
                    className={`mt-2 ${errors.empresaTerceira ? 'border-red-500' : ''}`}
                  />
                  {errors.empresaTerceira && <p className="text-red-500 text-sm mt-1">{errors.empresaTerceira}</p>}
                </div>
              )}

              {/* Tipo de Serviço */}
              <div>
                <Label htmlFor="tipoServico">Tipo de Serviço *</Label>
                <Select value={formData.tipoServico} onValueChange={(value) => handleFormChange('tipoServico', value)}>
                  <SelectTrigger id="tipoServico" className={`mt-2 ${errors.tipoServico ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_SERVICO.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoServico && <p className="text-red-500 text-sm mt-1">{errors.tipoServico}</p>}
              </div>

              {/* Sistema Afetado */}
              <div>
                <Label htmlFor="sistemaAfetado">Tipo de Serviço / Equipamento *</Label>
                <Select value={formData.sistemaAfetado} onValueChange={(value) => handleFormChange('sistemaAfetado', value)}>
                  <SelectTrigger id="sistemaAfetado" className={`mt-2 ${errors.sistemaAfetado ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SISTEMAS_AFETADOS.map(sistema => (
                      <SelectItem key={sistema} value={sistema}>{sistema}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sistemaAfetado && <p className="text-red-500 text-sm mt-1">{errors.sistemaAfetado}</p>}
              </div>

              {/* Descrição Geral */}
              <div>
                <Label htmlFor="descricao">Descrição Geral do Serviço *</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o serviço que precisa ser realizado..."
                  value={formData.descricaoGeralServico}
                  onChange={(e) => handleFormChange('descricaoGeralServico', e.target.value)}
                  rows={4}
                  className={`mt-2 ${errors.descricaoGeralServico ? 'border-red-500' : ''}`}
                />
                {errors.descricaoGeralServico && <p className="text-red-500 text-sm mt-1">{errors.descricaoGeralServico}</p>}
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO 3: MATERIAIS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Materiais Solicitados *</h2>
              <Button
                type="button"
                onClick={handleAddMaterial}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Material
              </Button>
            </div>

            <div className="space-y-4">
              {materiais.map((material, idx) => (
                <Card key={material.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Material {idx + 1}</CardTitle>
                      {materiais.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => handleRemoveMaterial(material.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Descrição */}
                    <div>
                      <Label>Descrição do Material *</Label>
                      <Input
                        placeholder="Ex: Correia de transmissão"
                        value={material.descricao}
                        onChange={(e) => handleMaterialChange(material.id, 'descricao', e.target.value)}
                        className={`mt-2 ${errors[`material_${material.id}_descricao`] ? 'border-red-500' : ''}`}
                      />
                      {errors[`material_${material.id}_descricao`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`material_${material.id}_descricao`]}</p>
                      )}
                    </div>

                    {/* Especificação */}
                    <div>
                      <Label>Especificação Técnica</Label>
                      <Input
                        placeholder="Ex: Modelo XYZ, 100mm"
                        value={material.especificacao || ''}
                        onChange={(e) => handleMaterialChange(material.id, 'especificacao', e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    {/* Quantidade e Unidade */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Quantidade *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={material.quantidade}
                          onChange={(e) => handleMaterialChange(material.id, 'quantidade', parseInt(e.target.value) || 1)}
                          className={`mt-2 ${errors[`material_${material.id}_quantidade`] ? 'border-red-500' : ''}`}
                        />
                        {errors[`material_${material.id}_quantidade`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`material_${material.id}_quantidade`]}</p>
                        )}
                      </div>
                      <div>
                        <Label>Unidade *</Label>
                        <Select value={material.unidade} onValueChange={(value) => handleMaterialChange(material.id, 'unidade', value)}>
                          <SelectTrigger className={`mt-2 ${errors[`material_${material.id}_unidade`] ? 'border-red-500' : ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIDADES.map(un => (
                              <SelectItem key={un} value={un}>{un}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`material_${material.id}_unidade`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`material_${material.id}_unidade`]}</p>
                        )}
                      </div>
                    </div>

                    {/* Urgência */}
                    <div>
                      <Label>Urgência *</Label>
                      <Select value={material.urgencia} onValueChange={(value) => handleMaterialChange(material.id, 'urgencia', value)}>
                        <SelectTrigger className={`mt-2 ${errors[`material_${material.id}_urgencia`] ? 'border-red-500' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {URGENCIAS.map(urg => (
                            <SelectItem key={urg} value={urg}>{urg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[`material_${material.id}_urgencia`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`material_${material.id}_urgencia`]}</p>
                      )}
                    </div>

                    {/* Fotos */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Foto 1</Label>
                        <div className="mt-2">
                          <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50">
                            <div className="flex flex-col items-center justify-center">
                              <Upload className="w-6 h-6 text-gray-400 mb-1" />
                              <span className="text-xs text-gray-600">Clique para enviar</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFotoChange(material.id, 'foto1', e.target.files?.[0])}
                              className="hidden"
                            />
                          </label>
                          {material.foto1Preview && (
                            <img src={material.foto1Preview} alt="Preview 1" className="mt-2 w-full h-24 object-cover rounded" />
                          )}
                        </div>
                      </div>
                      <div>
                        <Label>Foto 2</Label>
                        <div className="mt-2">
                          <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50">
                            <div className="flex flex-col items-center justify-center">
                              <Upload className="w-6 h-6 text-gray-400 mb-1" />
                              <span className="text-xs text-gray-600">Clique para enviar</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFotoChange(material.id, 'foto2', e.target.files?.[0])}
                              className="hidden"
                            />
                          </label>
                          {material.foto2Preview && (
                            <img src={material.foto2Preview} alt="Preview 2" className="mt-2 w-full h-24 object-cover rounded" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Botão Enviar */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 text-lg font-semibold"
            style={{ backgroundColor: '#0082C3' }}
          >
            {loading ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </form>
      </div>
    </div>
  );
}
