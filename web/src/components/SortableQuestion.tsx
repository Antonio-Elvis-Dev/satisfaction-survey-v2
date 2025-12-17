import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Trash2, Plus } from 'lucide-react';

interface Question {
  id: string;
  type: 'short_text' | 'multiple_choice' | 'rating' | 'nps' | 'long_text';
  title: string;
  required: boolean;
  options?: string[];
}

interface SortableQuestionProps {
  question: Question;
  index: number;
  icon: React.ComponentType<{ className?: string }>;
  typeLabel: string;
  onUpdate: (id: string, updates: Partial<Question>) => void;
  onRemove: (id: string) => void;
  onAddOption: (questionId: string) => void;
  onRemoveOption: (questionId: string, optionIndex: number) => void;
  onUpdateOption: (questionId: string, optionIndex: number, value: string) => void;
}

export const SortableQuestion = ({
  question,
  index,
  icon: IconComponent,
  typeLabel,
  onUpdate,
  onRemove,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
}: SortableQuestionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <Badge variant="outline" className="flex items-center space-x-1">
              <IconComponent className="h-3 w-3" />
              <span>{typeLabel}</span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              Pergunta {index + 1}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onRemove(question.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Pergunta</Label>
          <Input
            placeholder="Digite sua pergunta..."
            value={question.title}
            onChange={(e) => onUpdate(question.id, { title: e.target.value })}
          />
        </div>

        {/* Multiple Choice Options */}
        {question.type === 'multiple_choice' && question.options && (
          <div className="space-y-2">
            <Label>Opções de Resposta</Label>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => onUpdateOption(question.id, optionIndex, e.target.value)}
                    placeholder={`Opção ${optionIndex + 1}`}
                  />
                  {question.options!.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveOption(question.id, optionIndex)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddOption(question.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Opção
              </Button>
            </div>
          </div>
        )}

        {/* Scale Preview */}
        {question.type === 'rating' && (
          <div className="space-y-2">
            <Label>Preview da Escala</Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex flex-col items-center space-y-1">
                  <div className="w-8 h-8 rounded-full border-2 border-primary/20 flex items-center justify-center text-sm">
                    {num}
                  </div>
                  {num === 1 && <span className="text-xs text-muted-foreground">Ruim</span>}
                  {num === 5 && <span className="text-xs text-muted-foreground">Ótimo</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NPS Preview */}
        {question.type === 'nps' && (
          <div className="space-y-2">
            <Label>Preview NPS</Label>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Detratores (0-6)</span>
              <span className="text-xs text-muted-foreground">Neutros (7-8)</span>
              <span className="text-xs text-muted-foreground">Promotores (9-10)</span>
            </div>
            <div className="flex items-center space-x-1">
              {[...Array(11)].map((_, num) => (
                <div key={num} className="flex-1 h-8 rounded border-2 border-primary/20 flex items-center justify-center text-xs">
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Required Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`required-${question.id}`}
            checked={question.required}
            onChange={(e) => onUpdate(question.id, { required: e.target.checked })}
            className="rounded border-gray-300"
          />
          <Label htmlFor={`required-${question.id}`} className="text-sm">
            Pergunta obrigatória
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
