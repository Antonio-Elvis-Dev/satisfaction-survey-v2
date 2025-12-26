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
import { supabase } from '@/integrations/supabase/client';
import { useSurveys } from '@/hooks/useSurveys';
import { api } from '@/lib/api';

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  is_required: boolean;
  max_rating?: number;
  question_options?: Array<{ id: string; option_text: string; order_index: number }>;
}

interface Answer {
  questionId: string;
  value: string | number;
}

const PublicSurvey = () => {
  const { id: surveyId } = useParams<{ id: string }>();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState('Pesquisa de Satisfação');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const STORAGE_KEY = `survey_progress_${surveyId}`;


  const { } = useSurveys()

  // Load saved progress from localStorage
  useEffect(() => {
    const loadSurvey = async () => {
      if (!surveyId) return

      try {
        const response = await api.get(`/public/surveys/${surveyId}`);
        const surveyData = response.data.survey;

        setSurveyTitle(surveyData.title);

        // Mapeia perguntas (o backend já manda ordenado!)
        const loadedQuestions = surveyData.question.map((q: any) => ({
          id: q.id,
          question_type: q.question_type,
          question_text: q.question_text,
          is_required: q.is_required,
          max_rating: q.max_rating,
          // Mapeia opções
          question_options: q.options?.map((opt: any) => ({
            id: opt.id,
            option_text: opt.option_text,
            order_index: opt.order_index
          }))
        }));

        setQuestions(loadedQuestions);
      } catch (error) {
        toast.error('Erro ao carregar pesquisa');
      } finally {
        setIsLoading(false);
      }
    };

    loadSurvey();
  }, [surveyId]);

  // Save progress to localStorage whenever answers or question index changes
  useEffect(() => {
    if (!surveyId || answers.length === 0) return;

    try {
      const progressData = {
        answers,
        currentQuestionIndex,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [answers, currentQuestionIndex, surveyId, STORAGE_KEY]);

  useEffect(() => {
    const loadSurvey = async () => {
      if (!surveyId) return;

      try {
        // Load survey details
        const { data: surveyData, error: surveyError } = await supabase
          .from('surveys')
          .select('title, status')
          .eq('id', surveyId)
          .single();

        if (surveyError) throw surveyError;

        if (surveyData.status !== 'active') {
          toast.error('Esta pesquisa não está disponível no momento');
          return;
        }

        setSurveyTitle(surveyData.title);

        // Load questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select(`
            *,
            question_options (*)
          `)
          .eq('survey_id', surveyId)
          .order('order_index');

        if (questionsError) throw questionsError;

        setQuestions(questionsData || []);

        // Create anonymous session
        let { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          const { error: anonErr } = await supabase.auth.signInAnonymously();
          if (anonErr) throw anonErr;

          ({ data: { session } } = await supabase.auth.getSession());

        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user?.id) throw new Error("Usuário anônimo não autenticado!");

        const { data: sessionRow, error: sessionError } = await supabase
          .from('response_sessions')
          .insert({
            survey_id: surveyId,
            respondent_id: user.id,
          })
        // .select()
        // .single();

        if (sessionError) throw sessionError;

        const { data: sessionList, error: listErr } = await supabase
          .from('response_sessions')
          .select('id')
          .eq('survey_id', surveyId)
          .eq('respondent_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (listErr) throw listErr;
        setSessionId(sessionList?.[0]?.id);
      } catch (error: any) {
        console.error('Error loading survey:', error);
        toast.error('Erro ao carregar pesquisa');
      } finally {
        setIsLoading(false);
      }
    };

    loadSurvey();
  }, [surveyId]);

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
    return answer !== '' && answer !== undefined;
  };

  const saveCurrentAnswer = async () => {
    if (!sessionId || !currentQuestion) return;

    const answer = getCurrentAnswer();
    if (answer === '' || answer === undefined) return;

    try {
      let selectedOptionId = null;
      if (currentQuestion.question_type === 'multiple_choice') {
        const option = currentQuestion.question_options?.find(
          (opt: any) => opt.option_text === answer
        );
        selectedOptionId = option?.id || null;
      }

      await supabase.from('responses').insert({
        session_id: sessionId,
        question_id: currentQuestion.id,
        numeric_response: typeof answer === 'number' ? answer : null,
        text_response: typeof answer === 'string' ? answer : null,
        selected_option_id: selectedOptionId,
      });
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const handleNext = async () => {
    if (!canProceed()) {
      toast.error('Esta pergunta é obrigatória');
      return;
    }

    await saveCurrentAnswer();

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

  const handleComplete = async () => {
    if (!sessionId) return;

    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);

    try {
      await supabase
        .from('response_sessions')
        .update({
          is_complete: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpentSeconds,
        })
        .eq('id', sessionId);

      // Clear saved progress after successful completion
      localStorage.removeItem(STORAGE_KEY);

      setIsCompleted(true);
      toast.success('Pesquisa enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao finalizar pesquisa');
    }
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;
    const currentAnswer = getCurrentAnswer();

    switch (currentQuestion.question_type) {
      case 'rating':
        const maxRating = currentQuestion.max_rating || 5;
        return (
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              {Array.from({ length: maxRating }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentAnswer(num)}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-semibold transition-all ${currentAnswer === num
                    ? 'bg-primary text-primary-foreground border-primary shadow-glow'
                    : 'border-primary/20 hover:border-primary/50 hover:bg-primary/5'
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Muito ruim</span>
              <span>Excelente</span>
            </div>
          </div>
        );

      case 'nps':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-11 gap-2">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentAnswer(i)}
                  className={`h-10 rounded border-2 flex items-center justify-center text-sm font-semibold transition-all ${currentAnswer === i
                    ? 'bg-primary text-primary-foreground border-primary shadow-card'
                    : 'border-primary/20 hover:border-primary/50 hover:bg-primary/5'
                    }`}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Não recomendaria</span>
              <span>Recomendaria muito</span>
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {currentQuestion.question_options?.map((option: any) => (
              <button
                key={option.id}
                onClick={() => setCurrentAnswer(option.option_text)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${currentAnswer === option.option_text
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
        <p className="text-muted-foreground">Carregando...</p>
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
              Sua resposta foi enviada com sucesso. Seu feedback é muito importante para nós.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <p className="text-muted-foreground">Nenhuma pergunta encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">{surveyTitle}</h1>
          <p className="text-muted-foreground">
            Pergunta {currentQuestionIndex + 1} de {questions.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Início</span>
            <span>{Math.round(progress)}% concluído</span>
            <span>Fim</span>
          </div>
        </div>

        {/* Auto-save indicator */}
        {lastSaved && (
          <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
            <Save className="h-4 w-4" />
            <span>
              Progresso salvo automaticamente às {lastSaved.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}

        {/* Question Card */}
        <Card className="shadow-card-hover mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              {currentQuestion.question_text}
            </CardTitle>
            {currentQuestion.is_required && (
              <CardDescription className="text-center">
                * Esta pergunta é obrigatória
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
            disabled={currentQuestionIndex === 0}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            className="flex items-center"
          >
            {currentQuestionIndex === questions.length - 1 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar
              </>
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
