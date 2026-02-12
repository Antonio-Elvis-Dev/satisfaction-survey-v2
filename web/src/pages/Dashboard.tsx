import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  TrendingUp,
  Users,
  BarChart3,
  Activity,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = React.useState(7);
  const { stats, isLoading } = useDashboardStats(selectedPeriod);

  const responsesOverTime = stats?.responsesOverTime || [];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const statsCards = [
    {
      title: 'Pesquisas Ativas',
      value: stats?.activeSurveys?.toString() || '0',
      description: 'Total de pesquisas',
      icon: FileText,
      color: 'text-primary',
      trend: `${stats?.trends?.surveys >= 0 ? '+' : ''}${stats?.trends?.surveys}%`,
      trendUp: (stats?.trends?.surveys || 0) >= 0,
    },
    {
      title: 'Respostas Coletadas',
      value: stats?.totalResponses?.toString() || '0',
      description: 'Total de respostas',
      icon: Users,
      color: 'text-success',
      trend: `${stats?.trends?.responses >= 0 ? '+' : ''}${stats?.trends?.responses}%`,
      trendUp: (stats?.trends?.responses || 0) >= 0,
    },
    {
      title: 'Taxa de Satisfação',
      value: stats?.avgCSAT ? `${stats.avgCSAT}%` : 'N/A',
      description: 'CSAT médio',
      icon: TrendingUp,
      color: 'text-success',
      trend: `${stats?.trends?.csat >= 0 ? '+' : ''}${stats?.trends?.csat.toFixed(1)}%`,
      trendUp: (stats?.trends?.csat || 0) >= 0,
    },
    {
      title: 'NPS Médio',
      value: stats?.avgNPS ? `+${stats.avgNPS}` : 'N/A',
      description: 'Score NPS',
      icon: Activity,
      color: 'text-warning',
      trend: `${stats?.trends?.nps >= 0 ? '+' : ''}${stats?.trends?.nps?.toFixed(1)}`,
      trendUp: (stats?.trends?.nps || 0) >= 0,
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo de volta! Aqui está um resumo das suas pesquisas
          </p>
        </div>
        <Button onClick={() => navigate('/create')} variant="hero" className="shadow-card">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Pesquisa
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card
            key={index}
            className="shadow-card hover:shadow-card-hover transition-all cursor-pointer"
            onClick={() => navigate('/surveys')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div className={`flex items-center text-sm font-medium ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                  {stat.trendUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {stat.trend}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Responses Over Time Chart */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Respostas nos Últimos {selectedPeriod} Dias</CardTitle>
              <CardDescription>Tendência de coleta de respostas</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(7)}
              >
                7 dias
              </Button>
              <Button
                variant={selectedPeriod === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(30)}
              >
                30 dias
              </Button>
              <Button
                variant={selectedPeriod === 90 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(90)}
              >
                90 dias
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {responsesOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responsesOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickMargin={10}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="responses"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhuma resposta no período selecionado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Surveys and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Surveys */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Pesquisas Recentes
                </CardTitle>
                <CardDescription>
                  Acompanhe suas pesquisas mais ativas
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/surveys')}
              >
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentSurveys?.map((survey) => (
                <div key={survey.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-foreground">{survey.title}</h4>
                    
                    <p className="text-xs text-muted-foreground">
                      Por: {survey.author} • {survey.totalResponses} respostas
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${survey.status === 'active'
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground'
                      }`}>
                      {survey.status === 'active' ? 'Ativa' : survey.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/analytics?survey=${survey.id}`)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Comece a trabalhar com suas pesquisas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full justify-start h-auto p-4"
              variant="outline"
              onClick={() => navigate('/create')}
            >
              <div className="flex items-center space-x-3">
                <PlusCircle className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Criar Nova Pesquisa</p>
                  <p className="text-sm text-muted-foreground">
                    Monte uma pesquisa do zero
                  </p>
                </div>
              </div>
            </Button>

            <Button
              className="w-full justify-start h-auto p-4"
              variant="outline"
              onClick={() => navigate('/surveys')}
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Usar Modelo Existente</p>
                  <p className="text-sm text-muted-foreground">
                    Reutilizar pesquisa anterior
                  </p>
                </div>
              </div>
            </Button>

            <Button
              className="w-full justify-start h-auto p-4"
              variant="outline"
              onClick={() => navigate('/analytics')}
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Ver Relatórios</p>
                  <p className="text-sm text-muted-foreground">
                    Analise os resultados
                  </p>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;