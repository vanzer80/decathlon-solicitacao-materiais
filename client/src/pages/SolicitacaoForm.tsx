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
import { Plus, Trash2, Upload, CheckCircle, Camera } from 'lucide-react';
import { CameraCapture } from '@/components/CameraCapture';

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
      // Se vazio, mostrar todas as lojas quando o dropdown está aberto
      if (lojaSearchOpen && lojasLoaded) {
        setFilteredLojas(lojas);
      } else {
        setFilteredLojas([]);
      }
    } else {
      const filtered = lojas.filter(loja =>
        loja.label.toLowerCase().includes(lojaSearchValue.toLowerCase()) ||
        loja.id.includes(lojaSearchValue)
      );
      setFilteredLojas(filtered);
    }
  }, [lojaSearchValue, lojas, lojaSearchOpen, lojasLoaded]);

  const handleSelectLoja = (loja: Loja) => {
    setFormData(prev => ({
      ...prev,
      lojaId: loja.id,
      lojaLabel: loja.label,
    }));
    setLojaSearchValue('');
    setLojaSearchOpen(false);
    // Limpar erro de loja quando selecionada
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.lojaId;
      return newErrors;
    });
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Limpar erro do campo quando usuário começa a digitar
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

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      handleMaterialChange(materialId, `foto${fotoIndex}Preview`, preview);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.lojaId) newErrors.lojaId = 'Loja é obrigatória';
    if (!formData.solicitanteNome) newErrors.solicitanteNome = 'Nome é obrigatório';
    if (!formData.solicitanteTelefone) newErrors.solicitanteTelefone = 'Telefone é obrigatório';
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
            const uploadData = await uploadResponse.json();
            foto1Urls.push(uploadData.url);
          } catch (error) {
            console.error('Erro ao fazer upload da foto 1:', error);
            foto1Urls.push('');
          }
        } else {
          foto1Urls.push('');
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
            const uploadData = await uploadResponse.json();
            foto2Urls.push(uploadData.url);
          } catch (error) {
            console.error('Erro ao fazer upload da foto 2:', error);
            foto2Urls.push('');
          }
        } else {
          foto2Urls.push('');
        }
      }

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
          <h1 className="text-3xl font-bold" style={{ color: '#0082C3' }}>Solicitação de Materiais</h1>
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
                    placeholder="Clique para ver todas as lojas ou digite para buscar..."
                    value={lojaSearchValue}
                    onChange={(e) => setLojaSearchValue(e.target.value)}
                    onFocus={() => setLojaSearchOpen(true)}
                    onBlur={() => setTimeout(() => setLojaSearchOpen(false), 200)}
                    className={errors.lojaId ? 'border-red-500' : ''}
                  />
                  {lojaSearchOpen && filteredLojas.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                      <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b text-xs text-gray-600 font-semibold">
                        {filteredLojas.length} loja{filteredLojas.length !== 1 ? 's' : ''} disponível{filteredLojas.length !== 1 ? 's' : ''}
                      </div>
                      {filteredLojas.map(loja => (
                        <button
                          key={loja.id}
                          type="button"
                          onClick={() => handleSelectLoja(loja)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                        >
                          <div className="font-semibold text-sm">{loja.id}</div>
                          <div className="text-xs text-gray-600">{loja.label}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {lojaSearchOpen && filteredLojas.length === 0 && lojaSearchValue.trim() === '' && !lojasLoaded && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-3 text-center text-gray-500 text-sm">
                      Carregando lojas...
                    </div>
                  )}
                  {lojaSearchOpen && filteredLojas.length === 0 && lojaSearchValue.trim() !== '' && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-3 text-center text-gray-500 text-sm">
                      Nenhuma loja encontrada para "{lojaSearchValue}"
                    </div>
                  )}
                </div>
                {errors.lojaId && <p className="text-red-500 text-sm mt-1">{errors.lojaId}</p>}
                {formData.lojaId && (
                  <p className="text-sm text-green-600 mt-1">✓ Loja selecionada: {formData.lojaLabel}</p>
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
                <Label htmlFor="telefone">Telefone / WhatsApp *</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.solicitanteTelefone}
                  onChange={(e) => handleFormChange('solicitanteTelefone', e.target.value)}
                  className={errors.solicitanteTelefone ? 'border-red-500 mt-2' : 'mt-2'}
                />
                {errors.solicitanteTelefone && <p className="text-red-500 text-sm mt-1">{errors.solicitanteTelefone}</p>}
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
                  <SelectTrigger className={`mt-2 ${errors.tipoEquipe ? 'border-red-500' : ''}`}>
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
                  <Label htmlFor="empresaTerceira">Empresa Terceira *</Label>
                  <Input
                    id="empresaTerceira"
                    placeholder="Nome da empresa terceirizada"
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
                  <SelectTrigger className={`mt-2 ${errors.tipoServico ? 'border-red-500' : ''}`}>
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
                <Label htmlFor="sistemaAfetado">Sistema Afetado *</Label>
                <Select value={formData.sistemaAfetado} onValueChange={(value) => handleFormChange('sistemaAfetado', value)}>
                  <SelectTrigger className={`mt-2 ${errors.sistemaAfetado ? 'border-red-500' : ''}`}>
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
                  placeholder="Descreva o serviço a ser realizado..."
                  value={formData.descricaoGeralServico}
                  onChange={(e) => handleFormChange('descricaoGeralServico', e.target.value)}
                  className={`mt-2 ${errors.descricaoGeralServico ? 'border-red-500' : ''}`}
                  rows={3}
                />
                {errors.descricaoGeralServico && <p className="text-red-500 text-sm mt-1">{errors.descricaoGeralServico}</p>}
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO 3: MATERIAIS */}
          <Card>
            <CardHeader>
              <CardTitle>Materiais Solicitados</CardTitle>
              <CardDescription>Adicione os materiais necessários para o serviço</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.materiais && <p className="text-red-500 text-sm">{errors.materiais}</p>}
              
              {materiais.map((material, index) => (
                <div key={material.id} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-sm">Material {index + 1}</h4>
                    {materiais.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(material.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Descrição */}
                  <div>
                    <Label className="text-xs">Descrição *</Label>
                    <Input
                      placeholder="Ex: Filtro de ar"
                      value={material.descricao}
                      onChange={(e) => handleMaterialChange(material.id, 'descricao', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Especificação */}
                  <div>
                    <Label className="text-xs">Especificação</Label>
                    <Input
                      placeholder="Ex: Modelo XYZ, Tamanho 10x10"
                      value={material.especificacao || ''}
                      onChange={(e) => handleMaterialChange(material.id, 'especificacao', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Quantidade e Unidade */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Quantidade *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={material.quantidade}
                        onChange={(e) => handleMaterialChange(material.id, 'quantidade', parseInt(e.target.value) || 1)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Unidade *</Label>
                      <Select value={material.unidade} onValueChange={(value) => handleMaterialChange(material.id, 'unidade', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIDADES.map(unidade => (
                            <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Urgência */}
                  <div>
                    <Label className="text-xs">Urgência *</Label>
                    <Select value={material.urgencia} onValueChange={(value) => handleMaterialChange(material.id, 'urgencia', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {URGENCIAS.map(urgencia => (
                          <SelectItem key={urgencia} value={urgencia}>{urgencia}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fotos */}
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2].map((fotoIndex) => (
                      <div key={`foto${fotoIndex}`}>
                        <Label className="text-xs">Foto {fotoIndex} (opcional)</Label>
                        <div className="mt-1 space-y-2">
                          {/* Opções de upload */}
                          <div className="flex gap-2">
                            {/* Galeria */}
                            <div className="flex-1 border-2 border-dashed rounded-lg p-2 text-center cursor-pointer hover:bg-blue-50">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFotoChange(material.id, fotoIndex as 1 | 2, file);
                                }}
                                className="hidden"
                                id={`foto${fotoIndex}-${material.id}`}
                              />
                              <label htmlFor={`foto${fotoIndex}-${material.id}`} className="cursor-pointer block">
                                <Upload size={14} className="mx-auto mb-1" />
                                <span className="text-xs">Galeria</span>
                              </label>
                            </div>
                            {/* Câmera */}
                            <button
                              type="button"
                              onClick={() => {
                                setCameraTarget({ materialId: material.id, fotoIndex: fotoIndex as 1 | 2 });
                                setCameraOpen(true);
                              }}
                              className="flex-1 border-2 border-dashed border-blue-400 rounded-lg p-2 text-center cursor-pointer hover:bg-blue-50 flex flex-col items-center justify-center"
                            >
                              <Camera size={14} className="mb-1" />
                              <span className="text-xs">Câmera</span>
                            </button>
                          </div>
                        </div>
                        {(fotoIndex === 1 ? material.foto1Preview : material.foto2Preview) && (
                          <img src={fotoIndex === 1 ? material.foto1Preview : material.foto2Preview} alt={`Preview ${fotoIndex}`} className="mt-2 w-full h-20 object-cover rounded" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                onClick={handleAddMaterial}
                variant="outline"
                className="w-full"
              >
                <Plus size={18} className="mr-2" />
                Adicionar Material
              </Button>
            </CardContent>
          </Card>

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

      {/* Modal de Captura de Câmera */}
      {cameraOpen && cameraTarget && (
        <CameraCapture
          onCapture={(blob) => {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            handleFotoChange(cameraTarget.materialId, cameraTarget.fotoIndex, file);
          }}
          onClose={() => {
            setCameraOpen(false);
            setCameraTarget(null);
          }}
        />
      )}
    </div>
  );
}
