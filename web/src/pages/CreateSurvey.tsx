import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  GripVertical,
  Type,
  CheckSquare,
  Star,
  Hash,
  MessageCircle,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { useSurveys } from '@/hooks/useSurveys';
import { useQuestions } from '@/hooks/useQuestions';
import { z } from 'zod';
import { SortableQuestion } from '@/components/SortableQuestion';

// Validation schemas
const surveySchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(200, "O título deve ter no máximo 200 caracteres"),
  description: z.string().max(500, "A descrição deve ter no máximo 500 caracteres").optional(),
});

const questionSchema = z.object({
  title: z.string().min(3, "A pergunta deve ter pelo menos 3 caracteres").max(300, "A pergunta deve ter no máximo 300 caracteres"),
  type: z.enum(["short_text", "multiple_choice", "rating", "nps", "long_text"]),
  options: z.array(z.string().min(1, "A opção não pode estar vazia")).optional(),
});

interface Question {
  id: string;
  type: 'short_text' | 'multiple_choice' | 'rating' | 'nps' | 'long_text';
  title: string;
  required: boolean;
  options?: string[];
}

const CreateSurvey = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const { createSurvey, updateSurvey } = useSurveys();
  const { createQuestion, createQuestionOption } = useQuestions();
  
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Load survey for editing
  useEffect(() => {
    const loadSurvey = async () => {
      if (!editId) return;
      
      setIsLoadingSurvey(true);
      try {
       

        

        // Map question types
        const typeMap: Record<string, Question['type']> = {
          'text': 'short_text',
          'multiple_choice': 'multiple_choice',
          'rating': 'rating',
          'nps': 'nps'
        };

        

      } catch (error: any) {
        toast.error('Erro ao carregar pesquisa: ' + error.message);
        navigate('/surveys');
      } finally {
        setIsLoadingSurvey(false);
      }
    };

    loadSurvey();
  }, [editId, navigate]);

  const questionTypes = [
    { value: 'short_text', label: 'Resposta Curta', icon: Type },
    { value: 'multiple_choice', label: 'Múltipla Escolha', icon: CheckSquare },
    { value: 'rating', label: 'Escala 1-5', icon: Star },
    { value: 'nps', label: 'NPS (0-10)', icon: Hash },
    { value: 'long_text', label: 'Campo Aberto', icon: MessageCircle },
  ];

  const addQuestion = (type: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: type as Question['type'],
      title: '',
      required: false,
      options: type === 'multiple_choice' ? ['Opção 1', 'Opção 2'] : undefined
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options, `Opção ${question.options.length + 1}`];
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

 const handleSave = async () => {
    // 1. Validações Zod (mantém as que já tens)
    try {
      surveySchema.parse({ title: surveyTitle, description: surveyDescription });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    if (questions.length === 0) {
      toast.error('Adicione pelo menos uma pergunta');
      return;
    }

    // ... (validações das perguntas continuam aqui) ...

    setIsSaving(true);
    
    try {
        // 2. Mapeamento de Dados (O segredo para resolver o erro de tipo!) 🗝️
        const surveyPayload = {
            title: surveyTitle,
            description: surveyDescription || null,
            // Transformamos cada pergunta do state para o formato da API
            questions: questions.map((q, index) => ({
                title: q.title,
                type: q.type, 
                is_required: q.required, 
                order_index: index,      
                options: q.type === 'multiple_choice' ? q.options : []
            }))
        };

        if (editId) {
            toast.info("Edição em breve...");
        } else {
            // Agora passamos o objeto transformado (surveyPayload), não o state bruto
            await createSurvey.mutateAsync(surveyPayload);
        }

        navigate('/surveys');
    } catch (error: any) {
      console.error('Error saving survey:', error);
      // O toast de erro já é tratado no hook useSurveys
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (questions.length === 0) {
      toast.error('Adicione pelo menos uma pergunta para visualizar');
      return;
    }
    navigate('/survey/preview', { state: { questions, title: surveyTitle } });
  };

  const getQuestionTypeIcon = (type: string) => {
    const typeConfig = questionTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : Type;
  };

  if (isLoadingSurvey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {editId ? 'Editar Pesquisa' : 'Criar Pesquisa'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {editId ? 'Atualize sua pesquisa de satisfação' : 'Monte sua pesquisa de satisfação personalizada'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Survey Info */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Informações da Pesquisa</CardTitle>
          <CardDescription>
            Configure o título e descrição da sua pesquisa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Pesquisa</Label>
            <Input
              id="title"
              placeholder="Ex: Pesquisa de Satisfação do Cliente"
              value={surveyTitle}
              onChange={(e) => setSurveyTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o objetivo da sua pesquisa..."
              value={surveyDescription}
              onChange={(e) => setSurveyDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Perguntas ({questions.length})
          </h2>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map(q => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((question, index) => {
              const IconComponent = getQuestionTypeIcon(question.type);
              const typeLabel = questionTypes.find(t => t.value === question.type)?.label || '';
              
              return (
                <SortableQuestion
                  key={question.id}
                  question={question}
                  index={index}
                  icon={IconComponent}
                  typeLabel={typeLabel}
                  onUpdate={updateQuestion}
                  onRemove={removeQuestion}
                  onAddOption={addOption}
                  onRemoveOption={removeOption}
                  onUpdateOption={updateOption}
                />
              );
            })}
          </SortableContext>
        </DndContext>

        {/* Add Question */}
        <Card className="shadow-card border-dashed">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-foreground mb-4">
                Adicionar Nova Pergunta
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {questionTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant="outline"
                    onClick={() => addQuestion(type.value)}
                    className="h-auto p-4 flex flex-col space-y-2"
                  >
                    <type.icon className="h-6 w-6 text-primary" />
                    <span className="text-xs text-center">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateSurvey;
