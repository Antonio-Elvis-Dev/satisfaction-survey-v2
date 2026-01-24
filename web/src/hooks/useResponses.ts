import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export const useResponses = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitResponse = async (surveyId: string, answers: Record<string, any>, timeSeconds: number) => {
    setIsSubmitting(true);
    try {
      // Formatamos as respostas para o formato que o backend espera
      // O frontend geralmente tem um objeto { "question_id": "resposta" }
      // O backend espera um array: [ { questionId: "...", value: "..." } ]
      
      const responsesArray = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value
      }));

      await api.post(`/public/surveys/${surveyId}/responses`, {
        answers: responsesArray,
        timeSpentSeconds: timeSeconds
      });

      toast.success('Obrigado! Sua resposta foi enviada.');
      return true;

    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Erro ao enviar resposta. Tente novamente.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitResponse,
    isSubmitting
  };
};