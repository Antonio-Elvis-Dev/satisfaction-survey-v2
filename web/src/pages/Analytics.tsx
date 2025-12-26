import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Download,
  Filter,
  PieChart,
  Calendar
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSurveys } from '@/hooks/useSurveys';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';
import { toast } from 'sonner';
import { AnalyticsSkeleton } from '@/components/skeletons/AnalyticsSkeleton';
import { Smile, Meh, Frown, Sparkles } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

const Analytics = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedSurveyId = searchParams.get('survey');

  const { analytics, isLoading } = useAnalytics(selectedSurveyId || '');

  if (isLoading) {
    return <AnalyticsSkeleton />
  }
  if (!analytics) {
    return <div>Pesquisa não encontrada</div>
  }
  // console.log(selectedSurveyId)

  const { stats, survey:selectedSurvey } = analytics
  
  const { processedSentiments, analyzeSentiment, isAnalyzing, sentiments } = useSentimentAnalysis(selectedSurveyId || '');


  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);



  // Apply date filters to responses
  const filteredResponses = React.useMemo(() => {
    if (!responses) return [];

    return responses.filter(r => {
      if (!r.completed_at) return true;

      const responseDate = new Date(r.completed_at);

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (responseDate < fromDate) return false;
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // Include the entire end date
        if (responseDate > toDate) return false;
      }

      return true;
    });
  }, [responses, dateFrom, dateTo]);

  // Recalculate processed data with filtered responses
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

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (!selectedSurveyId || !selectedSurvey) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Selecione uma pesquisa para visualizar analytics</p>
          <Button onClick={() => navigate('/surveys')}>Ver Pesquisas</Button>
        </div>
      </div>
    );
  }

  const overallStats = {
    csat: metrics?.csat_score ? Number(metrics.csat_score) : 0,
    nps: metrics?.nps_score || 0,
    totalResponses: metrics?.total_responses || 0,
    completionRate: metrics?.completion_rate ? Number(metrics.completion_rate) : 0,
  };

  const satisfactionData = filteredProcessedData.satisfactionDistribution.map(d => ({
    name: `Nível ${d.value}`,
    value: d.count
  }));

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

  return (
    <div className="space-y-6">
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
                <Calendar className="h-4 w-4 mr-2" />
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
                  analyzeSentiment(selectedSurveyId || '');
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
    </div>
  );
};

export default Analytics;
