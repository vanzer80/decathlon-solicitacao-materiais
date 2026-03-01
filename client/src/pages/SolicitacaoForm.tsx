'use client';

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
import { Plus, Trash2, Upload, CheckCircle, Camera, Loader2, Building2, Users, Package, AlertCircle, X } from 'lucide-react';
import { CameraCapture } from '@/components/CameraCapture';
import { compressImage, formatFileSize } from '@/lib/imageCompression';
import LoadingAnimation from '@/components/LoadingAnimation';

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
  const [lojasLoaded, setLojasLoaded] = useState(false);
  const [equipeTab, setEquipeTab] = useState('propria');
  
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
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<{ materialId: string; fotoIndex: 1 | 2 } | null>(null);
  const [compressingMaterial, setCompressingMaterial] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const submitMutation = trpc.solicitacao.submit.useMutation();

  // Carregar lojas
  useEffect(() => {
    const loadLojas = async () => {
      try {
        const response = await fetch('/lojas.json');
        const data = await response.json();
        setLojas(data);
        setLojasLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar lojas:', error);
        toast.error('Erro ao carregar lista de lojas');
        setLojasLoaded(true);
      }
    };
    loadLojas();
  }, []);

  // Filtrar lojas baseado na busca
  useEffect(() => {
    if (lojaSearchValue.trim() === '') {
      if (lojaSearchOpen && lojasLoaded) {
        setFilteredLojas(lojas);
      } else {
        setFilteredLojas([]);
      }
    } else {
      const search = lojaSearchValue.toLowerCase();
      setFilteredLojas(
        lojas.filter(loja =>
          loja.label.toLowerCase().includes(search) ||
          loja.id.toLowerCase().includes(search)
        )
      );
    }
  }, [lojaSearchValue, lojaSearchOpen, lojas, lojasLoaded]);

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMaterialChange = (id: string, field: string, value: any) => {
    setMateriais(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const addMaterial = () => {
    const newId = String(Math.max(...materiais.map(m => parseInt(m.id) || 0)) + 1);
    setMateriais(prev => [...prev, { id: newId, descricao: '', quantidade: 1, unidade: 'un', urgencia: 'Média' }]);
  };

  const removeMaterial = (id: string) => {
    if (materiais.length > 1) {
      setMateriais(prev => prev.filter(m => m.id !== id));
    } else {
      toast.error('Deve haver pelo menos um material');
    }
  };

  const handleFotoChange = async (materialId: string, fotoIndex: 1 | 2, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!validateImageFile(file)) {
      toast.error('Arquivo inválido. Use apenas imagens (JPG, PNG, WebP) até 5MB');
      return;
    }

    setCompressingMaterial(materialId);
    try {
      const compressed = await compressImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        const fotoKey = `foto${fotoIndex}` as const;
        const previewKey = `foto${fotoIndex}Preview` as const;
        handleMaterialChange(materialId, fotoKey, compressed);
        handleMaterialChange(materialId, previewKey, preview);
        toast.success(`Foto ${fotoIndex} comprimida e adicionada`);
      };
      reader.readAsDataURL(compressed);
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      toast.error('Erro ao processar imagem');
    } finally {
      setCompressingMaterial(null);
    }
  };

  const handleCameraCapture = (blob: Blob, materialId: string, fotoIndex: 1 | 2) => {
    const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
    handleFotoChange(materialId, fotoIndex, new DataTransfer().items.add(file).dataTransfer?.files || new FileList());
    setCameraOpen(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.lojaId) newErrors.lojaId = 'Loja é obrigatória';
    if (!formData.solicitanteNome) newErrors.solicitanteNome = 'Nome do solicitante é obrigatório';
    if (!formData.solicitanteTelefone) newErrors.solicitanteTelefone = 'Telefone é obrigatório';
    if (!formData.tipoEquipe) newErrors.tipoEquipe = 'Tipo de equipe é obrigatório';
    if (formData.tipoEquipe === 'terceirizada' && !formData.empresaTerceira) {
      newErrors.empresaTerceira = 'Empresa terceira é obrigatória';
    }
    if (!formData.tipoServico) newErrors.tipoServico = 'Tipo de serviço é obrigatório';
    if (!formData.sistemaAfetado) newErrors.sistemaAfetado = 'Sistema afetado é obrigatório';
    if (!formData.descricaoGeralServico) newErrors.descricaoGeralServico = 'Descrição é obrigatória';

    const validMateriais = materiais.filter(m => m.descricao && m.quantidade > 0 && m.unidade && m.urgencia);
    if (validMateriais.length === 0) {
      newErrors.materiais = 'Adicione pelo menos um material com descrição, quantidade, unidade e urgência';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.honeypot) {
      console.log('Honeypot acionado');
      return;
    }

    if (!validateForm()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(false);

    try {
      const requestId = generateRequestId();
      const validMateriais = materiais.filter(m => m.descricao && m.quantidade > 0 && m.unidade && m.urgencia);

      const payload = {
        requestId,
        timestampEnvio: new Date().toISOString(),
        lojaId: formData.lojaId,
        lojaLabel: formData.lojaLabel,
        solicitanteNome: formData.solicitanteNome,
        solicitanteTelefone: formData.solicitanteTelefone,
        numeroChamado: formData.numeroChamado || '',
        tipoEquipe: formData.tipoEquipe,
        empresaTerceira: formData.empresaTerceira || '',
        tipoServico: formData.tipoServico,
        sistemaAfetado: formData.sistemaAfetado,
        descricaoGeralServico: formData.descricaoGeralServico,
        materiais: validMateriais.map(m => ({
          descricao: m.descricao,
          especificacao: m.especificacao || '',
          quantidade: m.quantidade,
          unidade: m.unidade,
          urgencia: m.urgencia,
          foto1Url: m.foto1 ? '' : '',
          foto2Url: m.foto2 ? '' : '',
        })),
      };

      const result = await submitMutation.mutateAsync(payload);
      setSuccessRequestId(result.requestId);
      setSubmitSuccess(true);

      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      setSubmitError(true);
      toast.error('Erro ao enviar solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
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
    setMateriais([{ id: '1', descricao: '', quantidade: 1, unidade: 'un', urgencia: 'Média' }]);
    setErrors({});
    setSuccessRequestId(null);
    setSubmitSuccess(false);
    setSubmitError(false);
  };

  if (successRequestId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Solicitação Enviada!</h2>
            <p className="text-gray-600 mb-4">Seu Request ID:</p>
            <p className="text-xl font-mono font-bold" style={{ color: '#0082C3' }}>{successRequestId}</p>
            <Button onClick={resetForm} className="w-full mt-6" style={{ backgroundColor: '#0082C3' }}>
              Nova Solicitação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="w-full px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#0082C3' }}>
            Dados Principais
          </h1>
          <p className="text-sm text-gray-500">Informações do solicitante e da loja</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* SEÇÃO 1: Dados Principais */}
          <Card className="border-l-4" style={{ borderLeftColor: '#0082C3' }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" style={{ color: '#0082C3' }} />
                <CardTitle className="text-base">Dados Principais</CardTitle>
              </div>
              <CardDescription className="text-xs">Informações do solicitante e da loja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Loja */}
              <div className="w-full">
                <Label htmlFor="loja" className="text-sm font-semibold">
                  Loja / Cluster <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="loja"
                    placeholder="Selecione uma loja…"
                    value={lojaSearchValue}
                    onChange={(e) => setLojaSearchValue(e.target.value)}
                    onFocus={() => setLojaSearchOpen(true)}
                    onBlur={() => setTimeout(() => setLojaSearchOpen(false), 200)}
                    className={`w-full h-10 rounded-lg ${errors.lojaId ? 'border-red-500' : ''}`}
                  />
                  {lojaSearchOpen && filteredLojas.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto mt-1">
                      {filteredLojas.map(loja => (
                        <button
                          key={loja.id}
                          type="button"
                          onClick={() => {
                            handleFormChange('lojaId', loja.id);
                            handleFormChange('lojaLabel', loja.label);
                            setLojaSearchValue('');
                            setLojaSearchOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 text-xs"
                        >
                          <div className="font-semibold">{loja.label}</div>
                          <div className="text-xs text-gray-500">{loja.id}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formData.lojaId && (
                  <p className="text-xs text-green-600 mt-1">✓ {formData.lojaLabel}</p>
                )}
              </div>

              {/* Nome */}
              <div className="w-full">
                <Label htmlFor="nome" className="text-sm font-semibold">
                  Nome do Solicitante <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nome"
                  placeholder="Digite seu nome completo"
                  value={formData.solicitanteNome}
                  onChange={(e) => handleFormChange('solicitanteNome', e.target.value)}
                  className={`w-full h-10 rounded-lg mt-1 ${errors.solicitanteNome ? 'border-red-500' : ''}`}
                />
              </div>

              {/* Telefone */}
              <div className="w-full">
                <Label htmlFor="telefone" className="text-sm font-semibold">
                  Telefone / WhatsApp <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.solicitanteTelefone}
                  onChange={(e) => handleFormChange('solicitanteTelefone', e.target.value)}
                  className={`w-full h-10 rounded-lg mt-1 ${errors.solicitanteTelefone ? 'border-red-500' : ''}`}
                />
              </div>

              {/* Chamado (opcional) */}
              <div className="w-full">
                <Label htmlFor="chamado" className="text-sm font-semibold">
                  Número do Chamado <span className="text-gray-400 text-xs">(opcional)</span>
                </Label>
                <Input
                  id="chamado"
                  placeholder="Ex: CHM-2026-001"
                  value={formData.numeroChamado}
                  onChange={(e) => handleFormChange('numeroChamado', e.target.value)}
                  className="w-full h-10 rounded-lg mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO 2: Equipe e Serviço */}
          <Card className="border-l-4" style={{ borderLeftColor: '#0082C3' }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: '#0082C3' }} />
                <CardTitle className="text-base">Equipe e Serviço</CardTitle>
              </div>
              <CardDescription className="text-xs">Informações sobre o tipo de serviço</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Tipo de Equipe - Segmented Control */}
              <div className="w-full">
                <Label className="text-sm font-semibold block mb-2">
                  Tipo de Equipe <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => handleFormChange('tipoEquipe', 'propria')}
                    className={`flex-1 h-10 rounded-lg font-semibold text-sm transition ${
                      formData.tipoEquipe === 'propria'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                    style={formData.tipoEquipe === 'propria' ? { backgroundColor: '#0082C3' } : {}}
                  >
                    Própria
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormChange('tipoEquipe', 'terceirizada')}
                    className={`flex-1 h-10 rounded-lg font-semibold text-sm transition ${
                      formData.tipoEquipe === 'terceirizada'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                    style={formData.tipoEquipe === 'terceirizada' ? { backgroundColor: '#0082C3' } : {}}
                  >
                    Terceirizada
                  </button>
                </div>
              </div>

              {/* Empresa Terceira (condicional) */}
              {formData.tipoEquipe === 'terceirizada' && (
                <div className="w-full">
                  <Label htmlFor="empresa" className="text-sm font-semibold">
                    Empresa Terceira <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="empresa"
                    placeholder="Nome da empresa"
                    value={formData.empresaTerceira}
                    onChange={(e) => handleFormChange('empresaTerceira', e.target.value)}
                    className={`w-full h-10 rounded-lg mt-1 ${errors.empresaTerceira ? 'border-red-500' : ''}`}
                  />
                </div>
              )}

              {/* Tipo de Serviço - Segmented Control */}
              <div className="w-full">
                <Label className="text-sm font-semibold block mb-2">
                  Tipo de Serviço <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => handleFormChange('tipoServico', 'Preventiva')}
                    className={`flex-1 h-10 rounded-lg font-semibold text-sm transition ${
                      formData.tipoServico === 'Preventiva'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                    style={formData.tipoServico === 'Preventiva' ? { backgroundColor: '#0082C3' } : {}}
                  >
                    Preventiva
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormChange('tipoServico', 'Corretiva')}
                    className={`flex-1 h-10 rounded-lg font-semibold text-sm transition ${
                      formData.tipoServico === 'Corretiva'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                    style={formData.tipoServico === 'Corretiva' ? { backgroundColor: '#0082C3' } : {}}
                  >
                    Corretiva
                  </button>
                </div>
              </div>

              {/* Sistema Afetado */}
              <div className="w-full">
                <Label htmlFor="sistema" className="text-sm font-semibold">
                  Sistema Afetado <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.sistemaAfetado} onValueChange={(value) => handleFormChange('sistemaAfetado', value)}>
                  <SelectTrigger className={`w-full h-10 rounded-lg mt-1 ${errors.sistemaAfetado ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SISTEMAS_AFETADOS.map(sistema => (
                      <SelectItem key={sistema} value={sistema}>{sistema}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição */}
              <div className="w-full">
                <Label htmlFor="descricao" className="text-sm font-semibold">
                  Descrição Geral do Serviço <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o serviço a ser realizado..."
                  value={formData.descricaoGeralServico}
                  onChange={(e) => handleFormChange('descricaoGeralServico', e.target.value)}
                  className={`w-full rounded-lg mt-1 min-h-24 ${errors.descricaoGeralServico ? 'border-red-500' : ''}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO 3: Materiais */}
          <Card className="border-l-4" style={{ borderLeftColor: '#0082C3' }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" style={{ color: '#0082C3' }} />
                <CardTitle className="text-base">Materiais Solicitados</CardTitle>
              </div>
              <CardDescription className="text-xs">Adicione os materiais necessários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {materiais.map((material, index) => (
                <div key={material.id} className="border border-gray-200 rounded-lg p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm">Material {index + 1}</h4>
                    {materiais.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMaterial(material.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Descrição */}
                  <div className="w-full">
                    <Label className="text-xs font-semibold">
                      Descrição do Material <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Ex: Descrevr equipar 10A"
                      value={material.descricao}
                      onChange={(e) => handleMaterialChange(material.id, 'descricao', e.target.value)}
                      className="w-full h-9 rounded-lg mt-1 text-sm"
                    />
                  </div>

                  {/* Especificação */}
                  <div className="w-full">
                    <Label className="text-xs font-semibold">
                      Especificação <span className="text-gray-400">(marca, modelo, etc.)</span>
                    </Label>
                    <Input
                      placeholder="Ex: Schneider Electro, modelo ATV 2122"
                      value={material.especificacao || ''}
                      onChange={(e) => handleMaterialChange(material.id, 'especificacao', e.target.value)}
                      className="w-full h-9 rounded-lg mt-1 text-sm"
                    />
                  </div>

                  {/* Quantidade e Unidade */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <div>
                      <Label className="text-xs font-semibold">
                        Quantidade <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={material.quantidade}
                        onChange={(e) => handleMaterialChange(material.id, 'quantidade', parseInt(e.target.value) || 1)}
                        className="w-full h-9 rounded-lg mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">
                        Unidade <span className="text-red-500">*</span>
                      </Label>
                      <Select value={material.unidade} onValueChange={(value) => handleMaterialChange(material.id, 'unidade', value)}>
                        <SelectTrigger className="w-full h-9 rounded-lg mt-1 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIDADES.map(un => (
                            <SelectItem key={un} value={un}>{un}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Urgência - Segmented Control */}
                  <div className="w-full">
                    <Label className="text-xs font-semibold block mb-2">
                      Urgência <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2 w-full">
                      {URGENCIAS.map(urg => (
                        <button
                          key={urg}
                          type="button"
                          onClick={() => handleMaterialChange(material.id, 'urgencia', urg)}
                          className={`flex-1 h-9 rounded-lg font-semibold text-xs transition ${
                            material.urgencia === urg
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}
                          style={material.urgencia === urg ? { backgroundColor: '#0082C3' } : {}}
                        >
                          {urg}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fotos */}
                  <div className="w-full">
                    <Label className="text-xs font-semibold block mb-2">Fotos do Material (até 2)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2].map((fotoIndex) => {
                        const fotoKey = `foto${fotoIndex}` as const;
                        const previewKey = `foto${fotoIndex}Preview` as const;
                        const hasPhoto = material[fotoKey];
                        const preview = material[previewKey];

                        return (
                          <div key={fotoIndex} className="relative">
                            {preview ? (
                              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <img src={preview} alt={`Foto ${fotoIndex}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleMaterialChange(material.id, fotoKey, null)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFotoChange(material.id, fotoIndex as 1 | 2, e.target.files)}
                                  className="hidden"
                                  id={`foto-input-${material.id}-${fotoIndex}`}
                                />
                                <label
                                  htmlFor={`foto-input-${material.id}-${fotoIndex}`}
                                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                                >
                                  <Camera className="w-5 h-5 text-gray-400 mb-1" />
                                  <span className="text-xs text-gray-500 text-center">Foto {fotoIndex}</span>
                                </label>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-1 mt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setCameraTarget({ materialId: material.id, fotoIndex: fotoIndex as 1 | 2 });
                                  setCameraOpen(true);
                                }}
                                className="text-xs bg-blue-500 text-white py-1 rounded font-semibold hover:bg-blue-600"
                                style={{ backgroundColor: '#0082C3' }}
                              >
                                📷 Câmera
                              </button>
                              <label
                                htmlFor={`foto-input-${material.id}-${fotoIndex}`}
                                className="text-xs bg-gray-200 text-gray-700 py-1 rounded font-semibold hover:bg-gray-300 cursor-pointer text-center"
                              >
                                🖼️ Galeria
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Adicionar Material */}
              <button
                type="button"
                onClick={addMaterial}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 font-semibold text-sm"
              >
                <Plus className="w-4 h-4" />
                Adicionar Material
              </button>
            </CardContent>
          </Card>

          {/* Loading Animation */}
          {isSubmitting && <LoadingAnimation success={submitSuccess} error={submitError} />}
        </form>
      </div>

      {/* Botão Fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 h-12 font-bold text-white rounded-lg"
          style={{ backgroundColor: '#0082C3' }}
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Enviar Solicitação
        </Button>
      </div>

      {/* Camera Modal */}
      {cameraOpen && cameraTarget && (
        <CameraCapture
          onCapture={(blob) => handleCameraCapture(blob, cameraTarget.materialId, cameraTarget.fotoIndex)}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}
