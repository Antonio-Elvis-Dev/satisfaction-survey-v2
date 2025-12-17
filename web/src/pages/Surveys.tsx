import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  PlusCircle, 
  FileText, 
  Users, 
  Calendar,
  MoreHorizontal,
  Edit,
  Copy,
  Trash,
  Play,
  Pause,
  Share2,
  Link as LinkIcon,
  QrCode
} from 'lucide-react';
import QRCodeModal from '@/components/QRCodeModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSurveys } from '@/hooks/useSurveys';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SurveysSkeleton } from '@/components/skeletons/SurveysSkeleton';

const ITEMS_PER_PAGE = 12;

const Surveys = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<{ id: string; title: string } | null>(null);
  const [questionsCount, setQuestionsCount] = React.useState<Record<string, number>>({});
  const { surveys: surveysData, isLoading, deleteSurvey, duplicateSurvey, updateSurveyStatus } = useSurveys();

  React.useEffect(() => {
    const fetchQuestionCounts = async () => {
      if (!surveysData) return;
      
      const counts: Record<string, number> = {};
      for (const survey of surveysData) {
        const { count } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('survey_id', survey.id);
        counts[survey.id] = count || 0;
      }
      setQuestionsCount(counts);
    };
    
    fetchQuestionCounts();
  }, [surveysData]);

  if (isLoading) {
    return <SurveysSkeleton />;
  }

  const surveys = surveysData?.map(s => ({
    ...s,
    responses: s.total_responses || 0,
    created: new Date(s.created_at).toLocaleDateString('pt-BR'),
    lastModified: new Date(s.updated_at).toLocaleDateString('pt-BR'),
    questions: questionsCount[s.id] || 0,
    type: 'Múltipla'
  })) || [];

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta pesquisa?')) {
      try {
        await deleteSurvey.mutateAsync(id);
        toast.success('Pesquisa excluída com sucesso');
      } catch (error) {
        toast.error('Erro ao excluir pesquisa');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateSurvey.mutateAsync(id);
      toast.success('Pesquisa duplicada com sucesso');
    } catch (error) {
      toast.error('Erro ao duplicar pesquisa');
    }
  };

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/public/survey/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência');
  };

  const handleShowQRCode = (id: string, title: string) => {
    setSelectedSurvey({ id, title });
    setQrModalOpen(true);
  };

  const handleStatusChange = async (id: string, status: 'active' | 'paused' | 'completed') => {
    try {
      await updateSurveyStatus.mutateAsync({ id, status });
      toast.success(`Pesquisa ${status === 'active' ? 'ativada' : status === 'paused' ? 'pausada' : 'finalizada'} com sucesso`);
    } catch (error) {
      toast.error('Erro ao atualizar status da pesquisa');
    }
  };

  const oldSurveys = [
    {
      id: 1,
      title: 'Satisfação do Cliente - Q3 2024',
      description: 'Pesquisa trimestral para avaliar a satisfação geral dos clientes',
      status: 'active',
      responses: 234,
      created: '15 Set 2024',
      lastModified: '2 horas atrás',
      questions: 8,
      type: 'CSAT'
    },
    {
      id: 2,
      title: 'Avaliação de Atendimento',
      description: 'Feedback sobre o atendimento ao cliente',
      status: 'active',
      responses: 89,
      created: '10 Set 2024',
      lastModified: '5 horas atrás',
      questions: 5,
      type: 'NPS'
    },
    {
      id: 3,
      title: 'Feedback de Produto',
      description: 'Avaliação das funcionalidades do produto',
      status: 'draft',
      responses: 0,
      created: '8 Set 2024',
      lastModified: '1 dia atrás',
      questions: 12,
      type: 'Múltipla'
    },
    {
      id: 4,
      title: 'Pesquisa de Mercado',
      description: 'Análise de tendências e preferências do mercado',
      status: 'completed',
      responses: 156,
      created: '1 Set 2024',
      lastModified: '1 semana atrás',
      questions: 15,
      type: 'Mista'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativa', className: 'bg-success/10 text-success' },
      draft: { label: 'Rascunho', className: 'bg-warning/10 text-warning' },
      completed: { label: 'Finalizada', className: 'bg-muted text-muted-foreground' },
      paused: { label: 'Pausada', className: 'bg-destructive/10 text-destructive' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (survey.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSurveys.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSurveys = filteredSurveys.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pesquisas</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus modelos e pesquisas ativas
          </p>
        </div>
        <Button onClick={() => navigate('/create')} variant="hero" className="shadow-card">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Pesquisa
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar pesquisas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="completed">Finalizadas</SelectItem>
                <SelectItem value="paused">Pausadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Surveys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedSurveys.map((survey) => (
          <Card key={survey.id} className="shadow-card hover:shadow-card-hover transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{survey.title}</CardTitle>
                    {getStatusBadge(survey.status)}
                  </div>
                  <CardDescription>{survey.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => navigate(`/create?edit=${survey.id}`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/survey/preview?id=${survey.id}`)}>
                      <Play className="h-4 w-4 mr-2" />
                      Pré-visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/survey/${survey.id}`)}>
                      <Play className="h-4 w-4 mr-2" />
                      Aplicar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {survey.status === 'draft' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(survey.id, 'active')}>
                        <Play className="h-4 w-4 mr-2" />
                        Ativar
                      </DropdownMenuItem>
                    )}
                    {survey.status === 'active' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(survey.id, 'paused')}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar
                      </DropdownMenuItem>
                    )}
                    {survey.status === 'paused' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(survey.id, 'active')}>
                        <Play className="h-4 w-4 mr-2" />
                        Reativar
                      </DropdownMenuItem>
                    )}
                    {(survey.status === 'active' || survey.status === 'paused') && (
                      <DropdownMenuItem onClick={() => handleStatusChange(survey.id, 'completed')}>
                        <Play className="h-4 w-4 mr-2" />
                        Finalizar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDuplicate(survey.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyLink(survey.id)}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Copiar Link Público
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShowQRCode(survey.id, survey.title)}>
                      <QrCode className="h-4 w-4 mr-2" />
                      Gerar QR Code
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(survey.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary mr-1" />
                    <span className="font-semibold text-foreground">{survey.responses}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Respostas</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary mr-1" />
                    <span className="font-semibold text-foreground">{survey.questions}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Perguntas</p>
                </div>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs">
                    {survey.type}
                  </Badge>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {survey.created}
                </div>
                <div>
                  Atualizado {survey.lastModified}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                {survey.status === 'active' && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/survey/${survey.id}`)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Aplicar
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/analytics?survey=${survey.id}`)}
                >
                  Ver Resultados
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
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
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {filteredSurveys.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma pesquisa encontrada
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'Tente alterar os termos de busca.' : 'Comece criando sua primeira pesquisa.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/create')} variant="hero">
                <PlusCircle className="h-4 w-4 mr-2" />
                Criar Primeira Pesquisa
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* QR Code Modal */}
      {selectedSurvey && (
        <QRCodeModal
          open={qrModalOpen}
          onOpenChange={setQrModalOpen}
          surveyId={selectedSurvey.id}
          surveyTitle={selectedSurvey.title}
        />
      )}
    </div>
  );
};

export default Surveys;