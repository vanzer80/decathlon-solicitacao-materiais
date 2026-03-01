'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { generateRequestId, validateImageFile } from '@shared/utils';
import { TIPOS_EQUIPE, TIPOS_SERVICO, SISTEMAS_AFETADOS, UNIDADES, URGENCIAS, MAX_FOTO_SIZE } from '@shared/constants';
import type { Loja, MaterialItem } from '@shared/types';
import { Plus, Trash2, Upload, CheckCircle, Camera, Loader2, Building2, Users, Package, AlertCircle } from 'lucide-react';
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
      const filtered = lojas.filter(loja =>
        loja.label.toLowerCase().includes(lojaSearchValue.toLowerCase()) ||
        loja.id.toLowerCase().includes(lojaSearchValue.toLowerCase())
      );
      setFilteredLojas(filtered);
    }
  }, [lojaSearchValue, lojaSearchOpen, lojas, lojasLoaded]);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
    const newId = String(Math.max(...materiais.map(m => parseInt(m.id)), 0) + 1);
    setMateriais(prev => [
      ...prev,
      { id: newId, descricao: '', quantidade: 1, unidade: 'un', urgencia: 'Média' },
    ]);
  };

  const handleRemoveMaterial = (id: string) => {
    if (materiais.length > 1) {
      setMateriais(prev => prev.filter(m => m.id !== id));
    } else {
      toast.error('Você deve ter pelo menos um material');
    }
  };

  const handleFotoChange = async (materialId: string, fotoIndex: 1 | 2, file: File) => {
    if (!validateImageFile(file)) {
      toast.error('Arquivo inválido. Máximo 5MB, apenas imagens');
      return;
    }

    setCompressingMaterial(`${materialId}-${fotoIndex}`);
    try {
      const originalSize = file.size;
      const result = await compressImage(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.8,
        maxSizeKB: 500,
      });

      const reductionPercent = result.reductionPercent;
      if (reductionPercent > 10) {
        toast.success(
          `Foto ${fotoIndex} comprimida: ${formatFileSize(originalSize)} → ${formatFileSize(result.compressedSize)} (${reductionPercent}% menor)`
        );
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        handleMaterialChange(materialId, `foto${fotoIndex}Preview`, preview);
      };
      reader.readAsDataURL(result.blob);
    } catch (error) {
      toast.error(`Erro ao comprimir foto: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setCompressingMaterial(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.lojaId) newErrors.lojaId = 'Loja é obrigatória';
    if (!formData.solicitanteNome) newErrors.solicitanteNome = 'Nome é obrigatório';
    if (!formData.solicitanteTelefone) newErrors.solicitanteTelefone = 'Telefone é obrigatório';
    // Número do chamado agora é opcional
    if (!formData.tipoEquipe) newErrors.tipoEquipe = 'Tipo de equipe é obrigatório';
    if (formData.tipoEquipe === 'Terceirizada' && !formData.empresaTerceira) {
      newErrors.empresaTerceira = 'Empresa terceira é obrigatória';
    }
    if (!formData.tipoServico) newErrors.tipoServico = 'Tipo de serviço é obrigatório';
    if (!formData.sistemaAfetado) newErrors.sistemaAfetado = 'Sistema afetado é obrigatório';
    if (!formData.descricaoGeralServico) newErrors.descricaoGeralServico = 'Descrição é obrigatória';

    // Validar materiais
    const validMateriais = materiais.filter(
      m => m.descricao.trim() && m.quantidade > 0 && m.unidade && m.urgencia
    );
    if (validMateriais.length === 0) {
      newErrors.materiais = 'Adicione pelo menos um material com descrição, quantidade e urgência';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (formData.honeypot) {
      console.log('[Honeypot] Spam detectado');
      return;
    }

    if (!validateForm()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(false);
    try {
      const requestId = generateRequestId();
      const timestampEnvio = new Date().toISOString();

      // Upload de fotos
      const foto1Urls: (string | undefined)[] = [];
      const foto2Urls: (string | undefined)[] = [];

      for (const material of materiais) {
        if (material.foto1Preview) {
          try {
            const formDataUpload = new FormData();
            const blob = await fetch(material.foto1Preview).then(r => r.blob());
            formDataUpload.append('file', blob, `foto1-${material.id}.jpg`);

            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formDataUpload,
            });

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              foto1Urls.push(uploadData.url);
            } else {
              foto1Urls.push(undefined);
            }
          } catch (error) {
            console.error('Erro ao fazer upload da foto 1:', error);
            foto1Urls.push(undefined);
          }
        } else {
          foto1Urls.push(undefined);
        }

        if (material.foto2Preview) {
          try {
            const formDataUpload = new FormData();
            const blob = await fetch(material.foto2Preview).then(r => r.blob());
            formDataUpload.append('file', blob, `foto2-${material.id}.jpg`);

            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formDataUpload,
            });

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              foto2Urls.push(uploadData.url);
            } else {
              foto2Urls.push(undefined);
            }
          } catch (error) {
            console.error('Erro ao fazer upload da foto 2:', error);
            foto2Urls.push(undefined);
          }
        } else {
          foto2Urls.push(undefined);
        }
      }

      // Enviar para webhook
      const result = await submitMutation.mutateAsync({
        requestId,
        timestampEnvio,
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
        materiais: materiais.map((m, idx) => ({
          descricao: m.descricao,
          especificacao: m.especificacao || '',
          quantidade: m.quantidade,
          unidade: m.unidade,
          urgencia: m.urgencia,
          foto1Url: foto1Urls[idx] || '',
          foto2Url: foto2Urls[idx] || '',
        })),
      });

      setSubmitSuccess(true);
      // Aguardar animação de sucesso antes de mostrar tela de sucesso
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessRequestId(result.requestId || requestId);
        toast.success('Solicitação enviada com sucesso!');
      }, 2000);
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      setSubmitError(true);
      // Aguardar animação de erro antes de limpar
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitError(false);
        toast.error('Erro ao enviar solicitação');
      }, 2000);
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
    setMateriais([{ id: '1', descricao: '', quantidade: 1, unidade: 'un', urgencia: 'Média' }]);
    setErrors({});
  };

  if (successRequestId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-green-200 bg-white shadow-lg">
          <CardContent className="pt-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicitação Enviada!</h2>
            <p className="text-gray-600 mb-4">Sua solicitação foi registrada com sucesso.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">ID da Solicitação:</p>
              <p className="text-lg font-mono font-bold text-blue-600">{successRequestId}</p>
            </div>
            <Button
              onClick={handleNovasolicitacao}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Nova Solicitação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#0082C3' }}>
            Solicitação de Materiais
          </h1>
          <p className="text-gray-600 mt-1">Manutenção e Suporte</p>
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

          {/* Dados Principais */}
          <Card className="border-l-4" style={{ borderLeftColor: '#0082C3' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" style={{ color: '#0082C3' }} />
                <CardTitle>Dados Principais</CardTitle>
              </div>
              <CardDescription>Informações do solicitante e da loja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Loja / Cluster */}
              <div>
                <Label htmlFor="loja" className="font-semibold">
                  Loja / Cluster <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="loja"
                    placeholder="Clique para ver todas as lojas ou digite para buscar..."
                    value={lojaSearchValue}
                    onChange={(e) => setLojaSearchValue(e.target.value)}
                    onFocus={() => setLojaSearchOpen(true)}
                    onBlur={() => setTimeout(() => setLojaSearchOpen(false), 200)}
                    className={errors.lojaId ? 'border-red-500' : ''}
                  />
                  {lojaSearchOpen && filteredLojas.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto mt-1">
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
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-b-0 text-sm"
                        >
                          <div className="font-semibold">{loja.label}</div>
                          <div className="text-xs text-gray-500">{loja.id}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formData.lojaId && (
                  <p className="text-sm text-green-600 mt-1">✓ {formData.lojaLabel}</p>
                )}
                {errors.lojaId && <p className="text-sm text-red-500 mt-1">{errors.lojaId}</p>}
              </div>

              {/* Nome do Solicitante */}
              <div>
                <Label htmlFor="nome" className="font-semibold">
                  Nome do Solicitante <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nome"
                  placeholder="Digite seu nome completo"
                  value={formData.solicitanteNome}
                  onChange={(e) => handleFormChange('solicitanteNome', e.target.value)}
                  className={errors.solicitanteNome ? 'border-red-500 mt-2' : 'mt-2'}
                />
                {errors.solicitanteNome && <p className="text-sm text-red-500 mt-1">{errors.solicitanteNome}</p>}
              </div>

              {/* Telefone / WhatsApp */}
              <div>
                <Label htmlFor="telefone" className="font-semibold">
                  Telefone / WhatsApp <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.solicitanteTelefone}
                  onChange={(e) => handleFormChange('solicitanteTelefone', e.target.value)}
                  className={errors.solicitanteTelefone ? 'border-red-500 mt-2' : 'mt-2'}
                />
                {errors.solicitanteTelefone && <p className="text-sm text-red-500 mt-1">{errors.solicitanteTelefone}</p>}
              </div>

              {/* Número do Chamado (Opcional) */}
              <div>
                <Label htmlFor="chamado" className="font-semibold">
                  Número do Chamado <span className="text-gray-400 text-sm">(opcional)</span>
                </Label>
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

          {/* Equipe e Serviço */}
          <Card className="border-l-4" style={{ borderLeftColor: '#0082C3' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" style={{ color: '#0082C3' }} />
                <CardTitle>Equipe e Serviço</CardTitle>
              </div>
              <CardDescription>Informações sobre o tipo de serviço</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              {/* Segmented Control Premium */}
              <div className="w-full mb-6">
                <div className="flex gap-2 w-full bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setEquipeTab('propria')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      equipeTab === 'propria'
                        ? 'bg-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    style={equipeTab === 'propria' ? { color: '#0082C3' } : {}}
                  >
                    Equipe Própria
                  </button>
                  <button
                    type="button"
                    onClick={() => setEquipeTab('terceirizada')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      equipeTab === 'terceirizada'
                        ? 'bg-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    style={equipeTab === 'terceirizada' ? { color: '#0082C3' } : {}}
                  >
                    Terceirizada
                  </button>
                </div>
              </div>

              {/* Grid de Campos */}
              <div className="w-full">
                {equipeTab === 'propria' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Tipo de Equipe */}
                    <div className="w-full">
                      <Label htmlFor="tipo-equipe" className="font-semibold">
                        Tipo de Equipe <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.tipoEquipe}
                        onValueChange={(value) => {
                          handleFormChange('tipoEquipe', value);
                          if (value !== 'Terceirizada') {
                            handleFormChange('empresaTerceira', '');
                          }
                        }}
                      >
                        <SelectTrigger id="tipo-equipe" className={`w-full h-12 mt-2 rounded-xl ${errors.tipoEquipe ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_EQUIPE.map(tipo => (
                            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tipoEquipe && <p className="text-sm text-red-500 mt-1">{errors.tipoEquipe}</p>}
                    </div>

                    {/* Tipo de Serviço */}
                    <div className="w-full">
                      <Label htmlFor="tipo-servico" className="font-semibold">
                        Tipo de Serviço <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.tipoServico}
                        onValueChange={(value) => handleFormChange('tipoServico', value)}
                      >
                        <SelectTrigger id="tipo-servico" className={`w-full h-12 mt-2 rounded-xl ${errors.tipoServico ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_SERVICO.map(tipo => (
                            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tipoServico && <p className="text-sm text-red-500 mt-1">{errors.tipoServico}</p>}
                    </div>

                    {/* Sistema Afetado */}
                    <div className="w-full">
                      <Label htmlFor="sistema" className="font-semibold">
                        Sistema Afetado <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.sistemaAfetado}
                        onValueChange={(value) => handleFormChange('sistemaAfetado', value)}
                      >
                        <SelectTrigger id="sistema" className={`w-full h-12 mt-2 rounded-xl ${errors.sistemaAfetado ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SISTEMAS_AFETADOS.map(sistema => (
                            <SelectItem key={sistema} value={sistema}>{sistema}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.sistemaAfetado && <p className="text-sm text-red-500 mt-1">{errors.sistemaAfetado}</p>}
                    </div>

                    {/* Descrição Geral do Serviço - Largura Total */}
                    <div className="w-full md:col-span-2">
                      <Label htmlFor="descricao" className="font-semibold">
                        Descrição Geral do Serviço <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="descricao"
                        placeholder="Descreva o serviço e o problema a ser resolvido..."
                        value={formData.descricaoGeralServico}
                        onChange={(e) => handleFormChange('descricaoGeralServico', e.target.value)}
                        className={`w-full mt-2 rounded-xl ${errors.descricaoGeralServico ? 'border-red-500' : ''}`}
                        rows={3}
                      />
                      {errors.descricaoGeralServico && <p className="text-sm text-red-500 mt-1">{errors.descricaoGeralServico}</p>}
                    </div>
                  </div>
                )}

                {equipeTab === 'terceirizada' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Tipo de Equipe */}
                    <div className="w-full">
                      <Label htmlFor="tipo-equipe-t" className="font-semibold">
                        Tipo de Equipe <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.tipoEquipe}
                        onValueChange={(value) => handleFormChange('tipoEquipe', value)}
                      >
                        <SelectTrigger id="tipo-equipe-t" className={`w-full h-12 mt-2 rounded-xl ${errors.tipoEquipe ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_EQUIPE.map(tipo => (
                            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tipoEquipe && <p className="text-sm text-red-500 mt-1">{errors.tipoEquipe}</p>}
                    </div>

                    {/* Empresa Terceira */}
                    <div className="w-full">
                      <Label htmlFor="empresa" className="font-semibold">
                        Empresa Terceira <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="empresa"
                        placeholder="Nome da empresa terceirizada"
                        value={formData.empresaTerceira}
                        onChange={(e) => handleFormChange('empresaTerceira', e.target.value)}
                        className={`w-full h-12 mt-2 rounded-xl px-4 ${errors.empresaTerceira ? 'border-red-500' : ''}`}
                      />
                      {errors.empresaTerceira && <p className="text-sm text-red-500 mt-1">{errors.empresaTerceira}</p>}
                    </div>

                    {/* Tipo de Serviço */}
                    <div className="w-full">
                      <Label htmlFor="tipo-servico-t" className="font-semibold">
                        Tipo de Serviço <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.tipoServico}
                        onValueChange={(value) => handleFormChange('tipoServico', value)}
                      >
                        <SelectTrigger id="tipo-servico-t" className={`w-full h-12 mt-2 rounded-xl ${errors.tipoServico ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_SERVICO.map(tipo => (
                            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tipoServico && <p className="text-sm text-red-500 mt-1">{errors.tipoServico}</p>}
                    </div>

                    {/* Sistema Afetado */}
                    <div className="w-full">
                      <Label htmlFor="sistema-t" className="font-semibold">
                        Sistema Afetado <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.sistemaAfetado}
                        onValueChange={(value) => handleFormChange('sistemaAfetado', value)}
                      >
                        <SelectTrigger id="sistema-t" className={`w-full h-12 mt-2 rounded-xl ${errors.sistemaAfetado ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SISTEMAS_AFETADOS.map(sistema => (
                            <SelectItem key={sistema} value={sistema}>{sistema}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.sistemaAfetado && <p className="text-sm text-red-500 mt-1">{errors.sistemaAfetado}</p>}
                    </div>

                    {/* Descrição Geral do Serviço - Largura Total */}
                    <div className="w-full md:col-span-2">
                      <Label htmlFor="descricao-t" className="font-semibold">
                        Descrição Geral do Serviço <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="descricao-t"
                        placeholder="Descreva o serviço e o problema a ser resolvido..."
                        value={formData.descricaoGeralServico}
                        onChange={(e) => handleFormChange('descricaoGeralServico', e.target.value)}
                        className={`w-full mt-2 rounded-xl ${errors.descricaoGeralServico ? 'border-red-500' : ''}`}
                        rows={3}
                      />
                      {errors.descricaoGeralServico && <p className="text-sm text-red-500 mt-1">{errors.descricaoGeralServico}</p>}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Materiais Solicitados */}
          <Card className="border-l-4" style={{ borderLeftColor: '#0082C3' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" style={{ color: '#0082C3' }} />
                <CardTitle>Materiais Solicitados</CardTitle>
              </div>
              <CardDescription>Adicione os materiais necessários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {materiais.map((material, idx) => (
                <Card key={material.id} className="bg-gray-50 border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Material {idx + 1}</CardTitle>
                      {materiais.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMaterial(material.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Descrição do Material */}
                    <div>
                      <Label className="font-semibold text-sm">Descrição do Material <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="Ex: Descrevedor Especial 10A"
                        value={material.descricao}
                        onChange={(e) => handleMaterialChange(material.id, 'descricao', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {/* Especificação */}
                    <div>
                      <Label className="font-semibold text-sm">Especificação (Marca, modelo, etc.)</Label>
                      <Input
                        placeholder="Ex: Siemens, modelo XYZ"
                        value={material.especificacao || ''}
                        onChange={(e) => handleMaterialChange(material.id, 'especificacao', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {/* Quantidade e Unidade */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="font-semibold text-sm">Quantidade <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          min="1"
                          value={material.quantidade}
                          onChange={(e) => handleMaterialChange(material.id, 'quantidade', parseInt(e.target.value) || 1)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="font-semibold text-sm">Unidade <span className="text-red-500">*</span></Label>
                        <Select
                          value={material.unidade}
                          onValueChange={(value) => handleMaterialChange(material.id, 'unidade', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIDADES.map(u => (
                              <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Urgência */}
                    <div>
                      <Label className="font-semibold text-sm">Urgência <span className="text-red-500">*</span></Label>
                      <Select
                        value={material.urgencia}
                        onValueChange={(value) => handleMaterialChange(material.id, 'urgencia', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {URGENCIAS.map(u => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fotos */}
                    <div className="border-t pt-3 mt-3">
                      <Label className="font-semibold text-sm mb-3 block">Fotos do Material (até 2)</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2].map((fotoNum) => {
                          const fotoKey = fotoNum === 1 ? 'foto1Preview' : 'foto2Preview';
                          const preview = material[fotoKey];
                          const isCompressing = compressingMaterial === `${material.id}-${fotoNum}`;

                          return (
                            <div key={fotoNum} className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                              {preview ? (
                                <div className="space-y-2">
                                  <img
                                    src={preview}
                                    alt={`Foto ${fotoNum}`}
                                    className="w-full h-24 object-cover rounded"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMaterialChange(material.id, fotoKey as string, undefined)}
                                    className="w-full"
                                  >
                                    Remover
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex justify-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setCameraTarget({ materialId: material.id, fotoIndex: fotoNum as 1 | 2 })}
                                      disabled={isCompressing}
                                      className="flex-1"
                                    >
                                      <Camera className="w-4 h-4 mr-1" />
                                      Câmera
                                    </Button>
                                    <label className="flex-1">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={isCompressing}
                                        className="w-full"
                                        asChild
                                      >
                                        <span>
                                          <Upload className="w-4 h-4 mr-1" />
                                          Galeria
                                        </span>
                                      </Button>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleFotoChange(material.id, fotoNum as 1 | 2, file);
                                        }}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>
                                  {isCompressing && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Comprimindo...
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {errors.materiais && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{errors.materiais}</p>
                </div>
              )}

              <Button
                type="button"
                onClick={handleAddMaterial}
                variant="outline"
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Material
              </Button>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Solicitação'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-green-500 text-green-700 hover:bg-green-50 font-semibold py-6 text-lg"
              onClick={() => {
                handleNovasolicitacao();
                toast.success('Formulário limpo');
              }}
            >
              Salvar
            </Button>
          </div>
        </form>
      </div>

      {/* Camera Capture Modal */}
      {cameraOpen && cameraTarget && (
        <CameraCapture
          onCapture={(preview) => {
            handleFotoChange(cameraTarget.materialId, cameraTarget.fotoIndex, preview as any);
            setCameraOpen(false);
            setCameraTarget(null);
          }}
          onClose={() => {
            setCameraOpen(false);
            setCameraTarget(null);
          }}
        />
      )}

      {cameraTarget && !cameraOpen && (
        <CameraCapture
          onCapture={(preview) => {
            handleFotoChange(cameraTarget.materialId, cameraTarget.fotoIndex, preview as any);
            setCameraTarget(null);
          }}
          onClose={() => setCameraTarget(null)}
        />
      )}

      {/* Loading Animation */}
      <LoadingAnimation
        isLoading={isSubmitting && !submitSuccess && !submitError}
        isSuccess={submitSuccess}
        isError={submitError}
        message="Enviando solicitação..."
        errorMessage="Erro ao enviar solicitação"
      />
    </div>
  );
}
