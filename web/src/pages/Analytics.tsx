import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Sparkles,
  Frown,
  Smile,
  Download,
  Meh,
  Calendar as CalendarIcon,
  Eye,
  Bot
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
} from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsSkeleton } from '@/components/skeletons/AnalyticsSkeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';
import { toast } from 'sonner';
import { ResponseDetailsModal } from '@/components/ResponseDetailsModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { AlertDialogHeader } from '@/components/ui/alert-dialog';

const ITEMS_PER_PAGE = 20;

const Analytics = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedSurveyId = searchParams.get('survey');

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. TODOS OS HOOKS PRIMEIRO
  const { metrics, responses, isLoading, analytics } = useAnalytics(selectedSurveyId || '');
  const { processedSentiments, analyzeSentiment, isAnalyzing } = useSentimentAnalysis(selectedSurveyId || '');

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // --- MOVI ESTE USEMEMO PARA CIMA (Antes dos Returns) ---
  const filteredResponses = React.useMemo(() => {
    if (!responses) return []; // Tratamento seguro se responses for undefined

    return responses.filter(r => {
      if (!r.completed_at) return true;

      const responseDate = new Date(r.completed_at);

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (responseDate < fromDate) return false;
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (responseDate > toDate) return false;
      }

      return true;
    });
  }, [responses, dateFrom, dateTo]);

  // --- MOVI ESTE USEMEMO PARA CIMA TAMBÉM ---
  const filteredProcessedData = React.useMemo(() => {
    return {
      satisfactionDistribution: filteredResponses.reduce((acc: any[], r) => {
        if (r.question_type === 'rating' && r.numeric_response) {
          const existing = acc.find(x => x.value === r.numeric_response);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ value: r.numeric_response, count: 1 });
          }
        }
        return acc;
      }, []),

      npsDistribution: filteredResponses.reduce((acc: any, r) => {
        if (r.question_type === 'nps' && r.numeric_response !== null) {
          if (r.numeric_response <= 6) acc.detractors++;
          else if (r.numeric_response <= 8) acc.passives++;
          else acc.promoters++;
        }
        return acc;
      }, { detractors: 0, passives: 0, promoters: 0 }),

      openResponses: filteredResponses.filter(r => r.text_response) || []
    };
  }, [filteredResponses]);


  // Agrupa respostas individuais em "Sessões" (Pessoas)
  const sessionList = React.useMemo(() => {
    const groups: Record<string, any> = {};

    filteredResponses.forEach(r => {
      if (!r.session_id) return;

      if (!groups[r.session_id]) {
        groups[r.session_id] = {
          id: r.session_id,
          date: r.completed_at,
          answers: []
        };
      }
      groups[r.session_id].answers.push(r);
    });

    // Converte para array e ordena por data (mais recente primeiro)
    return Object.values(groups).sort((a: any, b: any) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredResponses]);
  // 2. AGORA SIM, AS CONDICIONAIS DE RETORNO
  if (isLoading) {
    return <AnalyticsSkeleton />
  }

  if (!selectedSurveyId || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground">Selecione uma pesquisa para visualizar os dados.</p>
        <Button onClick={() => navigate('/dashboard')}>Ir para Dashboard</Button>
      </div>
    );
  }

  // 3. CÁLCULOS DE VARIÁVEIS (NÃO HOOKS) PODEM FICAR AQUI
  const satisfactionData = filteredProcessedData.satisfactionDistribution.map(d => ({
    name: `Nível ${d.value}`,
    value: d.count
  }));

  const { stats, survey: selectedSurvey } = analytics;
  const totalFiltered = filteredResponses.length;

  const npsData = [
    {
      range: '0-6 (Detratores)', count: filteredProcessedData.npsDistribution.detractors,
      percentage: totalFiltered ? Math.round((filteredProcessedData.npsDistribution.detractors / totalFiltered) * 100) : 0
    },
    {
      range: '7-8 (Neutros)', count: filteredProcessedData.npsDistribution.passives,
      percentage: totalFiltered ? Math.round((filteredProcessedData.npsDistribution.passives / totalFiltered) * 100) : 0
    },
    {
      range: '9-10 (Promotores)', count: filteredProcessedData.npsDistribution.promoters,
      percentage: totalFiltered ? Math.round((filteredProcessedData.npsDistribution.promoters / totalFiltered) * 100) : 0
    }
  ];

  const overallStats = {
    csat: metrics?.csat_score ? Number(metrics.csat_score) : 0,
    nps: metrics?.nps_score || 0,
    totalResponses: metrics?.totalResponses || 0,
    completionRate: metrics?.completionRate ? Number(metrics.completionRate) : 0,
  };

  const exportToCSV = () => {
    if (!filteredResponses || filteredResponses.length === 0) {
      toast.error('Nenhuma resposta para exportar');
      return;
    }

    const csvData = [
      ['Data', 'Pergunta', 'Resposta', 'Tipo'],
      ...filteredResponses.map(r => [
        r.completed_at ? new Date(r.completed_at).toLocaleDateString('pt-BR') : '',
        r.question_text || '',
        r.text_response || r.numeric_response?.toString() || r.selected_option_text || '',
        r.question_type || ''
      ])
    ];

    const csvContent = csvData.map(row =>
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_${selectedSurvey?.title}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Arquivo CSV exportado com sucesso');
  };
  const handleGenerateAiInsight = async (id:string) => {
    if (!id) return;
    setIsAiLoading(true);
    setAiAnalysis(null); // Limpa anterior
    setIsAiModalOpen(true); // Abre o modal já com loading

    try {
      const response = await api.post<{ analysis: string }>(`/surveys/${id}/ai-analysis`);
      setAiAnalysis(response.data.analysis);
      toast.success("Análise gerada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao conectar com a Inteligência Artificial.");
      setIsAiModalOpen(false); // Fecha se der erro
    } finally {
      setIsAiLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* ... (O RESTO DO JSX PERMANECE IGUAL) ... */}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Análise detalhada: {selectedSurvey.title}
          </p>
        </div>
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Período
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={() => {
                  if (dateFrom || dateTo) {
                    toast.success('Filtros aplicados');
                  } else {
                    toast.info('Selecione pelo menos uma data');
                  }
                }}>
                  Aplicar Filtros
                </Button>
                {(dateFrom || dateTo) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                      toast.info('Filtros removidos');
                    }}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CSAT</p>
                <p className="text-3xl font-bold text-success">{overallStats.csat.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Score médio</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">NPS</p>
                <p className="text-3xl font-bold text-primary">+{overallStats.nps}</p>
                <p className="text-xs text-muted-foreground mt-1">Score NPS</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Respostas</p>
                <p className="text-3xl font-bold text-foreground">{overallStats.totalResponses.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Total coletadas</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-foreground">{overallStats.completionRate.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Concluídas</p>
              </div>
              <PieChart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {satisfactionData.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Distribuição de Satisfação</CardTitle>
              <CardDescription>Respostas por nível</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={satisfactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Análise NPS</CardTitle>
            <CardDescription>Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {npsData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.range}</span>
                    <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${index === 0 ? 'bg-destructive' :
                        index === 1 ? 'bg-warning' : 'bg-success'
                        }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Analysis Section */}
      {filteredProcessedData.openResponses.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  Análise de Sentimento (IA)
                </CardTitle>
                <CardDescription>
                  Classificação automática de respostas abertas
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  handleGenerateAiInsight(selectedSurveyId || '');
                  toast.info('Iniciando análise de sentimento...');
                }}
                disabled={isAnalyzing}
                size="sm"
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analisar Respostas
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {processedSentiments.total > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Positivas</p>
                        <p className="text-2xl font-bold text-success">{processedSentiments.positive}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {processedSentiments.total ? Math.round((processedSentiments.positive / processedSentiments.total) * 100) : 0}%
                        </p>
                      </div>
                      <Smile className="h-8 w-8 text-success" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Neutras</p>
                        <p className="text-2xl font-bold text-warning">{processedSentiments.neutral}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {processedSentiments.total ? Math.round((processedSentiments.neutral / processedSentiments.total) * 100) : 0}%
                        </p>
                      </div>
                      <Meh className="h-8 w-8 text-warning" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Negativas</p>
                        <p className="text-2xl font-bold text-destructive">{processedSentiments.negative}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {processedSentiments.total ? Math.round((processedSentiments.negative / processedSentiments.total) * 100) : 0}%
                        </p>
                      </div>
                      <Frown className="h-8 w-8 text-destructive" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Clique em "Analisar Respostas" para classificar automaticamente o sentimento das respostas abertas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {filteredProcessedData.openResponses.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-primary" />
              Respostas Abertas
            </CardTitle>
            <CardDescription>
              Feedback qualitativo dos respondentes
              {(dateFrom || dateTo) && ' (filtrado)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProcessedData.openResponses
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((item, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm text-muted-foreground">
                        {item.completed_at ? new Date(item.completed_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-foreground italic">"{item.text_response}"</p>
                  </div>
                ))}
            </div>

            {/* Pagination for open responses */}
            {filteredProcessedData.openResponses.length > ITEMS_PER_PAGE && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {[...Array(Math.ceil(filteredProcessedData.openResponses.length / ITEMS_PER_PAGE))].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredProcessedData.openResponses.length / ITEMS_PER_PAGE), p + 1))}
                      className={currentPage === Math.ceil(filteredProcessedData.openResponses.length / ITEMS_PER_PAGE) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>
      )}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            Respostas Individuais ({sessionList.length})
          </CardTitle>
          <CardDescription>
            Lista de sessões completas de resposta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Resumo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionList.slice(0, 10).map((session: any) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      {session.date ? new Date(session.date).toLocaleDateString('pt-BR') : 'N/A'}
                      <span className="text-xs text-muted-foreground ml-2">
                        {session.date ? new Date(session.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {session.answers.length} perguntas respondidas
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSession(session);
                          setIsModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {sessionList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Nenhuma resposta encontrada neste período.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <ResponseDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sessionData={selectedSession}
      />

      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl text-primary">
                <Bot className="w-8 h-8 text-purple-600" />
                Consultor Virtual IA
            </DialogTitle>
            <DialogDescription>
                Análise qualitativa baseada nas respostas dos seus clientes.
            </DialogDescription>
        </AlertDialogHeader>

        <div className="mt-4 space-y-4">
            {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="text-muted-foreground animate-pulse">Lendo as respostas e gerando insights...</p>
                </div>
            ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none p-4 bg-muted/30 rounded-lg">
                    {/* Renderiza o Markdown bonito */}
                    <ReactMarkdown>{aiAnalysis || ''}</ReactMarkdown>
                </div>
            )}
        </div>
    </DialogContent>
</Dialog>
    </div>

  );
};

export default Analytics;