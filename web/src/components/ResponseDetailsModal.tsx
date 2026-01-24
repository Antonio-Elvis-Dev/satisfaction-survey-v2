import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar } from "lucide-react";

interface Answer {
  question_text: string;
  question_type: string;
  numeric_response?: number;
  text_response?: string;
  selected_option_text?: string;
}

interface ResponseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: {
    id: string;
    date: Date;
    answers: Answer[];
  } | null;
}

export function ResponseDetailsModal({ isOpen, onClose, sessionData }: ResponseDetailsModalProps) {
  if (!sessionData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalhes da Resposta</DialogTitle>
          <DialogDescription className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(sessionData.date).toLocaleDateString('pt-BR')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(sessionData.date).toLocaleTimeString('pt-BR')}
            </span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 mt-4">
          <div className="space-y-6 pb-6">
            {sessionData.answers.map((answer, idx) => (
              <div key={idx} className="space-y-2 border-b border-border pb-4 last:border-0">
                <h4 className="font-medium text-sm text-muted-foreground">
                  {idx + 1}. {answer.question_text}
                </h4>
                
                <div className="pl-4">
                  {/* Lógica de Exibição baseada no tipo */}
                  {answer.text_response && (
                    <p className="text-foreground bg-muted/30 p-3 rounded-md italic">
                      "{answer.text_response}"
                    </p>
                  )}

                  {answer.numeric_response !== null && answer.numeric_response !== undefined && (
                    <div className="flex items-center gap-2">
                      <Badge variant={answer.numeric_response >= 9 ? "success" : answer.numeric_response <= 6 ? "destructive" : "secondary"}>
                        Nota: {answer.numeric_response}
                      </Badge>
                      {['nps', 'rating'].includes(answer.question_type) && (
                        <span className="text-xs text-muted-foreground">
                          (Escala {answer.question_type === 'nps' ? '0-10' : '1-5'})
                        </span>
                      )}
                    </div>
                  )}

                  {answer.selected_option_text && (
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {answer.selected_option_text}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}