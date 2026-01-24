import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuestions } from '@/hooks/useQuestions'; 
import { api } from '@/lib/api'; // Importando api diretamente para o submit

interface Answer {
  questionId: string;
  value: string | number;
}

const SurveyApplication = () => {
  const navigate = useNavigate();
  const { id: surveyId } = useParams<{ id: string }>();
  
  // Assumindo que useQuestions retorna { survey, questions } ou similar
  const { questions: questionsData, isLoading } = useQuestions(surveyId);
  
  const [startTime] = useState(Date.now());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalização segura dos dados
  const questions = questionsData || [];
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

  const handleNext = () => {
    if (!canProceed()) {
      toast.error('Esta pergunta é obrigatória');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!surveyId) return;

    // Cálculo do tempo gasto
    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
    
    setIsSubmitting(true);
    try {
      // Envio único para o endpoint bulk que está no seu Controller submit.ts
      await api.post(`/surveys/${surveyId}/submit`, {
        timeSpent: timeSpentSeconds,
        answers: answers
      });

      setIsCompleted(true);
      toast.success('Pesquisa enviada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar pesquisa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;
    const currentAnswer = getCurrentAnswer();

    // Verificação de segurança para options (prisma retorna 'options', frontend as vezes espera 'question_options')
    const options = currentQuestion.options || currentQuestion.question_options || [];

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
                  className={`w-8 h-8 sm:h-10 sm:w-10 rounded border-2 flex items-center justify-center text-sm font-semibold transition-all ${
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
            {options.map((option: any) => (
              <button
                key={option.id}
                onClick={() => setCurrentAnswer(option.option_text)} // O backend espera o valor/texto ou ID? O controller aceita string. Vamos mandar o texto.
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
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <p className="text-muted-foreground">Carregando pesquisa...</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
        <Card className="w-full max-w-md shadow-card-hover text-center">
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
              Sua resposta foi enviada com sucesso.
            </p>
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="default" 
              className="w-full"
            >
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <p className="text-muted-foreground">Nenhuma pergunta encontrada ou pesquisa inválida.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 mt-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Pesquisa de Satisfação</h1>
          <p className="text-muted-foreground">
            Pergunta {currentQuestionIndex + 1} de {questions.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="shadow-card-hover mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              {currentQuestion.question_text}
            </CardTitle>
            {currentQuestion.is_required && (
              <CardDescription className="text-center text-destructive/80">
                * Obrigatória
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-8">
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
            className="flex items-center"
          >
            {currentQuestionIndex === questions.length - 1 ? (
              isSubmitting ? 'Enviando...' : (
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

export default SurveyApplication;