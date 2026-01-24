import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  is_required: boolean;
  max_rating?: number;
  // Normalizando para facilitar o uso (opcionalmente vindo como 'options' ou 'question_options')
  options?: Array<{ id: string; option_text: string; order_index: number }>;
}

interface Answer {
  questionId: string;
  value: string | number;
}

const PublicSurvey = () => {
  const { id: surveyId } = useParams<{ id: string }>();

  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [surveyTitle, setSurveyTitle] = useState('Pesquisa de Satisfação');
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [startTime] = useState(Date.now());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Chave para persistência local (evita perda de dados ao atualizar página)
  const STORAGE_KEY = `survey_progress_${surveyId}`;

  // 1. Carregar Pesquisa
  useEffect(() => {
    const loadSurvey = async () => {
      if (!surveyId) return;

      try {
        const response = await api.get(`/public/surveys/${surveyId}`);
        const surveyData = response.data.survey;

        setSurveyTitle(surveyData.title);

        // Mapeia perguntas garantindo estrutura correta
        const loadedQuestions = surveyData.question.map((q: any) => ({
          id: q.id,
          question_type: q.question_type,
          question_text: q.question_text,
          is_required: q.is_required,
          max_rating: q.max_rating,
          options: q.options || q.question_options // Fallback para garantir que pegamos as opções
        }));

        setQuestions(loadedQuestions);
        
        // Tenta recuperar progresso salvo localmente
        const savedProgress = localStorage.getItem(STORAGE_KEY);
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress);
          // Só restaura se tiver respostas válidas
          if (parsed.answers && parsed.answers.length > 0) {
            setAnswers(parsed.answers);
            // Opcional: restaurar o índice da pergunta ou começar do zero
            if (typeof parsed.currentQuestionIndex === 'number') {
               setCurrentQuestionIndex(parsed.currentQuestionIndex);
            }
            toast.info('Seu progresso anterior foi restaurado.');
          }
        }

      } catch (error) {
        console.error(error);
        toast.error('Erro ao carregar a pesquisa. Verifique o link e tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSurvey();
  }, [surveyId, STORAGE_KEY]);

  // 2. Salvar progresso localmente (Auto-save)
  useEffect(() => {
    if (!surveyId || answers.length === 0) return;

    const progressData = {
      answers,
      currentQuestionIndex,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
    setLastSaved(new Date());
  }, [answers, currentQuestionIndex, surveyId, STORAGE_KEY]);


  // Helpers de Navegação e Resposta
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const getCurrentAnswer = () => {
    return answers.find(a => a.questionId === currentQuestion?.id)?.value || '';
  };

  const setCurrentAnswer = (value: string | number) => {
    if (!currentQuestion) return;

    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === currentQuestion.id);
      if (existing) {
        return prev.map(a =>
          a.questionId === currentQuestion.id ? { ...a, value } : a
        );
      } else {
        return [...prev, { questionId: currentQuestion.id, value }];
      }
    });
  };

  const canProceed = () => {
    if (!currentQuestion?.is_required) return true;
    const answer = getCurrentAnswer();
    return answer !== '' && answer !== undefined && answer !== null;
  };

  const handleNext = async () => {
    if (!canProceed()) {
      toast.error('Esta pergunta é obrigatória');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      await handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // 3. Envio Final (Integração corrigida com submit.ts)
  const handleComplete = async () => {
    if (!surveyId) return;

    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
    setIsSubmitting(true);

    try {
      // POST para o endpoint público definido em routes.ts
      await api.post(`/public/surveys/${surveyId}/responses`, {
        timeSpent: timeSpentSeconds,
        answers: answers
      });

      // Limpa o storage após sucesso
      localStorage.removeItem(STORAGE_KEY);
      setIsCompleted(true);
      toast.success('Pesquisa enviada com sucesso! Obrigado.');
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro ao enviar suas respostas. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderização dos Inputs
  const renderQuestionInput = () => {
    if (!currentQuestion) return null;
    const currentAnswer = getCurrentAnswer();

    switch (currentQuestion.question_type) {
      case 'rating':
        const maxRating = currentQuestion.max_rating || 5;
        return (
          <div className="space-y-4">
            <div className="flex justify-center space-x-2 sm:space-x-4">
              {Array.from({ length: maxRating }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentAnswer(num)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center text-lg font-semibold transition-all ${
                    currentAnswer === num
                      ? 'bg-primary text-primary-foreground border-primary shadow-glow'
                      : 'border-primary/20 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground px-2">
              <span>Muito ruim</span>
              <span>Excelente</span>
            </div>
          </div>
        );

      case 'nps':
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentAnswer(i)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded border-2 flex items-center justify-center text-sm font-semibold transition-all ${
                    currentAnswer === i
                      ? 'bg-primary text-primary-foreground border-primary shadow-card'
                      : 'border-primary/20 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground px-2">
              <span>Não recomendaria</span>
              <span>Recomendaria muito</span>
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option: any) => (
              <button
                key={option.id}
                // Importante: O backend aceita string no value. Enviamos o texto da opção.
                onClick={() => setCurrentAnswer(option.option_text)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  currentAnswer === option.option_text
                    ? 'bg-primary/5 border-primary text-primary font-medium'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                {option.option_text}
              </button>
            ))}
          </div>
        );

      case 'short_text':
        return (
          <Input
            value={currentAnswer as string}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Digite sua resposta..."
            className="text-lg p-4"
          />
        );

      case 'long_text':
        return (
          <Textarea
            value={currentAnswer as string}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Compartilhe sua opinião..."
            rows={4}
            className="text-base p-4"
          />
        );

      default:
        return <p className="text-red-500">Tipo de pergunta desconhecido</p>;
    }
  };

  // Estados de Carregamento e Conclusão
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="flex flex-col items-center gap-2">
           <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
           <p className="text-muted-foreground">Carregando pesquisa...</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
        <Card className="w-full max-w-md shadow-card-hover text-center animate-in zoom-in-95 duration-300">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-success/10 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Obrigado!
            </h2>
            <p className="text-muted-foreground mb-6">
              Sua resposta foi enviada com sucesso. Agradecemos seu tempo e feedback.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="p-6">
            <p className="text-muted-foreground">Esta pesquisa não possui perguntas ou não foi encontrada.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 mt-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">{surveyTitle}</h1>
          <p className="text-muted-foreground">
            Pergunta {currentQuestionIndex + 1} de {questions.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Auto-save indicator */}
        {lastSaved && (
          <div className="flex items-center justify-center gap-2 mb-4 text-xs text-muted-foreground/70">
            <Save className="h-3 w-3" />
            <span>
              Salvo às {lastSaved.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}

        {/* Question Card */}
        <Card className="shadow-card-hover mb-8 animate-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="text-xl text-center leading-relaxed">
              {currentQuestion.question_text}
            </CardTitle>
            {currentQuestion.is_required && (
              <CardDescription className="text-center text-destructive/80 font-medium">
                * Obrigatória
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            {renderQuestionInput()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0 || isSubmitting}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center min-w-[120px] justify-center"
          >
            {currentQuestionIndex === questions.length - 1 ? (
              isSubmitting ? (
                 <>Enviando...</> 
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar
                </>
              )
            ) : (
              <>
                Próxima
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublicSurvey;