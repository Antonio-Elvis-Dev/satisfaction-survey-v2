import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Eye, Copy } from 'lucide-react';
import { useSurveys } from '@/hooks/useSurveys';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const PreviewSurvey = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const surveyId = searchParams.get('id');

  const { surveys, getSurveyById } = useSurveys();

  const [survey, setSurvey] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string | number>>({});


  useEffect(() => {
    const loadSurvey = async () => {
      if (!surveyId) return;
      setIsLoading(true);
      try {
        const data = await getSurveyById(surveyId);
        setSurvey(data);

        // Mapeia e ordena as perguntas
        const mappedQuestions = data.question ? data.question.map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          is_required: q.is_required,
          max_rating: q.max_rating,
          max_length: q.max_length,
          order_index: q.order_index,
          question_options: q.options
            ? q.options.sort((a: any, b: any) => a.order_index - b.order_index)
            : []
        })) : [];

        mappedQuestions.sort((a: any, b: any) => a.order_index - b.order_index);
        setQuestions(mappedQuestions);
      } catch (error) {
        console.error("Erro ao carregar preview", error);
        toast.error("Erro ao carregar pesquisa");
      } finally {
        setIsLoading(false);
      }
    };

    loadSurvey();
  }, [surveyId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando pré-visualização...</p>
      </div>
    );
  }

  if (!survey || !questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Pesquisa não encontrada ou sem perguntas</p>
          <Button onClick={() => navigate('/surveys')}>Voltar para Pesquisas</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getCurrentAnswer = () => {
    return previewAnswers[currentQuestion.id] || '';
  };

  const setCurrentAnswer = (value: string | number) => {
    setPreviewAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleCopyPreviewLink = () => {
    const link = `${window.location.origin}/survey/preview?id=${surveyId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link de preview copiado');
  };

  const renderQuestionInput = () => {
    switch (currentQuestion.question_type) {
      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {Array.from({ length: currentQuestion.max_rating || 5 }, (_, i) => i + 1).map((rating) => (
                <Button
                  key={rating}
                  variant={getCurrentAnswer() === rating ? 'default' : 'outline'}
                  className="w-12 h-12 rounded-full"
                  onClick={() => setCurrentAnswer(rating)}
                >
                  {rating}
                </Button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Muito insatisfeito</span>
              <span>Muito satisfeito</span>
            </div>
          </div>
        );

      case 'nps':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-11 gap-2">
              {Array.from({ length: 11 }, (_, i) => i).map((score) => (
                <Button
                  key={score}
                  variant={getCurrentAnswer() === score ? 'default' : 'outline'}
                  className="aspect-square"
                  onClick={() => setCurrentAnswer(score)}
                >
                  {score}
                </Button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Nada provável</span>
              <span>Muito provável</span>
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <RadioGroup
            value={getCurrentAnswer()?.toString()}
            onValueChange={(value) => setCurrentAnswer(value)}
          >
            <div className="space-y-3">
              {currentQuestion.question_options?.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.option_text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'short_text':
        return (
          <Input
            placeholder="Digite sua resposta..."
            value={getCurrentAnswer() as string}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            maxLength={currentQuestion.max_length || undefined}
          />
        );

      case 'long_text':
        return (
          <Textarea
            placeholder="Digite sua resposta..."
            value={getCurrentAnswer() as string}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            rows={6}
            maxLength={currentQuestion.max_length || undefined}
          />
        );

      default:
        return <p className="text-muted-foreground">Tipo de pergunta não suportado</p>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/surveys')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Badge variant="outline" className="flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            Modo Pré-visualização
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopyPreviewLink}>
          <Copy className="h-4 w-4 mr-2" />
          Copiar Link
        </Button>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl">{survey.title}</CardTitle>
          {survey.description && (
            <CardDescription className="text-base">{survey.description}</CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Progress */}
      {survey.show_progress_bar && (
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Questão {currentQuestionIndex + 1} de {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="text-lg">
              {currentQuestion.question_text}
            </span>
            {currentQuestion.is_required && (
              <span className="text-destructive ml-2">*</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderQuestionInput()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <Button
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          {currentQuestionIndex === questions.length - 1 ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar Preview
            </>
          ) : (
            <>
              Próxima
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Preview Notice */}
      <Card className="shadow-card border-warning bg-warning/5">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            <Eye className="h-4 w-4 inline mr-2" />
            Este é um modo de pré-visualização. As respostas não serão salvas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviewSurvey;
