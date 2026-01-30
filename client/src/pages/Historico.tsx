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
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Eye, Download, RefreshCw } from "lucide-react";
import { LojaOption } from "@shared/types";

interface Solicitacao {
  id: number;
  requestId: string;
  lojaId: number;
  lojaLabel: string;
  solicitanteNome: string;
  solicitanteTelefone?: string;
  numeroChamado?: string;
  tipoEquipe: string;
  tipoServico: string;
  sistemaAfetado: string;
  descricaoGeralServico: string;
  timestampEnvio: Date;
  createdAt: Date;
}

export default function Historico() {
  const [lojas, setLojas] = useState<LojaOption[]>([]);
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    loja_id: "",
    request_id: "",
    ordenarPor: "data_desc" as "data_desc" | "data_asc" | "loja",
  });

  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [showDetalhe, setShowDetalhe] = useState(false);

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

  // Prepara input para query
  const queryInput = {
    pagina,
    limite: 10,
    dataInicio: filtros.dataInicio ? new Date(filtros.dataInicio) : undefined,
    dataFim: filtros.dataFim ? new Date(filtros.dataFim) : undefined,
    loja_id: filtros.loja_id ? parseInt(filtros.loja_id) : undefined,
    request_id: filtros.request_id || undefined,
    ordenarPor: filtros.ordenarPor,
  };

  // Query para listar solicitações
  const { data: resultado, isLoading, refetch } = trpc.historico.listar.useQuery(queryInput);

  // Query para detalhe
  const { data: detalheData, isLoading: isLoadingDetalhe } = trpc.historico.detalhe.useQuery(
    { request_id: selectedSolicitacao?.requestId || "" },
    { enabled: !!selectedSolicitacao }
  );

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
    setPagina(1);
  };

  const handleLimparFiltros = () => {
    setFiltros({
      dataInicio: "",
      dataFim: "",
      loja_id: "",
      request_id: "",
      ordenarPor: "data_desc",
    });
    setPagina(1);
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-8 pt-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Solicitações</h1>
          <p className="text-gray-600">Consulte e filtre suas solicitações anteriores</p>
        </div>

        {/* Filtros */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Data Início */}
            <div>
              <Label className="text-sm text-gray-700">Data Início</Label>
              <Input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => handleFiltroChange("dataInicio", e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Data Fim */}
            <div>
              <Label className="text-sm text-gray-700">Data Fim</Label>
              <Input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => handleFiltroChange("dataFim", e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Loja */}
            <div>
              <Label className="text-sm text-gray-700">Loja</Label>
              <Select value={filtros.loja_id} onValueChange={(val) => handleFiltroChange("loja_id", val)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {lojas.map((loja) => (
                    <SelectItem key={loja.Loja_ID} value={loja.Loja_ID.toString()}>
                      {loja.Loja_Label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Request ID */}
            <div>
              <Label className="text-sm text-gray-700">Request ID</Label>
              <Input
                type="text"
                placeholder="Buscar..."
                value={filtros.request_id}
                onChange={(e) => handleFiltroChange("request_id", e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Ordenação */}
            <div>
              <Label className="text-sm text-gray-700">Ordenar por</Label>
              <Select value={filtros.ordenarPor} onValueChange={(val) => handleFiltroChange("ordenarPor", val)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data_desc">Mais Recentes</SelectItem>
                  <SelectItem value="data_asc">Mais Antigas</SelectItem>
                  <SelectItem value="loja">Por Loja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
              <RefreshCw size={16} />
              Atualizar
            </Button>
            <Button onClick={handleLimparFiltros} variant="ghost">
              Limpar Filtros
            </Button>
          </div>
        </Card>

        {/* Tabela de Solicitações */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : resultado?.dados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhuma solicitação encontrada</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Request ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Loja</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Solicitante</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado?.dados.map((sol) => (
                      <tr key={sol.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-blue-600">{sol.requestId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{sol.lojaLabel}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{sol.solicitanteNome}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatarData(sol.createdAt)}</td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSolicitacao(sol as Solicitacao);
                              setShowDetalhe(true);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Eye size={16} />
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {resultado && resultado.paginacao.totalPaginas > 1 && (
                <div className="px-4 py-4 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Página {resultado.paginacao.pagina} de {resultado.paginacao.totalPaginas} ({resultado.paginacao.total} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagina === 1}
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft size={16} />
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagina >= resultado.paginacao.totalPaginas}
                      onClick={() => setPagina((p) => p + 1)}
                      className="flex items-center gap-1"
                    >
                      Próxima
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Modal de Detalhe */}
        {showDetalhe && selectedSolicitacao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Detalhes da Solicitação</h2>
                  <button
                    onClick={() => setShowDetalhe(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {isLoadingDetalhe ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : detalheData ? (
                  <div className="space-y-4">
                    {/* Informações Principais */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Request ID</p>
                        <p className="text-sm text-gray-600 font-mono">{detalheData.solicitacao.requestId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Data</p>
                        <p className="text-sm text-gray-600">{formatarData(detalheData.solicitacao.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Loja</p>
                        <p className="text-sm text-gray-600">{detalheData.solicitacao.lojaLabel}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Solicitante</p>
                        <p className="text-sm text-gray-600">{detalheData.solicitacao.solicitanteNome}</p>
                      </div>
                    </div>

                    {/* Materiais */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Materiais Solicitados</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {detalheData.itens.map((item, idx) => (
                          <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
                            <p className="font-medium">{item.materialDescricao}</p>
                            <p className="text-gray-600">
                              Qtd: {item.quantidade} {item.unidade} | Urgência: {item.urgencia}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-2 pt-4">
                      <Button onClick={() => setShowDetalhe(false)} className="flex-1">
                        Fechar
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <RefreshCw size={16} />
                        Reenviar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">Erro ao carregar detalhes</div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
