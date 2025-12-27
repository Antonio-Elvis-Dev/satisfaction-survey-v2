import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsSkeleton } from '@/components/skeletons/AnalyticsSkeleton';

const Analytics = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedSurveyId = searchParams.get('survey');

  const { analytics, isLoading } = useAnalytics(selectedSurveyId || '');

  // Se não tiver ID selecionado ou estiver carregando
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

  const { stats, survey: selectedSurvey } = analytics;

  // Calculando métricas gerais baseadas nos stats recebidos
  const totalResponses = stats.length > 0 ? Math.max(...stats.map(s => s.totalResponses)) : 0;
  
  // Exemplo simples de como extrair NPS se houver perguntas de NPS
  const npsQuestion = stats.find(s => s.type === 'nps');
  // Nota: O backend não mandou o Score NPS calculado, apenas os dados do gráfico. 
  // Idealmente o backend deveria mandar o score, mas vamos exibir o que temos.

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="pl-0 mb-2 hover:bg-transparent text-muted-foreground">
             <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{selectedSurvey.title}</h1>
          <p className="text-muted-foreground">
            Status: <span className="capitalize text-primary">{selectedSurvey.status || 'Ativo'}</span>
          </p>
        </div>
      </div>

      {/* Cards de Resumo (Exemplo usando dados disponíveis) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Respostas</p>
                <p className="text-3xl font-bold text-foreground">{totalResponses}</p>
              </div>
              <Users className="h-8 w-8 text-primary/80" />
            </div>
          </CardContent>
        </Card>
        
        {/* Placeholder para outras métricas que poderiam vir do backend */}
        <Card className="shadow-sm bg-muted/20 border-dashed">
          <CardContent className="p-6 flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Mais métricas em breve</p>
          </CardContent>
        </Card>
      </div>

      {/* Renderização Dinâmica dos Gráficos por Pergunta */}
      <div className="grid grid-cols-1 gap-8">
        {stats.map((question) => (
          <Card key={question.id} className="shadow-card overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg">{question.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                Tipo: <span className="capitalize badge bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{question.type}</span>
                <span>•</span>
                <span>{question.totalResponses} respostas</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              
              {/* Lógica de Exibição Baseada no Tipo */}
              {['rating', 'nps', 'multiple_choice'].includes(question.type) && question.chartData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={question.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        interval={0}
                      />
                      <YAxis 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                      />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]} 
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                 // Fallback se não tiver dados de gráfico (ex: pergunta de texto)
                 null
              )}

              {/* Lista de Respostas de Texto */}
              {question.textResponses && question.textResponses.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold text-muted-foreground">Respostas Recentes</h4>
                  </div>
                  <div className="grid gap-3">
                    {question.textResponses.map((text, idx) => (
                      <div key={idx} className="p-3 bg-muted/40 rounded-md text-sm italic text-foreground/80 border border-transparent hover:border-border transition-colors">
                        "{text}"
                      </div>
                    ))}
                    {question.totalResponses > question.textResponses.length && (
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        Exibindo as últimas {question.textResponses.length} respostas de {question.totalResponses}.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Caso não tenha nenhuma resposta ainda */}
              {question.totalResponses === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mb-2 opacity-20" />
                  <p>Ainda sem respostas para esta pergunta.</p>
                </div>
              )}

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Analytics;